import { apiFetch } from '@/auth/api';

function apiHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  return headers;
}

async function throwIfNotOk(response: Response, fallback: string): Promise<void> {
  if (response.ok) return;

  let message = `${fallback}: ${response.status} ${response.statusText}`;
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      const messages = data.detail
        .map((item: { msg?: string }) => item.msg)
        .filter((msg: string | undefined): msg is string => Boolean(msg));
      if (messages.length > 0) message = messages.join('; ');
    } else if (typeof data?.message === 'string') {
      message = data.message;
    }
  } catch {
    // Keep the status fallback when the body is not JSON.
  }

  throw new Error(message);
}

export type ResumeStatus = 'uploaded' | 'processing' | 'completed' | 'failed';
export type DownloadFormat = 'docx' | 'pdf';

export interface ResumeJob {
  resume_id: string;
  filename: string;
  status: ResumeStatus;
  submitted_at?: string;
  processing_started_at?: string | null;
  completed_at?: string | null;
  raw_blob_path?: string;
  parsed_json_blob_path?: string | null;
  generated_docx_blob_path?: string | null;
  generated_pdf_blob_path?: string | null;
  docx_download_url?: string | null;
  pdf_download_url?: string | null;
  error_message?: string | null;
  role?: 'owner' | 'viewer';
}

export interface ResumeShare {
  id: number;
  email: string | null;
  created_at: string;
}

// Normalize status from API (uppercase) to our type (lowercase)
function normalizeStatus(status: string): ResumeStatus {
  const normalized = status.toLowerCase() as ResumeStatus;
  if (['uploaded', 'processing', 'completed', 'failed'].includes(normalized)) {
    return normalized;
  }
  return 'uploaded'; // Default fallback
}

// Normalize a job object from API response
function normalizeJob(job: Record<string, unknown>): ResumeJob {
  return {
    ...job,
    status: normalizeStatus(job.status as string),
  } as ResumeJob;
}

// Parsed resume data structure
export interface ParsedExperience {
  company: string;
  title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  highlights?: string[];
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  field?: string;
  graduation_date?: string;
  gpa?: string;
}

export interface ParsedLanguage {
  language: string;
  proficiency?: string;
}

export interface ParsedResume {
  resume_id: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  summary?: string;
  skills?: string[];
  experience?: ParsedExperience[];
  education?: ParsedEducation[];
  certifications?: string[];
  languages?: (string | ParsedLanguage)[];
}

export class HistoryUnavailableError extends Error {
  constructor() {
    super('Saved history is not available from the server yet.');
    this.name = 'HistoryUnavailableError';
  }
}

export async function listResumes(): Promise<ResumeJob[]> {
  const response = await apiFetch('/resumes', {
    headers: apiHeaders(),
  });
  if (response.status === 404 || response.status === 405) {
    throw new HistoryUnavailableError();
  }
  await throwIfNotOk(response, 'Could not load your resumes');
  const data = await response.json();
  return (data as Record<string, unknown>[]).map(normalizeJob);
}

export async function listResumeShares(resumeId: string): Promise<ResumeShare[]> {
  const response = await apiFetch(`/resumes/${resumeId}/shares`, {
    headers: apiHeaders(),
  });
  await throwIfNotOk(response, 'Could not load shares');
  return response.json();
}

export async function shareResume(resumeId: string, email: string): Promise<ResumeShare> {
  const response = await apiFetch(`/resumes/${resumeId}/share`, {
    method: 'POST',
    headers: apiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email }),
  });
  await throwIfNotOk(response, 'Could not share this resume');
  return response.json();
}

export async function revokeResumeShare(resumeId: string, shareId: number): Promise<void> {
  const response = await apiFetch(`/resumes/${resumeId}/shares/${shareId}`, {
    method: 'DELETE',
    headers: apiHeaders(),
  });
  await throwIfNotOk(response, 'Could not remove access');
}

export async function uploadSingleResume(file: File): Promise<ResumeJob> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiFetch(`/resumes`, {
    method: 'POST',
    headers: apiHeaders(),
    body: formData,
  });

  await throwIfNotOk(response, 'Upload failed');

  const data = await response.json();
  return normalizeJob(data);
}

export async function uploadMultipleResumes(files: File[]): Promise<ResumeJob[]> {
  const formData = new FormData();
  files.forEach((file: File) => {
    formData.append('files', file);
  });

  const response = await apiFetch(`/resumes/batch`, {
    method: 'POST',
    headers: apiHeaders(),
    body: formData,
  });

  await throwIfNotOk(response, 'Batch upload failed');

  const data = await response.json();
  return (data as Record<string, unknown>[]).map(normalizeJob);
}

export async function processResume(resumeId: string): Promise<ResumeJob> {
  const response = await apiFetch(`/resumes/${resumeId}/process`, {
    method: 'POST',
    headers: apiHeaders(),
  });

  await throwIfNotOk(response, 'Processing failed');

  const data = await response.json();
  return normalizeJob(data);
}

export async function processBatchResumes(resumeIds: string[]): Promise<ResumeJob[]> {
  const response = await apiFetch(`/resumes/batch/process`, {
    method: 'POST',
    headers: apiHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ resume_ids: resumeIds }),
  });

  await throwIfNotOk(response, 'Batch processing failed');

  const data = await response.json();
  return (data as Record<string, unknown>[]).map(normalizeJob);
}

export async function getResumeStatus(resumeId: string): Promise<ResumeJob> {
  const response = await apiFetch(`/resumes/${resumeId}`, {
    headers: apiHeaders(),
  });

  await throwIfNotOk(response, 'Status check failed');

  const data = await response.json();
  return normalizeJob(data);
}

export async function getParsedResume(resumeId: string): Promise<ParsedResume> {
  const response = await apiFetch(`/resumes/${resumeId}/parsed`, {
    headers: apiHeaders(),
  });

  await throwIfNotOk(response, 'Failed to fetch parsed data');

  return response.json();
}

const downloadAccept: Record<DownloadFormat, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/octet-stream,*/*',
  pdf: 'application/pdf,application/octet-stream,*/*',
};

export async function downloadResume(job: ResumeJob, format: DownloadFormat): Promise<Blob> {
  const response = await apiFetch(`/resumes/${job.resume_id}/${format}`, {
    method: 'GET',
    headers: apiHeaders({
      Accept: downloadAccept[format],
    }),
  });

  await throwIfNotOk(response, `${format.toUpperCase()} download failed`);

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error('Downloaded file is empty');
  }

  return blob;
}

export function downloadFile(blob: Blob, filename: string, format: DownloadFormat) {
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const formattedFilename = `${baseName}_formatted.${format}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = formattedFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}