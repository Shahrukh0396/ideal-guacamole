import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  uploadSingleResume,
  uploadMultipleResumes,
  processResume,
  processBatchResumes,
  getResumeStatus,
  getParsedResume,
  downloadResume,
  downloadFile,
  type ResumeJob,
  type ParsedResume,
} from '@/services/resume-api';
import { toast } from 'sonner';

// Persist resume jobs in session storage
const resumeJobsAtom = atomWithStorage<ResumeJob[]>('talentforge-jobs', []);

export function useResumeJobs() {
  const [jobs, setJobs] = useAtom(resumeJobsAtom);
  return { jobs, setJobs };
}

export function useUploadResumes() {
  const { setJobs } = useResumeJobs();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      if (files.length === 1) {
        return [await uploadSingleResume(files[0])];
      }
      return uploadMultipleResumes(files);
    },
    onSuccess: (newJobs: ResumeJob[]) => {
      setJobs((prev: ResumeJob[]) => [...prev, ...newJobs]);
      queryClient.invalidateQueries({ queryKey: ['resume-jobs'] });
      toast.success(`${newJobs.length} resume${newJobs.length > 1 ? 's' : ''} uploaded successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Upload failed');
    },
  });
}

export function useProcessResumes() {
  const { setJobs } = useResumeJobs();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['resume-jobs'] });
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
            return newStatus;
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

export function useDownloadResume() {
  return useMutation({
    mutationFn: async (job: ResumeJob) => {
      const blob = await downloadResume(job);
      downloadFile(blob, job.filename);
    },
    onSuccess: () => {
      toast.success('Download started!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Download failed');
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