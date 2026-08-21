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
  Plus,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { jobsApi, usersApi } from '@swipex/api';
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
    description: 'We are looking for a Senior Frontend Engineer to help us build the next generation of web development tools at Vercel.',
    requirements: [
      '5+ years of production frontend software engineering experience',
      'Expert proficiency in React 19, Next.js App Router, and TypeScript',
    ],
    benefits: ['Full remote flexibility', 'Unlimited PTO', '$3,000 learning stipend'],
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
    description: 'Stripe is building financial infrastructure for the internet.',
    requirements: ['4+ years building distributed full stack web apps'],
    benefits: ['Competitive equity package', 'Flexible hybrid office policy'],
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
    description: 'Help craft the mobile experience for millions of travelers around the world.',
    requirements: ['3+ years React Native mobile development'],
    benefits: ['$2,000 annual travel credit'],
  },
];

const recruiterCandidates = [
  {
    id: 'c1',
    name: 'Alex Rivers',
    title: 'Senior React & Next.js Architect',
    matchScore: 96,
    experience: '6+ years',
    location: 'San Francisco, CA',
    skills: ['React 19', 'Next.js', 'TypeScript', 'TailwindCSS'],
    avatarColor: '#3B82F6',
    initials: 'AR',
  },
  {
    id: 'c2',
    name: 'Sarah Chen',
    title: 'Full Stack Engineer (Node / Postgres)',
    matchScore: 92,
    experience: '5 years',
    location: 'Remote (US)',
    skills: ['Node.js', 'React', 'PostgreSQL', 'Docker'],
    avatarColor: '#10B981',
    initials: 'SC',
  },
  {
    id: 'c3',
    name: 'Michael Vance',
    title: 'Mobile Developer (React Native / iOS)',
    matchScore: 89,
    experience: '4 years',
    location: 'New York, NY',
    skills: ['React Native', 'Swift', 'Redux', 'GraphQL'],
    avatarColor: '#8B5CF6',
    initials: 'MV',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  // Dynamic lists from DB
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('Remote');
  const [newJobSalary, setNewJobSalary] = useState('$150,000 - $190,000');
  const [jobPostedSuccess, setJobPostedSuccess] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      setDashboardError(null);
      try {
        if (user?.role === 'RECRUITER') {
          const list = await usersApi.getCandidates();
          setCandidates(list);
        } else {
          const feed = await jobsApi.getJobFeed(1, 10);
          setJobs(feed);
        }
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setDashboardError('Failed to retrieve live data from the database.');
      } finally {
        setIsLoading(false);
      }
    }
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const name = user?.fullName ? user.fullName.split(' ')[0] : 'User';
  const isRecruiter = user?.role === 'RECRUITER';

  const candidateStats = [
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

  const recruiterStats = [
    {
      title: 'Active Job Listings',
      value: '6 Roles',
      trend: '+2 posted this week',
      trendUp: true,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/jobs',
    },
    {
      title: 'Matched Candidates',
      value: '142',
      trend: '92% high ATS match',
      trendUp: true,
      icon: UserCheck,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      href: '/applications',
    },
    {
      title: 'Pending Reviews',
      value: '18',
      trend: 'Requires decision',
      trendUp: false,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      href: '/applications',
    },
    {
      title: 'Interviews Scheduled',
      value: '5',
      trend: 'Next today at 4 PM',
      trendUp: true,
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/applications',
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

  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle) return;
    setJobPostedSuccess(true);
    setTimeout(() => {
      setJobPostedSuccess(false);
      setIsPostJobModalOpen(false);
      setNewJobTitle('');
    }, 1200);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground animate-pulse">Loading live workspace...</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl bg-destructive/5 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg">Connection Failure</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">{dashboardError}</p>
        <Button onClick={() => window.location.reload()} className="rounded-xl font-bold">Retry Connection</Button>
      </div>
    );
  }

  // RECRUITER DASHBOARD VIEW
  if (isRecruiter) {
    return (
      <div className="space-y-8 pb-20 md:pb-0">
        {/* Recruiter Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, {name} 👋</h1>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
                Recruiter Portal
              </span>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Manage open job requisitions, candidate matches, and hiring pipelines.
            </p>
          </div>
          <Button
            onClick={() => setIsPostJobModalOpen(true)}
            className="w-full md:w-auto h-11 px-6 font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        {/* Recruiter Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recruiterStats.map((stat, i) => (
            <div
              key={i}
              onClick={() => router.push(stat.href)}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-xs transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
            >
              <div className="relative flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-black tracking-tight">{stat.value}</p>
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
            </div>
          ))}
        </div>

        {/* Main Recruiter Content Grid */}
        <div className="grid gap-6 md:grid-cols-7">
          {/* Candidates Pipeline Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Top Candidate Matches
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/applications')}
                className="text-xs font-semibold text-primary hover:text-primary/80"
              >
                Pipeline View <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-3">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-xs"
                      style={{ backgroundColor: c.avatarColor }}
                    >
                      {c.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {c.name}
                        </h3>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {c.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">{c.title}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {c.skills.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-semibold bg-secondary px-2 py-0.5 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <Button size="sm" className="rounded-xl text-xs font-bold w-full sm:w-auto">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Job Requisitions */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Active Requisitions</h2>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
              {[
                { title: 'Senior Frontend Engineer', count: '42 Candidates', location: 'Remote' },
                { title: 'Full Stack Developer', count: '28 Candidates', location: 'San Francisco' },
                { title: 'Product Designer', count: '19 Candidates', location: 'Remote' },
              ].map((job, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border hover:border-primary/40 transition-all cursor-pointer">
                  <div>
                    <h4 className="font-bold text-sm">{job.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{job.location}</p>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {job.count}
                  </span>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => setIsPostJobModalOpen(true)}
                className="w-full text-xs font-bold rounded-xl mt-2"
              >
                + Post Another Job
              </Button>
            </div>
          </div>
        </div>

        {/* Post Job Modal */}
        {isPostJobModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsPostJobModalOpen(false)}>
            <form onSubmit={handlePostJobSubmit} className="bg-card border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-lg">Post New Job Listing</h3>
                <button type="button" onClick={() => setIsPostJobModalOpen(false)} className="p-1.5 rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs font-semibold block mb-1">Role Title</label>
                  <input required type="text" placeholder="e.g. Senior Backend Engineer" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Location</label>
                  <input type="text" placeholder="Remote / SF / NYC" value={newJobLocation} onChange={(e) => setNewJobLocation(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Target Salary Range</label>
                  <input type="text" placeholder="$140,000 - $180,000" value={newJobSalary} onChange={(e) => setNewJobSalary(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm font-medium" />
                </div>
              </div>

              {jobPostedSuccess && (
                <p className="text-xs font-bold text-emerald-500 text-center animate-bounce">
                  ✓ Job Listing Published Successfully!
                </p>
              )}

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsPostJobModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 rounded-xl font-bold">Publish Job</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // JOB SEEKER DASHBOARD VIEW (Default)
  const topMatchJob = jobs[0];

  return (
    <div className="space-y-8 pb-20 md:pb-0">
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
          className="w-full md:w-auto h-11 px-6 font-bold shadow-md bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white hover:scale-105 transition-all"
        >
          <Sparkles className="mr-2 h-4 w-4 text-emerald-300 animate-pulse" />
          Find Matches
        </Button>
      </div>

      {/* Dominant Feature: "Your Next Best Match" (Career Command Center) */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Left: Main Job Feature */}
        <div className="lg:col-span-7 bg-card border border-primary/20 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                YOUR NEXT BEST MATCH
              </span>
              <span className="text-2xl font-black text-primary">{topMatchJob.matchPercentage}% MATCH</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-foreground font-extrabold text-2xl shadow-sm">
                {topMatchJob.companyInitials}
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {topMatchJob.title}
                </h2>
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className="text-foreground">{topMatchJob.company}</span> • <span>{topMatchJob.location}</span>
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {topMatchJob.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {topMatchJob.skills.map((skill, idx) => (
                <span key={idx} className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary border border-border text-foreground">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-sm font-extrabold text-primary">{topMatchJob.salary}</span>
            <Button onClick={() => setSelectedJob(topMatchJob)} className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
              Apply Now
            </Button>
          </div>
        </div>

        {/* Right: "Why this matches you" Breakdown with Radial Score */}
        <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h3 className="font-extrabold text-base tracking-tight">Why this matches you</h3>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                AI Verified
              </span>
            </div>

            <div className="flex items-center gap-6 mb-4">
              {/* Radial Donut Gauge */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary stroke-current"
                    strokeWidth="3.5"
                    strokeDasharray="96, 100"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-primary leading-none">96%</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Match</span>
                </div>
              </div>

              {/* Differentiated Metrics */}
              <div className="flex-1 space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground">Skills</span>
                    <span className="text-primary font-bold">94%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="text-indigo-500 dark:text-indigo-400 font-bold">91%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '91%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground">Location</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">100%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground">Salary</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">88%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setSelectedJob(topMatchJob)}
            className="w-full text-xs font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/10"
          >
            View Full Analysis
          </Button>
        </div>
      </div>

      {/* Compact Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {candidateStats.map((stat, i) => (
          <div
            key={i}
            onClick={() => router.push(stat.href)}
            className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
          >
            <div className="relative flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-black tracking-tight">{stat.value}</p>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110", stat.bgColor, stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px]">
              <span className={cn("font-semibold", stat.trendUp ? "text-emerald-400" : "text-amber-400")}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Recommended Jobs Column */}
        <div className="md:col-span-4 space-y-4">
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
            {jobs.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl p-6 bg-card text-xs text-muted-foreground">
                No recommended jobs matching your profile yet.
              </div>
            ) : jobs.map((job) => (
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
        </div>

        {/* Recent Activity Column */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-6">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {recentActivity.map((act) => {
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
        </div>
      </div>

      {/* Modal for detailed job view */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
