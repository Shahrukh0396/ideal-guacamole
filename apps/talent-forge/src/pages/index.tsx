import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, FileCheck, ArrowRight } from 'lucide-react';
import { UploadZone } from '@/components/upload-zone';
import { ResumeCard } from '@/components/resume-card';
import {
    useResumeJobs,
    useUploadResumes,
    useProcessResumes,
    useResumeStatusPolling,
    useDownloadResume,
} from '@/hooks/use-resume-upload';
import type { ResumeJob } from '@/services/resume-api';
import { Button } from '@/components/ui/button';

const features = [
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: 'AI-powered formatting in seconds',
    },
    {
        icon: FileCheck,
        title: 'ATS Optimized',
        description: 'Passes applicant tracking systems',
    },
    {
        icon: Sparkles,
        title: 'Professional',
        description: 'Clean, modern formatting',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
} as const;

export default function HomePage() {
    const { jobs, setJobs } = useResumeJobs();
    const uploadMutation = useUploadResumes();
    const processMutation = useProcessResumes();
    const downloadMutation = useDownloadResume();

    // Track which specific resume is being processed/downloaded
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // Poll status for processing jobs
    useResumeStatusPolling(jobs, setJobs);

    const handleFilesSelected = (files: File[]) => {
        uploadMutation.mutate(files);
    };

    const handleProcess = (resumeId: string) => {
        setProcessingId(resumeId);
        processMutation.mutate([resumeId], {
            onSettled: () => setProcessingId(null),
        });
    };

    const handleProcessAll = () => {
        const uploadedJobs = jobs.filter((job: ResumeJob) => job.status === 'uploaded');
        if (uploadedJobs.length > 0) {
            processMutation.mutate(uploadedJobs.map((job: ResumeJob) => job.resume_id));
        }
    };

    const handleDownload = (job: ResumeJob) => {
        setDownloadingId(job.resume_id);
        downloadMutation.mutate(job, {
            onSettled: () => setDownloadingId(null),
        });
    };

    const handleClearCompleted = () => {
        setJobs((prev: ResumeJob[]) => prev.filter((job: ResumeJob) => job.status !== 'completed'));
    };

    const uploadedCount = jobs.filter((job: ResumeJob) => job.status === 'uploaded').length;
    const completedCount = jobs.filter((job: ResumeJob) => job.status === 'completed').length;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5 animate-gradient" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-primary/15 rounded-full blur-[150px] animate-pulse-glow" />

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb),0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />

                <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-12">
                    <motion.div
                        className="text-center"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {/* Badge */}
                        <motion.div variants={itemVariants} className="inline-block">
                            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium glass border-glow glow-sm">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-foreground">AI-Powered Resume Formatting</span>
                            </span>
                        </motion.div>

                        {/* Heading */}
                        <motion.h1
                            variants={itemVariants}
                            className="mt-10 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
                        >
                            <span className="text-foreground">Transform Your</span>
                            <br />
                            <span className="text-gradient">
                                Resume Instantly
                            </span>
                        </motion.h1>

                        {/* Subheading */}
                        <motion.p
                            variants={itemVariants}
                            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                        >
                            Upload your resume and watch as our AI transforms it into a
                            professionally formatted document that stands out.
                        </motion.p>

                        {/* Features */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-wrap justify-center gap-6 md:gap-10 mt-14"
                        >
                            {features.map((feature: { icon: typeof Zap; title: string; description: string }, index: number) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={feature.title}
                                        className="flex items-center gap-3 text-left px-4 py-3 rounded-xl glass-card hover-lift cursor-default"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                                            <Icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{feature.title}</p>
                                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Upload Section */}
            <section className="max-w-3xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <UploadZone
                        onFilesSelected={handleFilesSelected}
                        isUploading={uploadMutation.isPending}
                    />
                </motion.div>
            </section>

            {/* Jobs Section */}
            <AnimatePresence>
                {jobs.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-3xl mx-auto px-6 pb-20"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-foreground">
                                Your Resumes ({jobs.length})
                            </h2>
                            <div className="flex gap-2">
                                {completedCount > 0 && (
                                    <Button variant="ghost" size="sm" onClick={handleClearCompleted}>
                                        Clear Completed
                                    </Button>
                                )}
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
                        </div>

                        <div className="grid gap-4">
                            <AnimatePresence mode="popLayout">
                                {jobs.map((job: ResumeJob) => (
                                    <ResumeCard
                                        key={job.resume_id}
                                        job={job}
                                        onProcess={() => handleProcess(job.resume_id)}
                                        onDownload={() => handleDownload(job)}
                                        isProcessing={processingId === job.resume_id}
                                        isDownloading={downloadingId === job.resume_id}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Footer accent */}
            <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
    );
}
