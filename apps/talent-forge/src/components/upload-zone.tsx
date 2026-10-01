import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface UploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    isUploading: boolean;
    disabled?: boolean;
}

const ACCEPTED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function UploadZone({ onFilesSelected, isUploading, disabled }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (disabled) return;

            const droppedFiles = Array.from(e.dataTransfer.files).filter((file: File) =>
                ACCEPTED_TYPES.includes(file.type)
            );

            if (droppedFiles.length > 0) {
                setStagedFiles((prev: File[]) => [...prev, ...droppedFiles]);
            }
        },
        [disabled]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled || !e.target.files) return;

            const selectedFiles = Array.from(e.target.files).filter((file: File) =>
                ACCEPTED_TYPES.includes(file.type)
            );

            if (selectedFiles.length > 0) {
                setStagedFiles((prev: File[]) => [...prev, ...selectedFiles]);
            }
            e.target.value = '';
        },
        [disabled]
    );

    const removeFile = useCallback((index: number) => {
        setStagedFiles((prev: File[]) => prev.filter((_: File, i: number) => i !== index));
    }, []);

    const handleUpload = useCallback(() => {
        if (stagedFiles.length > 0) {
            onFilesSelected(stagedFiles);
            setStagedFiles([]);
        }
    }, [stagedFiles, onFilesSelected]);

    return (
        <div className="space-y-6">
            {/* Drop Zone */}
            <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300',
                    'glass-card hover-lift',
                    isDragging && 'border-primary bg-primary/10 scale-[1.02] glow',
                    !isDragging && 'border-border/50 hover:border-primary/40',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!disabled ? { scale: 1.01 } : undefined}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--primary)_1px,_transparent_1px)] bg-[length:32px_32px] opacity-[0.03]" />
                    <div className="absolute inset-0 animate-shimmer opacity-30" />
                </div>

                <label
                    className={cn(
                        'flex flex-col items-center justify-center py-16 px-8 cursor-pointer relative z-10',
                        disabled && 'cursor-not-allowed'
                    )}
                >
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileInput}
                        disabled={disabled}
                        className="hidden"
                    />

                    <motion.div
                        className="relative"
                        animate={isDragging ? { scale: 1.15, y: -12 } : { scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        {/* Glow effect */}
                        <motion.div
                            className="absolute inset-0 blur-2xl bg-primary/40 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 glow-sm">
                            <Upload className="w-12 h-12 text-primary" />
                        </div>
                    </motion.div>

                    <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <p className="text-xl font-semibold text-foreground">
                            {isDragging ? 'Drop your resumes here' : 'Drag & drop resumes'}
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            or click to browse • PDF, DOC, DOCX
                        </p>
                    </motion.div>
                </label>
            </motion.div>

            {/* Staged Files */}
            <AnimatePresence mode="popLayout">
                {stagedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">
                                {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''} ready
                            </p>
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                            >
                                <Sparkles className="w-4 h-4" />
                                {isUploading ? 'Uploading...' : 'Format Resumes'}
                            </Button>
                        </div>

                        <div className="grid gap-2">
                            {stagedFiles.map((file: File, index: number) => (
                                <motion.div
                                    key={`${file.name}-${index}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 group"
                                >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                                        <FileText className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                                    >
                                        <X className="w-4 h-4 text-destructive" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
