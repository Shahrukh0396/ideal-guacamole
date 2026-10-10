import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ResumeCard } from '@/components/resume-card';
import { Button } from '@/components/ui/button';
import {
    useDownloadResume,
    useProcessResumes,
    useResumeJobs,
    useResumeStatusPolling,
} from '@/hooks/use-resume-upload';
import type { ResumeJob } from '@/services/resume-api';

export function ResumeList({ hideWhenEmpty = false }: { hideWhenEmpty?: boolean }) {
    const { jobs, setJobs, isLoading, error, historyUnavailable } = useResumeJobs();
    const processMutation = useProcessResumes();
    const docxDownload = useDownloadResume('docx');
    const pdfDownload = useDownloadResume('pdf');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [downloadingDocxId, setDownloadingDocxId] = useState<string | null>(null);
    const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

    useResumeStatusPolling(jobs, setJobs);

    const ordered = [...jobs].sort((a, b) => (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''));
    const uploadedCount = ordered.filter((job) => job.status === 'uploaded' && job.role !== 'viewer').length;

    const handleProcess = (resumeId: string) => {
        setProcessingId(resumeId);
        processMutation.mutate([resumeId], {
            onSettled: () => setProcessingId(null),
        });
    };

    const handleProcessAll = () => {
        const uploadedJobs = ordered.filter((job) => job.status === 'uploaded' && job.role !== 'viewer');
        if (uploadedJobs.length > 0) {
            processMutation.mutate(uploadedJobs.map((job) => job.resume_id));
        }
    };

    if (hideWhenEmpty && !isLoading && !error && ordered.length === 0) {
        return null;
    }

    return (
        <section className="max-w-3xl mx-auto px-6 pb-20">
            {error && (
                <p className="mb-4 text-sm text-destructive">{error.message}</p>
            )}
            {isLoading && ordered.length === 0 && (
                <p className="text-sm text-muted-foreground">Loading your resumes…</p>
            )}
            {!isLoading && !error && ordered.length === 0 && (
                <div className="rounded-2xl glass-card px-6 py-10 text-center">
                    <p className="font-medium text-foreground">
                        {historyUnavailable ? 'Saved history is not on the server yet' : 'No resumes yet'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {historyUnavailable
                            ? 'Resumes you upload in this visit still show here. PDF and DOCX appear after you start formatting.'
                            : 'Resumes you upload while signed in are saved here. Shared resumes show up here too.'}
                    </p>
                </div>
            )}
            {ordered.length > 0 && (
                <>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-foreground">
                            Your Resumes ({ordered.length})
                        </h2>
                        {uploadedCount > 1 && (
                            <Button
                                size="sm"
                                onClick={handleProcessAll}
                                disabled={processMutation.isPending}
                                className="gap-2"
                            >
                                Format All
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {ordered.map((job: ResumeJob) => (
                                <ResumeCard
                                    key={job.resume_id}
                                    job={job}
                                    onProcess={() => handleProcess(job.resume_id)}
                                    onDownloadDocx={() => {
                                        setDownloadingDocxId(job.resume_id);
                                        docxDownload.mutate(job, {
                                            onSettled: () => setDownloadingDocxId(null),
                                        });
                                    }}
                                    onDownloadPdf={() => {
                                        setDownloadingPdfId(job.resume_id);
                                        pdfDownload.mutate(job, {
                                            onSettled: () => setDownloadingPdfId(null),
                                        });
                                    }}
                                    isProcessing={processingId === job.resume_id}
                                    isDownloadingDocx={downloadingDocxId === job.resume_id}
                                    isDownloadingPdf={downloadingPdfId === job.resume_id}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </section>
    );
}
