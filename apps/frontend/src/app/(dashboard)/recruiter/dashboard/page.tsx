'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  AlertTriangle,
  Loader2,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { analyticsApi, jobsApi } from '@swipex/api';
import { RecruiterAnalyticsSummary } from '@swipex/types';

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [stats, setStats] = useState<RecruiterAnalyticsSummary | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Post Job Modal State
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('Remote');
  const [newJobSalaryMin, setNewJobSalaryMin] = useState('120000');
  const [newJobSalaryMax, setNewJobSalaryMax] = useState('160000');
  const [newJobSkills, setNewJobSkills] = useState('React, TypeScript, Node.js');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [jobPostedSuccess, setJobPostedSuccess] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsData, jobsData, pipelineData] = await Promise.allSettled([
        analyticsApi.getRecruiterAnalytics('30d'),
        jobsApi.getRecruiterJobs(1, 10),
        jobsApi.getRecruiterPipeline(),
      ]);

      if (analyticsData.status === 'fulfilled' && analyticsData.value) {
        setStats(analyticsData.value);
      }
      if (jobsData.status === 'fulfilled' && Array.isArray(jobsData.value)) {
        setJobs(jobsData.value);
      }
      if (pipelineData.status === 'fulfilled' && Array.isArray(pipelineData.value)) {
        setPipeline(pipelineData.value);
      }
    } catch (err: any) {
      console.error('Recruiter dashboard error:', err);
      setError('Unable to synchronize live recruiter metrics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;
    setIsSubmittingJob(true);
    try {
      const skillsArray = newJobSkills.split(',').map((s) => s.trim()).filter(Boolean);
      await jobsApi.createJob({
        title: newJobTitle.trim(),
        location: newJobLocation.trim() || 'Remote',
        salaryMin: parseInt(newJobSalaryMin, 10) || 120000,
        salaryMax: parseInt(newJobSalaryMax, 10) || 160000,
        description: newJobDescription.trim() || `Position for ${newJobTitle.trim()}`,
        skillsRequired: skillsArray.length > 0 ? skillsArray : ['React', 'TypeScript'],
        requirements: `Proficiency in ${skillsArray.join(', ')}`,
      });

      setJobPostedSuccess(true);
      setTimeout(async () => {
        setJobPostedSuccess(false);
        setIsPostJobModalOpen(false);
        setNewJobTitle('');
        setNewJobDescription('');
        await loadDashboardData();
      }, 1000);
    } catch (err) {
      console.error('Failed to create job requisition:', err);
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const name = user?.fullName ? user.fullName.split(' ')[0] : 'Recruiter';

  const activeJobsCount = jobs.filter((j) => j.isActive !== false).length;
  const totalApplicantsCount = pipeline.length;
  const shortlistedCount = pipeline.filter((p) => p.stage === 'screening' || p.status === 'shortlisted').length;
  const interviewsCount = pipeline.filter((p) => p.stage === 'interview' || p.status === 'interview').length;

  return (
    <div className="space-y-8 pb-20 md:pb-0 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {name} 👋
            </h1>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
              Recruiter Workspace
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Authoritative hiring workspace synchronized directly with PostgreSQL.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/recruiter/candidates')}
            variant="outline"
            className="w-full md:w-auto h-10 px-4 font-bold rounded-xl"
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Discover Candidates
          </Button>
          <Button
            onClick={() => setIsPostJobModalOpen(true)}
            variant="primary"
            className="w-full md:w-auto h-10 px-5 font-bold shadow-md rounded-xl"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Post New Job
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => loadDashboardData()}>
            Retry
          </Button>
        </div>
      )}

      {/* Real Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-1 border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Jobs</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : activeJobsCount}
          </p>
          <p className="text-[11px] text-muted-foreground">Requisitions accepting applications</p>
        </div>

        <div className="glass-1 border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Applicants</span>
            <div className="p-2 rounded-xl bg-info/10 text-info">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-info" /> : totalApplicantsCount}
          </p>
          <p className="text-[11px] text-muted-foreground">Applications across all active roles</p>
        </div>

        <div className="glass-1 border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shortlisted</span>
            <div className="p-2 rounded-xl bg-success/10 text-success">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-success" /> : shortlistedCount}
          </p>
          <p className="text-[11px] text-muted-foreground">Candidates in active screening</p>
        </div>

        <div className="glass-1 border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interviews</span>
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-accent" /> : interviewsCount}
          </p>
          <p className="text-[11px] text-muted-foreground">Scheduled or conducted rounds</p>
        </div>
      </div>

      {/* Grid: Active Requisitions & Pipeline Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Requisitions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Active Job Requisitions
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/recruiter/jobs')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              View All Roles ({jobs.length})
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl glass-1 border border-border animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 border border-dashed rounded-2xl glass-1 border-border text-center space-y-3">
              <Building2 className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">No job requisitions posted yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Create a position to start receiving candidate applications.
              </p>
              <Button size="sm" variant="primary" onClick={() => setIsPostJobModalOpen(true)} className="rounded-xl">
                <Plus className="w-3.5 h-3.5 mr-1" /> Post Job
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  onClick={() => router.push('/recruiter/jobs')}
                  className="glass-1 border border-border hover:border-primary/40 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                          job.isActive !== false
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-muted/40 text-muted-foreground border-border'
                        )}
                      >
                        {job.isActive !== false ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{job.location || 'Remote'}</span>
                      <span>•</span>
                      <span>{job.salary || '$120K - $160K'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">
                        {job.applicationsCount || 0}
                      </span>
                      <p className="text-[10px] text-muted-foreground">Applicants</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Pipeline Activity */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Recent Pipeline Activity
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/recruiter/pipeline')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Open Pipeline
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl glass-1 border border-border animate-pulse" />
              ))}
            </div>
          ) : pipeline.length === 0 ? (
            <div className="p-8 border border-dashed rounded-2xl glass-1 border-border text-center space-y-3">
              <Users className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">No candidate applications yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Candidate applications will appear here as soon as candidates apply.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pipeline.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  onClick={() => router.push('/recruiter/pipeline')}
                  className="glass-1 border border-border hover:border-primary/40 rounded-2xl p-3.5 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0"
                      style={{ backgroundColor: app.color || '#3B82F6' }}
                    >
                      {app.initials || 'C'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                        {app.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                        {app.roleApplied}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                      {app.stage || 'new'}
                    </span>
                    <p className="text-[10px] text-muted-foreground">{app.appliedDate || 'Recent'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Job Modal */}
      {isPostJobModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsPostJobModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-3 border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Post New Position</h3>
                  <p className="text-xs text-muted-foreground">Publish to candidate discover feed in real-time</p>
                </div>
              </div>
              <button
                onClick={() => setIsPostJobModalOpen(false)}
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {jobPostedSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                <h4 className="font-bold text-base text-foreground">Job Published Successfully!</h4>
                <p className="text-xs text-muted-foreground">
                  The position is now discoverable by matching candidates in real-time.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePostJobSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Remote or San Francisco, CA"
                      value={newJobLocation}
                      onChange={(e) => setNewJobLocation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Salary Range (USD)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min"
                        value={newJobSalaryMin}
                        onChange={(e) => setNewJobSalaryMin(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-xs text-foreground"
                      />
                      <span className="text-muted-foreground">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={newJobSalaryMax}
                        onChange={(e) => setNewJobSalaryMax(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-xs text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Required Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Next.js, Node.js"
                    value={newJobSkills}
                    onChange={(e) => setNewJobSkills(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Description &amp; Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe role responsibilities, team environment, and expectations..."
                    value={newJobDescription}
                    onChange={(e) => setNewJobDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setIsPostJobModalOpen(false)}
                    disabled={isSubmittingJob}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 rounded-xl font-bold"
                    disabled={isSubmittingJob || !newJobTitle.trim()}
                  >
                    {isSubmittingJob ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Publish Requisition
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
