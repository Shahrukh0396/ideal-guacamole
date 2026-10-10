import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import { useMsal } from '@azure/msal-react';
import { History } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function SignOutButton() {
    const { instance } = useMsal();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => instance.logoutRedirect({ account: instance.getActiveAccount() ?? undefined })}
        >
            Sign out
        </Button>
    );
}

export default function Layout() {
    return (
        <div className="min-h-screen bg-background text-foreground relative">
            {/* Animated gradient background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Primary glow */}
                <motion.div
                    className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, var(--glow-color) 0%, transparent 70%)',
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Secondary glow */}
                <motion.div
                    className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, oklch(0.6 0.15 280 / 0.1) 0%, transparent 70%)',
                    }}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Noise overlay */}
                <div className="absolute inset-0 noise opacity-[0.015]" />
            </div>

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 border-b border-border/40 glass"
            >
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Logo */}
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center glow-sm">
                                <svg
                                    className="w-5 h-5 text-primary-foreground"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                        </motion.div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-foreground">
                                TalentForge
                            </h1>
                            <p className="text-xs text-muted-foreground -mt-0.5">
                                Resume Formatter
                            </p>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <NavLink
                            to="/history"
                            className={({ isActive }) =>
                                cn(
                                    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary/15 text-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )
                            }
                        >
                            <History className="w-4 h-4" />
                            History
                        </NavLink>
                        {/* Status indicator */}
                        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>API Connected</span>
                        </div>

                        <SignOutButton />
                        <ThemeToggle />
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="relative z-10">
                <Outlet />
            </main>
        </div>
    );
}