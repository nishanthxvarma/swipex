'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { JobDetailModal } from '@/components/jobs/job-detail-modal';
import { Job } from '@/components/swipe/swipe-card';

const sampleJobs: Job[] = [
  {
    id: '1',
    company: 'Vercel',
    companyInitials: 'V',
    color: '#000000',
    verified: true,
    title: 'Senior Frontend Engineer',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    jobType: 'Full-time',
    salary: '$140K - $180K',
    salaryMin: 140000,
    salaryMax: 180000,
    salaryCurrency: '$',
    skills: ['Next.js', 'React', 'TypeScript', 'TailwindCSS', 'GraphQL'],
    matchPercentage: 95,
    atsScore: 95,
    competition: 'Medium',
    postedTime: '2 hours ago',
    description: 'We are looking for a Senior Frontend Engineer to help us build the next generation of web development tools at Vercel. You will work on Next.js, Vercel Platform, and design system components used by millions of developers worldwide.',
    requirements: [
      '5+ years of production frontend software engineering experience',
      'Expert proficiency in React 19, Next.js App Router, and TypeScript',
      'Deep understanding of web performance optimization and Core Web Vitals',
      'Experience building design systems and accessible UI components',
    ],
    benefits: ['Full remote flexibility', 'Unlimited PTO', '$3,000 learning stipend', 'Top tier health/dental/vision coverage'],
  },
  {
    id: '2',
    company: 'Stripe',
    companyInitials: 'S',
    color: '#635BFF',
    verified: true,
    title: 'Full Stack Developer',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    jobType: 'Full-time',
    salary: '$150K - $200K',
    salaryMin: 150000,
    salaryMax: 200000,
    salaryCurrency: '$',
    skills: ['Node.js', 'React', 'TypeScript', 'PostgreSQL', 'Ruby'],
    matchPercentage: 88,
    atsScore: 88,
    competition: 'High',
    postedTime: '5 hours ago',
    description: 'Stripe is building financial infrastructure for the internet. Join our Core Products team to design and implement developer-friendly payment APIs and web platforms powering billions in transactions.',
    requirements: [
      '4+ years building distributed full stack web apps',
      'Experience with relational databases (PostgreSQL) and API design',
      'Strong engineering discipline in automated testing and CI/CD',
    ],
    benefits: ['Competitive equity package', 'Flexible hybrid office policy', 'Wellness stipends', '401(k) matching'],
  },
  {
    id: '3',
    company: 'Airbnb',
    companyInitials: 'A',
    color: '#FF5A5F',
    verified: true,
    title: 'React Native Engineer',
    location: 'Remote',
    type: 'Full-time',
    jobType: 'Full-time',
    salary: '$130K - $170K',
    salaryMin: 130000,
    salaryMax: 170000,
    salaryCurrency: '$',
    skills: ['React Native', 'TypeScript', 'iOS', 'Android', 'Redux'],
    matchPercentage: 82,
    atsScore: 82,
    competition: 'Low',
    postedTime: '1 day ago',
    description: 'Help craft the mobile experience for millions of travelers and hosts around the world. As a React Native Engineer at Airbnb, you will ship features directly to our iOS and Android mobile apps.',
    requirements: [
      '3+ years React Native or cross-platform mobile development',
      'Understanding of native mobile modules (Swift/Kotlin)',
      'Passion for pixel-perfect animations and mobile UX',
    ],
    benefits: ['$2,000 annual travel credit', 'Flexible work from anywhere', 'Comprehensive parental leave'],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const name = user?.fullName ? user.fullName.split(' ')[0] : 'Nishanth';

  const stats = [
    {
      title: 'Total Applications',
      value: '24',
      trend: '+12% from last week',
      trendUp: true,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/applications',
    },
    {
      title: 'Interviews Scheduled',
      value: '3',
      trend: 'Next: Tomorrow 2PM',
      trendUp: true,
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/applications',
    },
    {
      title: 'Resume Score',
      value: '87/100',
      trend: '+5 pts since update',
      trendUp: true,
      icon: Award,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      href: '/profile',
    },
    {
      title: 'Profile Strength',
      value: '72%',
      trend: 'Complete your profile',
      trendUp: false,
      icon: Shield,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      href: '/profile',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      title: 'Application Viewed',
      description: 'Google reviewed your application for Senior Frontend Engineer',
      time: '2 hours ago',
      icon: Eye,
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      id: 2,
      title: 'Interview Scheduled',
      description: 'Technical interview with Netflix on Thursday at 2:00 PM',
      time: '5 hours ago',
      icon: Calendar,
      iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      id: 3,
      title: 'Job Match',
      description: 'New 95% match: Full Stack Developer at Vercel',
      time: '1 day ago',
      icon: Sparkles,
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      id: 4,
      title: 'Application Submitted',
      description: 'You applied for Product Designer at Stripe',
      time: '2 days ago',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-7">
          <div className="md:col-span-4 h-96 animate-pulse rounded-xl bg-card" />
          <div className="md:col-span-3 h-96 animate-pulse rounded-xl bg-card" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20 md:pb-0"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Good morning, {name} 👋</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Here's what's happening with your job search today.
          </p>
        </div>
        <Button
          onClick={() => router.push('/jobs')}
          className="w-full md:w-auto h-11 px-6 font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all"
        >
          <Sparkles className="mr-2 h-4 w-4 text-amber-300 animate-pulse" />
          Find Matches
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            onClick={() => router.push(stat.href)}
            className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-transform group-hover:scale-110", stat.bgColor, stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <span className={cn("font-semibold", stat.trendUp ? "text-emerald-500" : "text-amber-500")}>
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Recommended Jobs Column */}
        <motion.div variants={item} className="md:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recommended Jobs</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/jobs')}
              className="text-xs font-semibold text-primary hover:text-primary/80"
            >
              View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-3">
            {sampleJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-xs transition-transform group-hover:scale-105"
                    style={{ backgroundColor: job.color }}
                  >
                    {job.companyInitials}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium text-foreground">{job.company}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {job.atsScore}% Match
                    </span>
                    <p className="text-xs font-medium text-muted-foreground mt-1">
                      {job.salary || '$140k - $180k'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl group-hover:border-primary group-hover:text-primary">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity Column */}
        <motion.div variants={item} className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-6">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {recentActivity.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="relative flex items-start gap-4">
                    <div className={cn("absolute -left-6 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card bg-background", act.iconBg)}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-foreground">{act.title}</p>
                      <p className="text-xs text-muted-foreground">{act.description}</p>
                      <span className="text-[10px] text-muted-foreground font-medium block pt-0.5">
                        {act.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/applications')}
              className="w-full text-xs font-semibold rounded-xl"
            >
              View All Activity
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Modal for detailed job view */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </motion.div>
  );
}
