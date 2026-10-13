import { motion } from 'motion/react';
import {
    User,
    MapPin,
    Briefcase,
    GraduationCap,
    Award,
    Heart,
    Info,
    Languages,
    Scale,
    Users,
    Wrench,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ParsedResume, ParsedExperience, ParsedEducation, ParsedLanguage } from '@/services/resume-api';
import { Badge } from '@/components/ui/badge';

interface ParsedResumeViewProps {
    data: ParsedResume | null;
    isLoading?: boolean;
}

const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
} as const;

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
} as const;

function textItems(values?: Array<string | { name?: string; title?: string; certification?: string }>): string[] {
    if (!values) return [];
    return values
        .map((item) => {
            if (typeof item === 'string') return item;
            return item.name || item.title || item.certification || '';
        })
        .filter((item) => item.trim().length > 0);
}

export function ParsedResumeView({ data, isLoading }: ParsedResumeViewProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading parsed data...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No parsed data available
            </div>
        );
    }

    const skills = [...(data.technical_skills ?? []), ...(data.skills ?? [])];
    const competencies = data.core_competencies ?? [];
    const experience = data.professional_experience?.length
        ? data.professional_experience
        : (data.experience ?? []);
    const education = data.education ?? [];
    const certifications = textItems(data.certifications);
    const additionalInformation = textItems(data.additional_information);
    const volunteer = data.volunteer_experience ?? [];
    const extracurricular = textItems(data.extracurricular_activities);
    const barLicenses = textItems(data.bar_licenses);

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Header / Contact Info */}
            <motion.div variants={sectionVariants} className="space-y-4">
                {data.name && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                            <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-foreground">{data.name}</h3>
                            {data.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {data.location}
                                </p>
                            )}
                        </div>
                    </div>
                )}

            </motion.div>

            {(data.summary || competencies.length > 0) && (
                <motion.div variants={sectionVariants}>
                    <SectionHeader title="Summary of Qualifications" />
                    {data.summary && (
                        <p className="text-foreground/90 leading-relaxed">{data.summary}</p>
                    )}
                    {competencies.length > 0 && (
                        <div className={data.summary ? 'mt-3' : undefined}>
                            <BulletList items={competencies} />
                        </div>
                    )}
                </motion.div>
            )}

            {skills.length > 0 && (
                <motion.div variants={sectionVariants}>
                    <SectionHeader title="Technical Skills" icon={Wrench} />
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill: string, index: number) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </motion.div>
            )}

            {experience.length > 0 && (
                <motion.div variants={sectionVariants}>
                    <SectionHeader title="Professional Experience" icon={Briefcase} />
                    <div className="space-y-4">
                        {experience.map((exp: ParsedExperience, index: number) => (
                            <ExperienceCard key={index} experience={exp} />
                        ))}
                    </div>
                </motion.div>
            )}

            {education.length > 0 && (
                <motion.div variants={sectionVariants}>
                    <SectionHeader title="Education" icon={GraduationCap} />
                    <div className="space-y-3">
                        {education.map((edu: ParsedEducation | string, index: number) => (
                            <EducationCard key={index} education={edu} />
                        ))}
                    </div>
                </motion.div>
            )}

            {certifications.length > 0 && (
                <motion.div variants={sectionVariants}>
                    <SectionHeader title="Certifications" icon={Award} />
                    <BulletList items={certifications} />
                </motion.div>
            )}

            {additionalInformation.length > 0 && (
                <motion.div variants={sectionVariants}>
                    <SectionHeader title="Additional Information" icon={Info} />
                    <BulletList items={additionalInformation} />
                </motion.div>
            )}

            {volunteer.length > 0 && (
                <motion.div variants={sectionVariants}>
                    <SectionHeader title="Volunteer Experience" icon={Heart} />
                    <div className="space-y-4">
                        {volunteer.map((exp: ParsedExperience, index: number) => (
                            <ExperienceCard key={index} experience={exp} />
                        ))}
                    </div>
                </motion.div>
            )}

            {extracurricular.length > 0 && (
                <motion.div variants={sectionVariants}>
                    <SectionHeader title="Extracurricular Activities" icon={Users} />
                    <BulletList items={extracurricular} />
                </motion.div>
            )}

            {barLicenses.length > 0 && (
                <motion.div variants={sectionVariants}>
                    <SectionHeader title="Bar Licenses" icon={Scale} />
                    <BulletList items={barLicenses} />
                </motion.div>
            )}

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
                <motion.div variants={sectionVariants}>
                    <SectionHeader title="Languages" icon={Languages} />
                    <div className="flex flex-wrap gap-2">
                        {data.languages.map((lang: string | ParsedLanguage, index: number) => {
                            // Handle both string and object formats
                            const languageName = typeof lang === 'string' ? lang : lang.language;
                            const proficiency = typeof lang === 'object' && lang.proficiency ? lang.proficiency : null;
                            return (
                                <Badge key={index} variant="outline" className="flex items-center gap-1.5">
                                    <span>{languageName}</span>
                                    {proficiency && (
                                        <span className="text-xs text-muted-foreground">({proficiency})</span>
                                    )}
                                </Badge>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon?: React.ComponentType<{ className?: string }> }) {
    return (
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
            {Icon && <Icon className="w-4 h-4 text-primary" />}
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </h4>
        </div>
    );
}

function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-1.5">
            {items.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-foreground/90">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                </li>
            ))}
        </ul>
    );
}

function ExperienceCard({ experience }: { experience: ParsedExperience }) {
    const dateRange = experience.dates
        || [experience.start_date, experience.end_date].filter(Boolean).join(' – ');
    const title = experience.role || experience.title;
    const company = experience.company || experience.organization;
    const highlights = experience.bullets?.length ? experience.bullets : experience.highlights;

    return (
        <div className="relative pl-4 border-l-2 border-primary/30 hover:border-primary transition-colors">
            <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
            <div className="space-y-1">
                {title && <h5 className="font-semibold text-foreground">{title}</h5>}
                {company && <p className="text-sm text-primary font-medium">{company}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {dateRange && <span>{dateRange}</span>}
                    {experience.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {experience.location}
                        </span>
                    )}
                </div>
                {experience.description && (
                    <p className="text-sm text-foreground/80 mt-2">{experience.description}</p>
                )}
                {highlights && highlights.length > 0 && (
                    <ul className="mt-2 space-y-1">
                        {highlights.map((highlight: string, idx: number) => (
                            <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                                <span className="text-primary mt-1.5">•</span>
                                {highlight}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function EducationCard({ education }: { education: ParsedEducation | string }) {
    if (typeof education === 'string') {
        return (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <h5 className="font-semibold text-foreground">{education}</h5>
            </div>
        );
    }

    const credential = education.credential || education.degree;
    const institution = education.institution || education.school;

    return (
        <div className={cn(
            'p-3 rounded-lg bg-muted/30 border border-border/50',
            'hover:bg-muted/50 transition-colors'
        )}>
            {credential && <h5 className="font-semibold text-foreground">{credential}</h5>}
            {education.field && (
                <p className="text-sm text-primary">{education.field}</p>
            )}
            {institution && <p className="text-sm text-muted-foreground">{institution}</p>}
            {education.location && (
                <p className="text-sm text-muted-foreground">{education.location}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                {education.graduation_date && <span>{education.graduation_date}</span>}
                {education.gpa && <span>GPA: {education.gpa}</span>}
            </div>
        </div>
    );
}
