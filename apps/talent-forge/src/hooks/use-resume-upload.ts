import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  uploadSingleResume,
  uploadMultipleResumes,
  processResume,
  processBatchResumes,
  getResumeStatus,
  getParsedResume,
  downloadResume,
  downloadFile,
  listResumes,
  HistoryUnavailableError,
  listResumeShares,
  shareResume,
  revokeResumeShare,
  type DownloadFormat,
  type ResumeJob,
  type ResumeShare,
  type ParsedResume,
} from '@/services/resume-api';
import { toast } from 'sonner';

const historyKey = ['resume-history'] as const;

export function useResumeJobs() {
  const queryClient = useQueryClient();
  const history = useQuery({
    queryKey: historyKey,
    queryFn: listResumes,
    retry: (failureCount, error) => !(error instanceof HistoryUnavailableError) && failureCount < 2,
  });

  const setJobs = (updater: ResumeJob[] | ((prev: ResumeJob[]) => ResumeJob[])) => {
    queryClient.setQueryData(historyKey, (prev: ResumeJob[] | undefined) => {
      const current = prev ?? [];
      return typeof updater === 'function' ? updater(current) : updater;
    });
  };

  return {
    jobs: history.data ?? [],
    setJobs,
    isLoading: history.isPending,
    historyUnavailable: history.error instanceof HistoryUnavailableError,
    error:
      history.error instanceof HistoryUnavailableError || !(history.error instanceof Error)
        ? null
        : history.error,
  };
}

export function useUploadResumes() {
  const { setJobs } = useResumeJobs();

  return useMutation({
    mutationFn: async (files: File[]) => {
      if (files.length === 1) {
        return [await uploadSingleResume(files[0])];
      }
      return uploadMultipleResumes(files);
    },
    onSuccess: (newJobs: ResumeJob[]) => {
      setJobs((prev: ResumeJob[]) => [...prev, ...newJobs]);
      toast.success(`${newJobs.length} resume${newJobs.length > 1 ? 's' : ''} uploaded successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Upload failed');
    },
  });
}

export function useProcessResumes() {
  const { setJobs } = useResumeJobs();

  return useMutation({
    mutationFn: async (resumeIds: string[]) => {
      if (resumeIds.length === 1) {
        return [await processResume(resumeIds[0])];
      }
      return processBatchResumes(resumeIds);
    },
    onSuccess: (updatedJobs: ResumeJob[]) => {
      // Update jobs to 'processing' status immediately
      setJobs((prev: ResumeJob[]) =>
        prev.map((job: ResumeJob) => {
          const updated = updatedJobs.find((u: ResumeJob) => u.resume_id === job.resume_id);
          if (updated) {
            return { ...job, status: 'processing' as const };
          }
          return job;
        })
      );
      toast.success('Processing started! This may take a moment...');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Processing failed');
    },
  });
}

interface PollingResult {
  statuses: ResumeJob[];
  stillProcessing: boolean;
}

export function useResumeStatusPolling(jobs: ResumeJob[], setJobs: (fn: (prev: ResumeJob[]) => ResumeJob[]) => void) {
  // Find all jobs that are processing
  const processingJobs = jobs.filter((job: ResumeJob) => job.status === 'processing');

  return useQuery<PollingResult | null>({
    queryKey: ['resume-status-polling', processingJobs.map((j: ResumeJob) => j.resume_id).join(',')],
    queryFn: async (): Promise<PollingResult | null> => {
      if (processingJobs.length === 0) return null;
      
      // Poll status for all processing jobs
      const statusPromises = processingJobs.map((job: ResumeJob) => getResumeStatus(job.resume_id));
      const statuses = await Promise.all(statusPromises);
      
      // Update local state with new statuses
      setJobs((prev: ResumeJob[]) =>
        prev.map((job: ResumeJob) => {
          const newStatus = statuses.find((s: ResumeJob) => s.resume_id === job.resume_id);
          if (newStatus) {
            return { ...job, ...newStatus, role: newStatus.role ?? job.role };
          }
          return job;
        })
      );
      
      // Check if any are still processing
      const stillProcessing = statuses.some((s: ResumeJob) => s.status === 'processing');
      return { statuses, stillProcessing };
    },
    enabled: processingJobs.length > 0,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.stillProcessing) return 2000; // Poll every 2 seconds
      return false;
    },
  });
}

export function useDownloadResume(format: DownloadFormat) {
  return useMutation({
    mutationFn: async (job: ResumeJob) => {
      const blob = await downloadResume(job, format);
      downloadFile(blob, job.filename, format);
    },
    onSuccess: () => {
      toast.success(`${format.toUpperCase()} download started!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Download failed');
    },
  });
}

export function useResumeShares(resumeId: string | null) {
  return useQuery<ResumeShare[]>({
    queryKey: ['resume-shares', resumeId],
    queryFn: () => listResumeShares(resumeId!),
    enabled: !!resumeId,
  });
}

export function useShareResume(resumeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => shareResume(resumeId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume-shares', resumeId] });
      queryClient.invalidateQueries({ queryKey: historyKey });
      toast.success('Resume shared');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not share this resume');
    },
  });
}

export function useRevokeShare(resumeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shareId: number) => revokeResumeShare(resumeId, shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume-shares', resumeId] });
      queryClient.invalidateQueries({ queryKey: historyKey });
      toast.success('Access removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not remove access');
    },
  });
}

export function useParsedResume(resumeId: string | null) {
  return useQuery<ParsedResume | null>({
    queryKey: ['parsed-resume', resumeId],
    queryFn: async (): Promise<ParsedResume | null> => {
      if (!resumeId) return null;
      return getParsedResume(resumeId);
    },
    enabled: !!resumeId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}