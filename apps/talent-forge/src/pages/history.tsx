import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ResumeList } from '@/components/resume-list';

export default function HistoryPage() {
    return (
        <div className="pt-12">
            <motion.div
                className="max-w-3xl mx-auto px-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to upload
                </Link>
                <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">History</h1>
                <p className="mt-2 mb-8 text-muted-foreground">
                    Resumes you uploaded, and resumes other people shared with you.
                </p>
            </motion.div>
            <ResumeList />
        </div>
    );
}
