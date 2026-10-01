/**
 * React Query hooks for the TalentForge Custom Connector
 * 
 * These hooks provide a clean interface to the connector service
 * with proper caching, loading states, and error handling.
 */

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  uploadResume as connectorUploadResume,
  uploadResumesBatch,
  processResume as connectorProcessResume,
  processResumesBatch,
  getResumeStatus,
  getParsedResume,
  downloadResume as connectorDownloadResume,
  downloadResumeDocx,
  downloadResumePdf,
  downloadFile,
  type ResumeJob,
  type ParsedResume,
  type ResumeStatus,
  type DownloadFormat,
} from '@/services/talent-forge-connector';

// Re-export types for consumers
export type { ResumeJob, ParsedResume, ResumeStatus, DownloadFormat };

// Query keys for cache management
export const resumeKeys = {
  all: ['resumes'] as const,
  status: (resumeId: string) => ['resumes', 'status', resumeId] as const,
  parsed: (resumeId: string) => ['resumes', 'parsed', resumeId] as const,
};

/**
 * Hook to manage the list of resume jobs in local state
 */
export function useResumeJobs() {
  const [jobs, setJobs] = useState<ResumeJob[]>([]);
  return { jobs, setJobs };
}

/**
 * Hook to upload multiple resume files (uses batch endpoint)
 */
export function useUploadResumes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (files: File[]): Promise<ResumeJob[]> => {
      // Use batch endpoint for multiple files
      if (files.length > 1) {
        return uploadResumesBatch(files);
      }
      // Single file - use individual endpoint
      const job = await connectorUploadResume(files[0]);
      return [job];
    },
    onSuccess: (newJobs: ResumeJob[]) => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
      // Update jobs state in caller via onSuccess callback
    },
  });
}

/**
 * Hook to upload a single resume file
 */
export function useUploadResume() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: connectorUploadResume,
    onSuccess: (job: ResumeJob) => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
      queryClient.setQueryData(resumeKeys.status(job.resume_id), job);
    },
  });
}

/**
 * Hook to process multiple resumes by ID (uses batch endpoint)
 */
export function useProcessResumes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (resumeIds: string[]): Promise<ResumeJob[]> => {
      // Use batch endpoint for multiple resumes
      if (resumeIds.length > 1) {
        const jobs = await processResumesBatch(resumeIds);
        for (const job of jobs) {
          queryClient.setQueryData(resumeKeys.status(job.resume_id), job);
        }
        return jobs;
      }
      // Single resume - use individual endpoint
      const job = await connectorProcessResume(resumeIds[0]);
      queryClient.setQueryData(resumeKeys.status(job.resume_id), job);
      return [job];
    },
  });
}

/**
 * Hook to process a single resume
 */
export function useProcessResume() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: connectorProcessResume,
    onSuccess: (job: ResumeJob) => {
      queryClient.setQueryData(resumeKeys.status(job.resume_id), job);
    },
  });
}

/**
 * Hook to poll status for processing jobs and update jobs state
 */
export function useResumeStatusPolling(
  jobs: ResumeJob[],
  setJobs: Dispatch<SetStateAction<ResumeJob[]>>
) {
  const processingJobs = jobs.filter((job: ResumeJob) => job.status === 'PROCESSING');
  
  const pollStatus = useCallback(async () => {
    if (processingJobs.length === 0) return;
    
    for (const job of processingJobs) {
      try {
        const updatedJob = await getResumeStatus(job.resume_id);
        setJobs((prev: ResumeJob[]) =>
          prev.map((j: ResumeJob) =>
            j.resume_id === updatedJob.resume_id ? updatedJob : j
          )
        );
      } catch (error) {
        console.error(`Failed to poll status for ${job.resume_id}:`, error);
        // Mark the job as failed so user can retry
        setJobs((prev: ResumeJob[]) =>
          prev.map((j: ResumeJob) =>
            j.resume_id === job.resume_id
              ? {
                  ...j,
                  status: 'FAILED' as const,
                  error_message: 'Processing failed. The server encountered an error. Please try again.',
                }
              : j
          )
        );
      }
    }
  }, [processingJobs, setJobs]);

  useEffect(() => {
    if (processingJobs.length === 0) return;

    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [processingJobs.length, pollStatus]);
}

/**
 * Hook to get resume status with automatic polling
 */
export function useResumeStatus(
  resumeId: string | null | undefined,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) {
  return useQuery({
    queryKey: resumeKeys.status(resumeId ?? ''),
    queryFn: () => getResumeStatus(resumeId!),
    enabled: !!resumeId && options?.enabled !== false,
    refetchInterval: (query) => {
      const data = query.state.data as ResumeJob | undefined;
      if (data?.status === 'PROCESSING') {
        return options?.refetchInterval ?? 2000;
      }
      return false;
    },
    staleTime: 1000,
  });
}

/**
 * Hook to get parsed resume data
 */
export function useParsedResume(
  resumeId: string | null | undefined,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: resumeKeys.parsed(resumeId ?? ''),
    queryFn: () => getParsedResume(resumeId!),
    enabled: !!resumeId && options?.enabled !== false,
    staleTime: Infinity,
  });
}

/**
 * Hook to download formatted resume (legacy - defaults to DOCX)
 */
export function useDownloadResume() {
  return useMutation({
    mutationFn: async (job: ResumeJob) => {
      const blob = await connectorDownloadResume(job.resume_id);
      downloadFile(blob, job.filename, 'docx');
      return blob;
    },
  });
}

/**
 * Hook to download formatted resume as DOCX
 */
export function useDownloadResumeDocx() {
  return useMutation({
    mutationFn: async (job: ResumeJob) => {
      const blob = await downloadResumeDocx(job.resume_id);
      downloadFile(blob, job.filename, 'docx');
      return blob;
    },
  });
}

/**
 * Hook to download formatted resume as PDF
 */
export function useDownloadResumePdf() {
  return useMutation({
    mutationFn: async (job: ResumeJob) => {
      const blob = await downloadResumePdf(job.resume_id);
      downloadFile(blob, job.filename, 'pdf');
      return blob;
    },
  });
}

/**
 * Combined hook for the full resume processing flow
 */
export function useResumeProcessingFlow() {
  const uploadMutation = useUploadResume();
  const processMutation = useProcessResume();
  
  const uploadAndProcess = async (file: File): Promise<ResumeJob> => {
    const uploadedJob = await uploadMutation.mutateAsync(file);
    const processingJob = await processMutation.mutateAsync(uploadedJob.resume_id);
    return processingJob;
  };
  
  return {
    uploadAndProcess,
    isUploading: uploadMutation.isPending,
    isProcessing: processMutation.isPending,
    isLoading: uploadMutation.isPending || processMutation.isPending,
    error: uploadMutation.error || processMutation.error,
  };
}
