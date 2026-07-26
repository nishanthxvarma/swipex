'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  MoreHorizontal,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500); // Simulate brief load
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: 'Total Applications',
      value: '24',
      trend: '+12% from last week',
      trendUp: true,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Interviews Scheduled',
      value: '3',
      trend: 'Next: Tomorrow 2PM',
      trendUp: true,
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Resume Score',
      value: '87/100',
      trend: '+5 pts since update',
      trendUp: true,
      icon: Award,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Profile Strength',
      value: '72%',
      trend: 'Complete your profile',
      trendUp: false,
      icon: Shield,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
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

  const recommendedJobs = [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      company: 'Vercel',
      location: 'Remote',
      salary: '$140k - $180k',
      match: 95,
      logo: 'V',
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      salary: '$150k - $200k',
      match: 88,
      logo: 'S',
    },
    {
      id: 3,
      title: 'React Native Engineer',
      company: 'Airbnb',
      location: 'Remote',
      salary: '$130k - $170k',
      match: 82,
      logo: 'A',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
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
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good morning, John 👋</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your job search today.
          </p>
        </div>
        <Button className="w-full md:w-auto">
          <Sparkles className="mr-2 h-4 w-4" />
          Find Matches
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", stat.bgColor, stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className={cn("font-medium", stat.trendUp ? "text-emerald-500" : "text-amber-500")}>
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recommended Jobs */}
        <motion.div variants={item} className="space-y-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recommended Jobs</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all
            </Button>
          </div>
          <div className="grid gap-4">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary">
                    {job.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {job.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                    {job.match}% Match
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">{job.salary}</span>
                </div>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={activity.id} className="relative flex gap-4">
                  {i !== recentActivity.length - 1 && (
                    <div className="absolute left-4 top-10 -bottom-6 w-px bg-border" />
                  )}
                  <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", activity.iconBg)}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3" /> {activity.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6">
              View All Activity
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Application Pipeline */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Application Pipeline</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {['Applied', 'Reviewing', 'Interview', 'Offer'].map((stage, i) => {
            const counts = [12, 5, 3, 1];
            return (
              <div key={stage} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">{stage}</h3>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                    {counts[i]}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(counts[i] / 21) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Icon component needed that was used above
function Eye(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
