const API_BASE =
  import.meta.env.VITE_API_BASE ||
  'https://talentforge-egbqb0adakgxfyhd.centralus-01.azurewebsites.net/api/v1';

function apiHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  return headers;
}

export type ResumeStatus = 'uploaded' | 'processing' | 'completed' | 'failed';

export interface ResumeJob {
  resume_id: string;
  filename: string;
  status: ResumeStatus;
  submitted_at?: string;
  completed_at?: string;
  raw_blob_path?: string;
  generated_blob_path?: string;
  download_url?: string;
  error_message?: string;
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

export async function uploadSingleResume(file: File): Promise<ResumeJob> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/resumes`, {
    method: 'POST',
    headers: apiHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return normalizeJob(data);
}

export async function uploadMultipleResumes(files: File[]): Promise<ResumeJob[]> {
  const formData = new FormData();
  files.forEach((file: File) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE}/resumes/batch`, {
    method: 'POST',
    headers: apiHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Batch upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return (data as Record<string, unknown>[]).map(normalizeJob);
}

export async function processResume(resumeId: string): Promise<ResumeJob> {
  const response = await fetch(`${API_BASE}/resumes/${resumeId}/process`, {
    method: 'POST',
    headers: apiHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Processing failed: ${response.statusText}`);
  }

  const data = await response.json();
  return normalizeJob(data);
}

export async function processBatchResumes(resumeIds: string[]): Promise<ResumeJob[]> {
  const response = await fetch(`${API_BASE}/resumes/batch/process`, {
    method: 'POST',
    headers: apiHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ resume_ids: resumeIds }),
  });

  if (!response.ok) {
    throw new Error(`Batch processing failed: ${response.statusText}`);
  }

  const data = await response.json();
  return (data as Record<string, unknown>[]).map(normalizeJob);
}

export async function getResumeStatus(resumeId: string): Promise<ResumeJob> {
  const response = await fetch(`${API_BASE}/resumes/${resumeId}`, {
    headers: apiHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }

  const data = await response.json();
  return normalizeJob(data);
}

export async function getParsedResume(resumeId: string): Promise<ParsedResume> {
  const response = await fetch(`${API_BASE}/resumes/${resumeId}/parsed`, {
    headers: apiHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch parsed data: ${response.statusText}`);
  }

  return response.json();
}

export async function downloadResume(job: ResumeJob): Promise<Blob> {
  const downloadUrl = `${API_BASE}/resumes/${job.resume_id}/docx`;
  
  console.log('[Download] Attempting download from:', downloadUrl);
  console.log('[Download] Job data:', JSON.stringify(job, null, 2));
  
  const response = await fetch(downloadUrl, {
    method: 'GET',
    headers: apiHeaders({
      Accept:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/octet-stream,*/*',
    }),
  });

  console.log('[Download] Response status:', response.status, response.statusText);
  console.log('[Download] Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    let errorMsg = `Download failed: ${response.status} ${response.statusText}`;
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        console.log('[Download] Error response JSON:', errorData);
        errorMsg = errorData.detail || errorData.message || errorMsg;
      } else {
        const errorText = await response.text();
        console.log('[Download] Error response text:', errorText);
        if (errorText) errorMsg = errorText;
      }
    } catch (parseError) {
      console.log('[Download] Could not parse error response:', parseError);
    }
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  console.log('[Download] Blob received - size:', blob.size, 'type:', blob.type);
  
  if (blob.size === 0) {
    throw new Error('Downloaded file is empty');
  }
  
  return blob;
}

export function downloadFile(blob: Blob, filename: string) {
  // Create a clean formatted filename
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const formattedFilename = `${baseName}_formatted.docx`;
  
  console.log('[Download] Triggering file download:', formattedFilename);
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = formattedFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('[Download] File download triggered successfully');
}