/**
 * TalentForge API Service
 *
 * Direct calls to the Azure App Service.
 * Base URL: https://talentforge-egbqb0adakgxfyhd.centralus-01.azurewebsites.net/api/v1
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE ||
  'https://talentforge-egbqb0adakgxfyhd.centralus-01.azurewebsites.net/api/v1';

function createHeaders(headers?: HeadersInit): Headers {
  return new Headers(headers);
}
export type ResumeStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ResumeJob {
  resume_id: string;
  filename: string;
  status: ResumeStatus;
  submitted_at?: string;
  processing_started_at?: string;
  completed_at?: string;
  raw_blob_path?: string;
  parsed_json_blob_path?: string;
  generated_docx_blob_path?: string;
  generated_pdf_blob_path?: string;
  download_url?: string;
  pdf_download_url?: string;
  error_message?: string;
}

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

// Normalize status from API (ensure uppercase)
function normalizeStatus(status: string): ResumeStatus {
  const normalized = status.toUpperCase() as ResumeStatus;
  if (['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(normalized)) {
    return normalized;
  }
  return 'UPLOADED';
}

// Normalize a job object from API response
function normalizeJob(job: Record<string, unknown>): ResumeJob {
  return {
    ...job,
    status: normalizeStatus(job.status as string),
  } as ResumeJob;
}

/**
 * Upload a single resume file
 * POST /resumes
 */
export async function uploadResume(file: File): Promise<ResumeJob> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/resumes`, {
    method: 'POST',
    headers: createHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return normalizeJob(data);
}

/**
 * Process a resume by ID
 * POST /resumes/{resume_id}/process
 */
export async function processResume(resumeId: string): Promise<ResumeJob> {
  const response = await fetch(`${BASE_URL}/resumes/${resumeId}/process`, {
    method: 'POST',
    headers: createHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Process failed: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return normalizeJob(data);
}

/**
 * Get the status of a resume job
 * GET /resumes/{resume_id}
 */
export async function getResumeStatus(resumeId: string): Promise<ResumeJob> {
  const response = await fetch(`${BASE_URL}/resumes/${resumeId}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Get status failed: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return normalizeJob(data);
}

/**
 * Get parsed resume data
 * GET /resumes/{resume_id}/parsed
 */
export async function getParsedResume(resumeId: string): Promise<ParsedResume> {
  const response = await fetch(`${BASE_URL}/resumes/${resumeId}/parsed`, {
    method: 'GET',
    headers: createHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Get parsed data failed: ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Download the formatted resume as DOCX
 * GET /resumes/{resume_id}/docx
 */
export async function downloadResumeDocx(resumeId: string): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/resumes/${resumeId}/docx`, {
    method: 'GET',
    headers: createHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Download DOCX failed: ${errorText || response.statusText}`);
  }

  return response.blob();
}

/**
 * Download the formatted resume as PDF
 * GET /resumes/{resume_id}/pdf
 */
export async function downloadResumePdf(resumeId: string): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/resumes/${resumeId}/pdf`, {
    method: 'GET',
    headers: createHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Download PDF failed: ${errorText || response.statusText}`);
  }

  return response.blob();
}

/**
 * Download the formatted resume (legacy endpoint - defaults to DOCX)
 * GET /resumes/{resume_id}/download
 */
export async function downloadResume(resumeId: string): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/resumes/${resumeId}/docx`, {
    method: 'GET',
    headers: createHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Download failed: ${errorText || response.statusText}`);
  }

  return response.blob();
}

/**
 * Batch upload multiple resume files
 * POST /resumes/batch
 */
export async function uploadResumesBatch(files: File[]): Promise<ResumeJob[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const response = await fetch(`${BASE_URL}/resumes/batch`, {
    method: 'POST',
    headers: createHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Batch upload failed: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return data.map((job: Record<string, unknown>) => normalizeJob(job));
}

/**
 * Batch process multiple resumes
 * POST /resumes/batch/process
 */
export async function processResumesBatch(resumeIds: string[]): Promise<ResumeJob[]> {
  const response = await fetch(`${BASE_URL}/resumes/batch/process`, {
    method: 'POST',
    headers: createHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ resume_ids: resumeIds }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Batch process failed: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return data.map((job: Record<string, unknown>) => normalizeJob(job));
}

export type DownloadFormat = 'docx' | 'pdf';

/**
 * Trigger download of a blob as a file
 */
export function downloadFile(blob: Blob, filename: string, format: DownloadFormat = 'docx'): void {
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const extension = format === 'pdf' ? 'pdf' : 'docx';
  const formattedFilename = `${baseName}_formatted.${extension}`;
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = formattedFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
