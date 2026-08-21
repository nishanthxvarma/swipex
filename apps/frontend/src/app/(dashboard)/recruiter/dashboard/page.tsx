'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  Clock,
  FileText,
  Plus,
  Sparkles,
  UserCheck,
  Users,
  ArrowUpRight,
  CheckCircle2,
  X,
  Eye,
  MessageSquare,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { usersApi } from '@swipex/api';
import { Loader2, AlertTriangle } from 'lucide-react';

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

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadCandidates() {
      setIsLoading(true);
      setError(null);
      try {
        const list = await usersApi.getCandidates();
        setCandidates(list);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load candidate list from database.');
      } finally {
        setIsLoading(false);
      }
    }
    loadCandidates();
  }, []);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('Remote');
  const [newJobSalary, setNewJobSalary] = useState('$150,000 - $190,000');
  const [jobPostedSuccess, setJobPostedSuccess] = useState(false);

  const name = user?.fullName ? user.fullName.split(' ')[0] : 'Recruiter';

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground animate-pulse">Loading live dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl bg-destructive/5 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg">Connection Failure</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="rounded-xl font-bold">Retry Connection</Button>
      </div>
    );
  }

  const recruiterStats = [
    {
      title: 'Active Job Listings',
      value: '6 Roles',
      trend: '+2 posted this week',
      trendUp: true,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/recruiter/jobs',
    },
    {
      title: 'Matched Candidates',
      value: '142',
      trend: '92% high ATS match',
      trendUp: true,
      icon: UserCheck,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      href: '/recruiter/candidates',
    },
    {
      title: 'Pending Reviews',
      value: '18',
      trend: 'Requires decision',
      trendUp: false,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      href: '/recruiter/pipeline',
    },
    {
      title: 'Interviews Scheduled',
      value: '5',
      trend: 'Next today at 4 PM',
      trendUp: true,
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/recruiter/pipeline',
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

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, {name} 👋</h1>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
              Employer Workspace
            </span>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Manage open job requisitions, candidate matches, and hiring pipelines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/recruiter/candidates')}
            variant="outline"
            className="w-full md:w-auto h-11 px-5 font-bold rounded-xl"
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Swipe Candidates
          </Button>
          <Button
            onClick={() => setIsPostJobModalOpen(true)}
            className="w-full md:w-auto h-11 px-6 font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>
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

      {/* Main Recruiter Grid */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Candidates Stream */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Top Candidate Matches
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/recruiter/pipeline')}
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
                  <Button
                    size="sm"
                    onClick={() => router.push('/recruiter/pipeline')}
                    className="rounded-xl text-xs font-bold w-full sm:w-auto"
                  >
                    Shortlist Candidate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Requisitions */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Active Job Postings</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/recruiter/jobs')}
              className="text-xs font-semibold text-primary"
            >
              Manage Roles
            </Button>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
            {[
              { title: 'Senior Frontend Engineer', count: '42 Applicants', location: 'Remote' },
              { title: 'Full Stack Developer', count: '28 Applicants', location: 'San Francisco' },
              { title: 'Product Designer', count: '19 Applicants', location: 'Remote' },
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
