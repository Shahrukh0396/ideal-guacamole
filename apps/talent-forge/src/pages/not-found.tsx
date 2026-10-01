import { motion } from 'motion/react';
import { FileQuestion, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                    <FileQuestion className="w-10 h-10 text-primary" />
                </div>

                <h1 className="text-4xl font-bold text-foreground">Page Not Found</h1>
                <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <Button asChild className="mt-8 gap-2">
                    <Link to="/">
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                </Button>
            </motion.div>
        </div>
    );
}
