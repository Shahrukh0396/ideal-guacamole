import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { History, Sparkles, Zap, FileCheck } from 'lucide-react';
import { UploadZone } from '@/components/upload-zone';
import { ResumeList } from '@/components/resume-list';
import { useUploadResumes } from '@/hooks/use-resume-upload';
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
    const uploadMutation = useUploadResumes();

    const handleFilesSelected = (files: File[]) => {
        uploadMutation.mutate(files);
    };

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
                    className="flex justify-end mb-4"
                >
                    <Button asChild variant="outline" size="sm">
                        <Link to="/history">
                            <History className="w-4 h-4" />
                            Open history
                        </Link>
                    </Button>
                </motion.div>
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

            <ResumeList hideWhenEmpty />

            {/* Footer accent */}
            <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
    );
}
