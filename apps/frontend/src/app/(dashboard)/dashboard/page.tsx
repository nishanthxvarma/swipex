'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MapPin,
  Sparkles,
  UserCheck,
  Users,
  Loader2,
  ArrowRight,
  TrendingUp,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { jobsApi, usersApi, analyticsApi } from '@swipex/api';
import { JobDetailModal } from '@/components/jobs/job-detail-modal';
import { SwipeStack } from '@/components/swipe/swipe-stack';
import { Job } from '@/components/swipe/swipe-card';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Dynamic live state from PostgreSQL
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [candidateAnalytics, setCandidateAnalytics] = useState<any>(null);
  const [recruiterAnalytics, setRecruiterAnalytics] = useState<any>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      setDashboardError(null);
      try {
        if (user?.role === 'RECRUITER') {
          const [recStats, appPipeline] = await Promise.allSettled([
            analyticsApi.getRecruiterAnalytics('30d'),
            jobsApi.getRecruiterPipeline()
          ]);
          if (recStats.status === 'fulfilled') setRecruiterAnalytics(recStats.value);
          if (appPipeline.status === 'fulfilled') setApplications(appPipeline.value || []);
        } else {
          const [jobFeed, candStats, userApps] = await Promise.allSettled([
            jobsApi.getJobFeed(1, 10),
            analyticsApi.getCandidateAnalytics('30d'),
            jobsApi.getUserApplications()
          ]);

          if (jobFeed.status === 'fulfilled' && Array.isArray(jobFeed.value)) {
            const mappedJobs: Job[] = jobFeed.value.map((j: any) => ({
              id: String(j.id),
              company: j.company?.name || j.company_name || 'SwipeX Partner',
              companyInitials: (j.company?.name || j.company_name || 'SP').substring(0, 2).toUpperCase(),
              color: '#3B82F6',
              verified: true,
              title: j.title,
              location: j.location || 'Remote',
              type: j.job_type || j.type || 'Full-time',
              salary: j.salary_min && j.salary_max
                ? `$${Math.round(j.salary_min / 1000)}k - $${Math.round(j.salary_max / 1000)}k`
                : '$130,000 - $170,000',
              skills: j.skills_required || j.skills || ['TypeScript', 'React', 'Node.js'],
              matchPercentage: j.match_percentage || 90,
              competition: 'Medium',
              postedTime: 'Active Role',
              description: j.description || '',
              requirements: j.requirements ? [j.requirements] : [],
              benefits: j.benefits || [],
            }));
            setJobs(mappedJobs);
          }

          if (candStats.status === 'fulfilled') setCandidateAnalytics(candStats.value);
          if (userApps.status === 'fulfilled') setApplications(userApps.value || []);
        }
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setDashboardError('Could not sync with live database.');
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const name = user?.fullName ? user.fullName.split(' ')[0] : 'Engineer';
  const isRecruiter = user?.role === 'RECRUITER';

  const handleJobSwipe = async (job: Job, direction: 'left' | 'right') => {
    try {
      if (direction === 'right') {
        await jobsApi.swipeJob(job.id, 'right');
        await jobsApi.applyToJob(job.id, { coverLetter: '1-Tap Swipe Application', atsScore: job.matchPercentage });
      } else {
        await jobsApi.swipeJob(job.id, 'left');
      }
    } catch (err) {
      console.error('Swipe action error:', err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ── Personalized Greeting Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 text-[11px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{isRecruiter ? 'Recruiter Studio' : 'Candidate Workspace'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Good day, {name}
          </h1>
          <p className="text-xs text-slate-400">
            {isRecruiter
              ? 'Real-time candidate pipeline and role performance.'
              : `${jobs.length} active opportunities matching your technical profile.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isRecruiter ? (
            <Link
              href="/recruiter/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-xs font-bold text-primary-foreground shadow-sm transition-all"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Post New Role</span>
            </Link>
          ) : (
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/60 transition-colors"
            >
              <span>Explore All Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {dashboardError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{dashboardError}</span>
        </div>
      )}

      {/* ── Key Metrics Grid (100% Real DB Data) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isRecruiter ? (
          <>
            <div className="p-4 rounded-xl bg-[#0C1119] border border-slate-800/80 space-y-1">
              <p className="text-[11px] font-mono font-semibold uppercase text-slate-500">Active Roles</p>
              <p className="text-2xl font-bold text-slate-100">{recruiterAnalytics?.activeJobsCount ?? 0}</p>
              <span className="text-[11px] text-slate-400">Open listings</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0C1119] border border-slate-800/80 space-y-1">
              <p className="text-[11px] font-mono font-semibold uppercase text-slate-500">Applications</p>
              <p className="text-2xl font-bold text-slate-100">{recruiterAnalytics?.applicationsReceivedCount ?? 0}</p>
              <span className="text-[11px] text-slate-400">Total received</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0C1119] border border-slate-800/80 space-y-1">
              <p className="text-[11px] font-mono font-semibold uppercase text-slate-500">Shortlisted</p>
              <p className="text-2xl font-bold text-slate-100">{recruiterAnalytics?.shortlistedCount ?? 0}</p>
              <span className="text-[11px] text-slate-400">Top tier matches</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0C1119] border border-slate-800/80 space-y-1">
              <p className="text-[11px] font-mono font-semibold uppercase text-slate-500">Avg ATS Alignment</p>
              <p className="text-2xl font-bold text-emerald-400">{recruiterAnalytics?.avgApplicantMatchScore ? `${recruiterAnalytics.avgApplicantMatchScore}%` : '—'}</p>
              <span className="text-[11px] text-slate-400">Deterministic scoring</span>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-xl bg-[#0C1119] border border-slate-800/80 space-y-1">
              <p className="text-[11px] font-mono font-semibold uppercase text-slate-500">Submitted Applications</p>
              <p className="text-2xl font-bold text-slate-100">{candidateAnalytics?.applicationsSubmitted ?? applications.length}</p>
              <Link href="/applications" className="text-[11px] text-primary hover:underline font-medium">View tracking →</Link>
            </div>
            <div className="p-4 rounded-xl bg-[#0C1119] border border-slate-800/80 space-y-1">
              <p className="text-[11px] font-mono font-semibold uppercase text-slate-500">Roles Viewed</p>
              <p className="text-2xl font-bold text-slate-100">{candidateAnalytics?.totalJobsViewed ?? 0}</p>
              <span className="text-[11px] text-slate-400">Total swipe impressions</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0C1119] border border-slate-800/80 space-y-1">
              <p className="text-[11px] font-mono font-semibold uppercase text-slate-500">ATS Readiness</p>
              <p className="text-2xl font-bold text-emerald-400">{candidateAnalytics?.careerScore ? `${candidateAnalytics.careerScore}%` : '—'}</p>
              <Link href="/resume" className="text-[11px] text-primary hover:underline font-medium">Analyze resume →</Link>
            </div>
            <div className="p-4 rounded-xl bg-[#0C1119] border border-slate-800/80 space-y-1">
              <p className="text-[11px] font-mono font-semibold uppercase text-slate-500">Profile Completion</p>
              <p className="text-2xl font-bold text-slate-100">{candidateAnalytics?.profileCompletionPct ? `${candidateAnalytics.profileCompletionPct}%` : '—'}</p>
              <Link href="/profile" className="text-[11px] text-primary hover:underline font-medium">Edit profile →</Link>
            </div>
          </>
        )}
      </div>

      {/* ── Main Interactive Section ── */}
      {!isRecruiter ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Swipe Feed */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">Opportunity Discovery Stack</h2>
                <p className="text-xs text-slate-400">Swipe right to submit instant application, left to pass.</p>
              </div>
              <span className="text-xs font-mono text-slate-500">{jobs.length} in stack</span>
            </div>

            <div className="pt-2">
              {isLoading ? (
                <div className="h-[520px] rounded-2xl bg-[#0C1119] border border-slate-800 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <SwipeStack
                  jobs={jobs}
                  onShowDetails={(job) => setSelectedJob(job)}
                  onSwipe={handleJobSwipe}
                />
              )}
            </div>
          </div>

          {/* Right Column: Recent Applications & Match Signals */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100">Recent Applications</h3>
                <Link href="/applications" className="text-xs text-primary hover:underline font-medium">
                  View all ({applications.length})
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs space-y-1">
                  <p className="font-semibold text-slate-400">No applications submitted yet.</p>
                  <p>Swipe right on any role card to submit your profile.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {applications.slice(0, 4).map((app: any) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{app.job?.title || 'Engineering Role'}</p>
                        <p className="text-[11px] text-slate-500">{app.job?.company?.name || 'Company'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-primary/10 text-primary border border-primary/20">
                        {app.status || 'applied'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Deterministic Scoring Engine</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                SwipeX matches your profile based on verified keyword presence, years of experience, and role requirements without black-box filtering.
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full h-9 rounded-xl border-slate-800 text-xs font-semibold hover:bg-slate-800 text-slate-300"
              >
                <Link href="/resume">Upload Updated Resume</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Recruiter Dashboard Overview */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">Candidate Pipeline Stages</h3>
                <p className="text-xs text-slate-400">Overview of applicants moving through your hiring workflow.</p>
              </div>
              <Link href="/recruiter/pipeline" className="text-xs text-primary hover:underline font-semibold">
                Open Kanban Pipeline →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
              {['applied', 'reviewing', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'].map((stage) => {
                const count = applications.filter((a: any) => a.status?.toLowerCase() === stage).length;
                return (
                  <div key={stage} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
                    <p className="text-[10px] font-mono font-bold uppercase text-slate-500">{stage}</p>
                    <p className="text-xl font-bold text-slate-200">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => {
            handleJobSwipe(selectedJob, 'right');
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}
