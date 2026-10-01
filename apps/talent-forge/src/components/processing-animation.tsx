import { motion } from 'motion/react';

export function ProcessingAnimation() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Scanning line */}
            <motion.div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
                initial={{ top: '0%', opacity: 0 }}
                animate={{
                    top: ['0%', '100%', '0%'],
                    opacity: [0, 1, 0],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut' as const,
                }}
            />

            {/* Corner pulse effects */}
            <motion.div
                className="absolute top-0 left-0 w-16 h-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent" />
                <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-primary to-transparent" />
            </motion.div>

            <motion.div
                className="absolute bottom-0 right-0 w-16 h-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
            >
                <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-primary to-transparent" />
                <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-primary to-transparent" />
            </motion.div>

            {/* Particle effects */}
            {[...Array(6)].map((_, i: number) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-primary"
                    initial={{
                        left: `${10 + i * 15}%`,
                        top: '50%',
                        opacity: 0,
                        scale: 0,
                    }}
                    animate={{
                        top: ['50%', '20%', '80%', '50%'],
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1, 1, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: 'easeInOut' as const,
                    }}
                />
            ))}

            {/* Background pulse */}
            <motion.div
                className="absolute inset-0 bg-primary/5"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            />
        </div>
    );
}

export function FullPageProcessingAnimation() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative">
                {/* Central orb */}
                <motion.div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 blur-xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                />

                {/* Orbiting rings */}
                {[0, 1, 2].map((i: number) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 border-2 border-primary/30 rounded-full"
                        style={{
                            margin: `${-10 - i * 15}px`,
                        }}
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    >
                        <div
                            className="absolute w-3 h-3 rounded-full bg-primary"
                            style={{
                                top: '50%',
                                left: '-6px',
                                transform: 'translateY(-50%)',
                            }}
                        />
                    </motion.div>
                ))}

                {/* Center icon */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 0.9, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                    <svg
                        className="w-12 h-12 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </motion.div>
            </div>

            <motion.p
                className="absolute bottom-[30%] text-lg font-medium text-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                Formatting your resume...
            </motion.p>
        </div>
    );
}
