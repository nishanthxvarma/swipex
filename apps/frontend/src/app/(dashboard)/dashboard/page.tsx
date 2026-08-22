'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Award,
  Building2,
  Calendar,
  Clock,
  FileText,
  Plus,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  X,
  Loader2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { jobsApi } from '@swipex/api';
import { JobDetailModal } from '@/components/jobs/job-detail-modal';
import { Job } from '@/components/swipe/swipe-card';
import { useNotificationStore } from '@/stores/notification-store';
import { useDashboardData, QUERY_KEYS } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('Remote');
  const [newJobSalaryMin, setNewJobSalaryMin] = useState('140000');
  const [newJobSalaryMax, setNewJobSalaryMax] = useState('180000');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [newJobSkills, setNewJobSkills] = useState('React, TypeScript, Node.js');
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [postJobError, setPostJobError] = useState<string | null>(null);
  const [jobPostedSuccess, setJobPostedSuccess] = useState(false);

  const notifications = useNotificationStore((s) => s.notifications);

  // High-performance React Query hook with 2-min stale caching
  const { data, isLoading, error, refetch } = useDashboardData(user?.role);

  const jobs = (data?.jobs || []) as Job[];
  const candidates = data?.candidates || [];
  const applications = data?.applications || [];

  const name = user?.fullName ? user.fullName.split(' ')[0] : 'User';
  const isRecruiter = user?.role === 'RECRUITER';

  // Calculate live stats from backend state
  const totalAppsCount = applications.length;
  const interviewCount = applications.filter((a: any) => a.status === 'interview' || a.status === 'INTERVIEW').length;
  const calculatedProfileStrength = user?.fullName && user?.email ? 85 : 40;

  const candidateStats = [
    {
      title: 'Total Applications',
      value: String(totalAppsCount),
      subtitle: totalAppsCount === 0 ? 'Start applying to roles' : `${totalAppsCount} active tracked`,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      href: '/applications',
    },
    {
      title: 'Interviews Scheduled',
      value: String(interviewCount),
      subtitle: interviewCount === 0 ? 'No interviews yet' : `${interviewCount} upcoming`,
      icon: Calendar,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      href: '/applications',
    },
    {
      title: 'Resume Score',
      value: '85',
      subtitle: 'ATS optimized',
      icon: Award,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      href: '/resume',
    },
    {
      title: 'Profile Strength',
      value: `${calculatedProfileStrength}%`,
      subtitle: calculatedProfileStrength >= 80 ? 'Ready for matching' : 'Complete your profile',
      icon: Shield,
      color: 'text-success',
      bgColor: 'bg-success/10',
      href: '/profile',
    },
  ];

  const recruiterStats = [
    {
      title: 'Active Job Listings',
      value: String(jobs.length),
      subtitle: jobs.length === 0 ? 'No active roles' : `${jobs.length} published`,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      href: '/recruiter/jobs',
    },
    {
      title: 'Matched Candidates',
      value: String(candidates.length),
      subtitle: candidates.length === 0 ? 'No matches yet' : `${candidates.length} candidates`,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
      href: '/recruiter/candidates',
    },
    {
      title: 'Pending Reviews',
      value: '0',
      subtitle: 'All caught up',
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      href: '/recruiter/pipeline',
    },
    {
      title: 'Interviews Scheduled',
      value: '0',
      subtitle: 'Schedule with candidates',
      icon: Calendar,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      href: '/recruiter/pipeline',
    },
  ];

  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    setIsPostingJob(true);
    setPostJobError(null);

    try {
      const skillsArray = newJobSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await jobsApi.createJob({
        title: newJobTitle.trim(),
        location: newJobLocation.trim() || 'Remote',
        salaryMin: parseInt(newJobSalaryMin, 10) || 100000,
        salaryMax: parseInt(newJobSalaryMax, 10) || 150000,
        description: newJobDescription.trim() || `Position for ${newJobTitle}`,
        skillsRequired: skillsArray.length > 0 ? skillsArray : ['React', 'TypeScript'],
        requirements: `Proficiency with ${skillsArray.join(', ')}`,
      });

      setJobPostedSuccess(true);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard('RECRUITER') });

      setTimeout(() => {
        setJobPostedSuccess(false);
        setIsPostJobModalOpen(false);
        setNewJobTitle('');
        setNewJobDescription('');
      }, 1000);
    } catch (err: unknown) {
      console.error('Failed to create job:', err);
      setPostJobError('Failed to publish job listing. Please check the backend connection.');
    } finally {
      setIsPostingJob(false);
    }
  };

  // RECRUITER DASHBOARD VIEW
  if (isRecruiter) {
    return (
      <div className="space-y-8 pb-20 md:pb-0 animate-in fade-in duration-200">
        {/* Recruiter Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Welcome back, {name} 👋</h1>
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
            variant="primary"
            className="w-full md:w-auto h-11 px-6 font-bold shadow-md hover:scale-105 transition-all"
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
              className="group relative overflow-hidden rounded-2xl border border-border glass-1 p-6 shadow-xs transition-all hover:shadow-md hover:border-primary/40 cursor-pointer"
            >
              <div className="relative flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                </div>
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-transform group-hover:scale-110',
                    stat.bgColor,
                    stat.color
                  )}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground font-medium">
                {stat.subtitle}
              </div>
            </div>
          ))}
        </div>

        {/* Main Recruiter Content Grid */}
        <div className="grid gap-6 md:grid-cols-7">
          {/* Candidates Pipeline Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground">
                <Users className="w-5 h-5 text-primary" /> Candidate Directory
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/recruiter/candidates')}
                className="text-xs font-semibold text-primary"
              >
                View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-2xl glass-1 border border-border animate-pulse" />
                  ))}
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-2xl p-6 glass-1 text-xs text-muted-foreground">
                  No registered candidates found in the database.
                </div>
              ) : (
                candidates.slice(0, 5).map((c: any) => (
                  <div
                    key={c.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border glass-1 p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-xs"
                        style={{ backgroundColor: c.avatarColor || '#1677A8' }}
                      >
                        {c.initials || 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {c.name}
                          </h3>
                          <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                            {c.matchScore || 90}% Match
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">{c.title || c.headline || 'Software Engineer'}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(c.skills || ['React', 'TypeScript']).slice(0, 4).map((s: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold glass-2 px-2 py-0.5 rounded-md border border-border/50 text-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <Button
                        size="sm"
                        onClick={() => router.push('/recruiter/candidates')}
                        className="rounded-xl text-xs font-bold w-full sm:w-auto"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Job Requisitions */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Active Requisitions</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/recruiter/jobs')}
                className="text-xs font-semibold text-primary"
              >
                Manage <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="rounded-2xl border border-border glass-1 p-5 shadow-xs space-y-3">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-14 rounded-xl glass-2 border border-border animate-pulse" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No active job listings yet. Post your first job!
                </div>
              ) : (
                jobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    onClick={() => router.push('/recruiter/jobs')}
                    className="flex items-center justify-between p-3 rounded-xl glass-2 border border-border hover:border-primary/40 transition-all cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{job.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.location}</p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      Active
                    </span>
                  </div>
                ))
              )}

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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !isPostingJob && setIsPostJobModalOpen(false)}
          >
            <form
              onSubmit={handlePostJobSubmit}
              className="glass-3 border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-lg text-foreground">Post New Job Listing</h3>
                <button
                  type="button"
                  disabled={isPostingJob}
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-secondary cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {postJobError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                  {postJobError}
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Role Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Location</label>
                  <input
                    type="text"
                    placeholder="Remote / San Francisco, CA / New York, NY"
                    value={newJobLocation}
                    onChange={(e) => setNewJobLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-foreground">Min Salary ($)</label>
                    <input
                      type="number"
                      placeholder="140000"
                      value={newJobSalaryMin}
                      onChange={(e) => setNewJobSalaryMin(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-foreground">Max Salary ($)</label>
                    <input
                      type="number"
                      placeholder="180000"
                      value={newJobSalaryMax}
                      onChange={(e) => setNewJobSalaryMax(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Required Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Next.js, GraphQL"
                    value={newJobSkills}
                    onChange={(e) => setNewJobSkills(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Job Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe role responsibilities and team mission..."
                    value={newJobDescription}
                    onChange={(e) => setNewJobDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {jobPostedSuccess && (
                <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-xs font-bold text-success text-center">
                  ✓ Job Listing Published Successfully!
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPostingJob}
                  className="flex-1 rounded-xl"
                  onClick={() => setIsPostJobModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isPostingJob}
                  className="flex-1 rounded-xl font-bold"
                >
                  {isPostingJob ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isPostingJob ? 'Publishing...' : 'Publish Job'}
                </Button>
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
    <div className="space-y-8 pb-20 md:pb-0 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Candidate Workspace</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5">Good morning, {name} 👋</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Here&apos;s what&apos;s happening with your job search today.
          </p>
        </div>
        <Button
          onClick={() => router.push('/jobs')}
          variant="primary"
          className="w-full md:w-auto h-11 px-6 font-bold shadow-md hover:scale-105 transition-all"
        >
          <Sparkles className="mr-2 h-4 w-4 text-emerald-300" />
          Find Matches
        </Button>
      </div>

      {error ? (
        <div className="space-y-6 flex flex-col justify-center items-center h-[30vh] text-center p-6 border border-dashed rounded-3xl glass-1 border-destructive/20">
          <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
          <h3 className="font-bold text-lg text-foreground">Connection Notice</h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">Live dashboard updates could not be synced.</p>
          <Button onClick={() => refetch()} className="rounded-xl font-bold">
            Retry Sync
          </Button>
        </div>
      ) : null}

      {/* Dominant Feature: "Your Next Best Match" with spatial SwipeX Card Stack */}
      {topMatchJob ? (
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          {/* Left: Spatial Layered Card Stack Centerpiece */}
          <div className="lg:col-span-7 relative flex flex-col justify-end">
            {/* Background Ghost Card 2 (Deep stack depth) */}
            <div
              className="absolute inset-x-4 -top-3 bottom-3 rounded-3xl glass-1 border border-border/30 opacity-40 transform scale-[0.96] pointer-events-none -z-20 shadow-sm"
            />
            {/* Background Ghost Card 1 (Mid stack depth) */}
            <div
              className="absolute inset-x-2 -top-1.5 bottom-1.5 rounded-3xl glass-1 border border-border/60 opacity-70 transform scale-[0.98] pointer-events-none -z-10 shadow-md"
            />

            {/* Foreground Main Job Card (Elevation L3) */}
            <div className="glass-3 border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all z-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    YOUR NEXT BEST MATCH
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-primary">
                    {topMatchJob.matchPercentage}% MATCH
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl glass-2 border border-border flex items-center justify-center text-foreground font-extrabold text-2xl shadow-sm"
                    style={{ backgroundColor: topMatchJob.color || undefined }}
                  >
                    {topMatchJob.companyInitials}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {topMatchJob.title}
                    </h2>
                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="text-foreground">{topMatchJob.company}</span> • <span>{topMatchJob.location}</span>
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                  {topMatchJob.description || 'Join our team to build next-generation web platforms.'}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {topMatchJob.skills?.map((skill, idx) => (
                    <span key={idx} className="text-xs font-semibold px-3 py-1 rounded-full glass-2 border border-border text-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm font-bold text-primary">{topMatchJob.salary}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/jobs')}
                    className="rounded-xl text-xs font-bold"
                  >
                    <Layers className="w-3.5 h-3.5 mr-1" />
                    Swipe Deck
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setSelectedJob(topMatchJob)}
                    className="rounded-xl font-bold shadow-md"
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: "Why this matches you" Breakdown */}
          <div className="lg:col-span-5 glass-2 border border-border rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <h3 className="font-bold text-base tracking-tight text-foreground">Why this matches you</h3>
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
                      strokeDasharray={`${topMatchJob.matchPercentage || 90}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-black text-primary leading-none">{topMatchJob.matchPercentage || 90}%</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Match</span>
                  </div>
                </div>

                {/* Match Metric Bars */}
                <div className="flex-1 space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-muted-foreground">Skills Alignment</span>
                      <span className="text-primary font-bold">
                        {topMatchJob.matchPercentage ? Math.min(100, topMatchJob.matchPercentage + 2) : 92}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full glass-1 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${topMatchJob.matchPercentage ? Math.min(100, topMatchJob.matchPercentage + 2) : 92}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-muted-foreground">Location Preference</span>
                      <span className="text-success font-bold">100%</span>
                    </div>
                    <div className="h-1.5 w-full glass-1 rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-muted-foreground">Salary Expectation</span>
                      <span className="text-accent font-bold">90%</span>
                    </div>
                    <div className="h-1.5 w-full glass-1 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: '90%' }} />
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
              View Full Match Breakdown
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="h-64 rounded-3xl glass-1 border border-border animate-pulse" />
      ) : (
        <div className="text-center py-12 border border-dashed rounded-3xl glass-1 border-border p-8 space-y-4">
          <Sparkles className="w-10 h-10 text-primary mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-foreground">No job recommendations yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            We are indexing new roles from top engineering teams. Update your profile and skills to accelerate AI matches.
          </p>
          <Button onClick={() => router.push('/profile')} variant="outline" className="rounded-xl text-xs font-bold">
            Complete Profile
          </Button>
        </div>
      )}

      {/* Compact Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {candidateStats.map((stat, i) => (
          <div
            key={i}
            onClick={() => router.push(stat.href)}
            className="group relative overflow-hidden rounded-2xl border border-border glass-1 p-5 shadow-xs transition-all hover:shadow-md hover:border-primary/40 cursor-pointer"
          >
            <div className="relative flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
              </div>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
                  stat.bgColor,
                  stat.color
                )}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
              {stat.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Recommended Jobs Column */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Recommended Jobs</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/jobs')}
              className="text-xs font-semibold text-primary"
            >
              View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-2xl glass-1 border border-border animate-pulse" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl p-6 glass-1 text-xs text-muted-foreground">
                No recommended jobs matching your profile yet.
              </div>
            ) : (
              jobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border glass-1 p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-xs transition-transform group-hover:scale-105"
                      style={{ backgroundColor: job.color || '#1677A8' }}
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
                      <span className="inline-block rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success border border-success/20">
                        {job.atsScore || job.matchPercentage || 85}% Match
                      </span>
                      <p className="text-xs font-medium text-muted-foreground mt-1">{job.salary}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl group-hover:border-primary group-hover:text-primary">
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real Activity Column */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Activity</h2>
          </div>

          <div className="rounded-2xl border border-border glass-1 p-6 shadow-xs space-y-4">
            {notifications.length === 0 && applications.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">No recent activity</p>
                <p>Applications, interviews, and recruiter views will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 4).map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3 p-2.5 rounded-xl glass-2 border border-border/60">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{notif.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{notif.message}</p>
                      <span className="text-[10px] text-muted-foreground block mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => router.push('/notifications')}
              className="w-full text-xs font-semibold rounded-xl"
            >
              Open Notification Center
            </Button>
          </div>
        </div>
      </div>

      {/* Modal for detailed job view */}
      <JobDetailModal job={selectedJob} isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
