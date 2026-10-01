import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Loader2, CheckCircle2, AlertCircle, Play, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { ResumeJob } from '@/services/resume-api';
import { ProcessingAnimation } from './processing-animation';
import { ParsedResumeView } from './parsed-resume-view';
import { useParsedResume } from '@/hooks/use-resume-upload';

interface ResumeCardProps {
    job: ResumeJob;
    onProcess: () => void;
    onDownload: () => void;
    isProcessing?: boolean;
    isDownloading?: boolean;
}

const statusConfig = {
    uploaded: {
        icon: Play,
        label: 'Ready to Format',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
    },
    processing: {
        icon: Loader2,
        label: 'Processing...',
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/20',
    },
    completed: {
        icon: CheckCircle2,
        label: 'Complete',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
    },
    failed: {
        icon: AlertCircle,
        label: 'Failed',
        color: 'text-destructive',
        bg: 'bg-destructive/10',
        border: 'border-destructive/20',
    },
};

export function ResumeCard({
    job,
    onProcess,
    onDownload,
    isProcessing,
    isDownloading,
}: ResumeCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [progress, setProgress] = useState(0);
    const config = statusConfig[job.status] || statusConfig.uploaded;
    const StatusIcon = config.icon;

    // Simulate progress during processing
    useEffect(() => {
        if (job.status === 'processing') {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress((prev: number) => {
                    // Slow down as we approach 90%
                    if (prev >= 90) return prev;
                    const increment = prev < 50 ? 8 : prev < 75 ? 4 : 2;
                    return Math.min(prev + increment, 90);
                });
            }, 500);
            return () => clearInterval(interval);
        } else if (job.status === 'completed') {
            setProgress(100);
        } else {
            setProgress(0);
        }
    }, [job.status]);

    // Fetch parsed data when job is completed and card is expanded
    const shouldFetchParsed = job.status === 'completed' && isExpanded;
    const { data: parsedData, isLoading: isParsedLoading } = useParsedResume(
        shouldFetchParsed ? job.resume_id : null
    );

    const handleToggleExpand = () => {
        setIsExpanded((prev: boolean) => !prev);
    };

    // Auto-expand when completed
    useEffect(() => {
        if (job.status === 'completed') {
            setIsExpanded(true);
        }
    }, [job.status]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
                'relative overflow-hidden rounded-2xl border transition-all duration-300',
                'bg-gradient-to-br from-card to-card/80',
                config.border,
                isExpanded && job.status === 'completed' && 'ring-2 ring-primary/20'
            )}
        >
            {/* Processing Animation Overlay */}
            {job.status === 'processing' && <ProcessingAnimation />}

            <div className="relative p-5">
                <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div
                        className={cn(
                            'flex items-center justify-center w-14 h-14 rounded-xl shrink-0',
                            config.bg
                        )}
                    >
                        <FileText className={cn('w-7 h-7', config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate pr-4">{job.filename}</h3>

                        <div className="flex items-center gap-2 mt-1.5">
                            <StatusIcon
                                className={cn(
                                    'w-4 h-4',
                                    config.color,
                                    job.status === 'processing' && 'animate-spin'
                                )}
                            />
                            <span className={cn('text-sm font-medium', config.color)}>
                                {config.label}
                            </span>
                        </div>

                        {/* Progress bar for processing */}
                        {job.status === 'processing' && (
                            <div className="mt-3">
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Analyzing and formatting your resume... {progress}%
                                </p>
                            </div>
                        )}

                        {job.error_message && (
                            <p className="mt-2 text-sm text-destructive/80">{job.error_message}</p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4">
                            {job.status === 'uploaded' && (
                                <Button
                                    size="sm"
                                    onClick={onProcess}
                                    disabled={isProcessing}
                                    className="gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Starting...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-3.5 h-3.5" />
                                            Start Formatting
                                        </>
                                    )}
                                </Button>
                            )}

                            {job.status === 'completed' && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleToggleExpand}
                                        className="gap-2"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        {isExpanded ? 'Hide' : 'View'} Results
                                        {isExpanded ? (
                                            <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={onDownload}
                                        disabled={isDownloading}
                                        className="gap-2 bg-emerald-600 hover:bg-emerald-500"
                                    >
                                        {isDownloading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Download className="w-3.5 h-3.5" />
                                        )}
                                        Download DOCX
                                    </Button>
                                </>
                            )}

                            {job.status === 'failed' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onProcess}
                                    disabled={isProcessing}
                                    className="gap-2"
                                >
                                    <Play className="w-3.5 h-3.5" />
                                    Retry
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expanded Parsed Data View */}
                <AnimatePresence>
                    {isExpanded && job.status === 'completed' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' as const }}
                            className="overflow-hidden"
                        >
                            <div className="mt-6 pt-6 border-t border-border/50">
                                <ParsedResumeView data={parsedData ?? null} isLoading={isParsedLoading} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}