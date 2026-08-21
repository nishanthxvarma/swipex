'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2, Calendar, Clock, FileText, Plus, Sparkles, UserCheck, 
  Users, ArrowUpRight, CheckCircle2, X, Eye, Loader2, AlertCircle, Briefcase, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { usersApi, jobsApi, analyticsApi } from '@swipex/api';

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('Remote');
  const [newJobSalary, setNewJobSalary] = useState('$150,000 - $190,000');
  const [newJobRequirements, setNewJobRequirements] = useState('React, TypeScript, Node.js');
  const [isPosting, setIsPosting] = useState(false);
  const [jobPostedSuccess, setJobPostedSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [candList, stats] = await Promise.allSettled([
          usersApi.getCandidates(),
          analyticsApi.getRecruiterAnalytics('30d')
        ]);
        if (candList.status === 'fulfilled') setCandidates(candList.value || []);
        if (stats.status === 'fulfilled') setAnalytics(stats.value);
      } catch (err: any) {
        console.error('Recruiter dashboard error:', err);
        setError('Could not load recruiter data from database.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;
    setIsPosting(true);
    try {
      await jobsApi.createJob({
        title: newJobTitle,
        location: newJobLocation,
        salary: newJobSalary,
        requirements: newJobRequirements,
        description: `We are hiring a ${newJobTitle} to join our team.`,
        skills: newJobRequirements.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setJobPostedSuccess(true);
      setTimeout(() => {
        setJobPostedSuccess(false);
        setIsPostJobModalOpen(false);
        setNewJobTitle('');
      }, 1500);
    } catch (err) {
      console.error('Job creation error:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const name = user?.fullName ? user.fullName.split(' ')[0] : 'Recruiter';

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 text-[11px] font-mono text-slate-300 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Recruiter Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Welcome, {name}
          </h1>
          <p className="text-xs text-slate-400">
            Hiring metrics, talent discovery feed, and pipeline performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsPostJobModalOpen(true)}
            className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Post New Role</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recruiter Metrics Grid (100% Real DB Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500">Active Listings</p>
          <p className="text-2xl font-bold text-slate-100">{analytics?.activeJobsCount ?? 0}</p>
          <Link href="/recruiter/jobs" className="text-[11px] text-primary hover:underline font-medium">Manage jobs →</Link>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500">Applications Received</p>
          <p className="text-2xl font-bold text-slate-100">{analytics?.applicationsReceivedCount ?? 0}</p>
          <Link href="/recruiter/pipeline" className="text-[11px] text-primary hover:underline font-medium">View pipeline →</Link>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500">Shortlisted</p>
          <p className="text-2xl font-bold text-slate-100">{analytics?.shortlistedCount ?? 0}</p>
          <span className="text-[11px] text-slate-400">High alignment</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500">Hiring Conversion</p>
          <p className="text-2xl font-bold text-emerald-400">{analytics?.hiringConversionPct ?? 0}%</p>
          <span className="text-[11px] text-slate-400">Application to hire</span>
        </div>
      </div>

      {/* Discover Candidates Section */}
      <div className="p-6 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">Discovered Candidates</h3>
            <p className="text-xs text-slate-400">Software engineers available for matching.</p>
          </div>
          <Link href="/recruiter/candidates" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
            <span>Swipe Discovery Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-400">No candidates available</p>
            <p>New candidate profiles will appear here as engineers register.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {candidates.slice(0, 3).map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                    {(c.name || 'Candidate').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{c.name || 'Candidate'}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{c.title || c.headline || 'Software Engineer'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(c.skills || ['TypeScript', 'React']).slice(0, 3).map((s: string, idx: number) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Job Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0C1119] border border-slate-700/80 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Create New Job Posting</h3>
              <button onClick={() => setIsPostJobModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {jobPostedSuccess ? (
              <div className="p-6 text-center space-y-2 text-emerald-400">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="text-sm font-bold">Job Published Successfully!</p>
              </div>
            ) : (
              <form onSubmit={handlePostJob} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <Label className="text-slate-300">Job Title</Label>
                  <Input
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Architect"
                    required
                    className="bg-slate-900 border-slate-700 text-slate-100 text-xs h-9 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300">Location</Label>
                  <Input
                    value={newJobLocation}
                    onChange={(e) => setNewJobLocation(e.target.value)}
                    placeholder="e.g. Remote (US) or San Francisco, CA"
                    className="bg-slate-900 border-slate-700 text-slate-100 text-xs h-9 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300">Compensation</Label>
                  <Input
                    value={newJobSalary}
                    onChange={(e) => setNewJobSalary(e.target.value)}
                    placeholder="e.g. $140,000 - $180,000"
                    className="bg-slate-900 border-slate-700 text-slate-100 text-xs h-9 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300">Required Skills (comma-separated)</Label>
                  <Input
                    value={newJobRequirements}
                    onChange={(e) => setNewJobRequirements(e.target.value)}
                    placeholder="e.g. React, TypeScript, Next.js, Node.js"
                    className="bg-slate-900 border-slate-700 text-slate-100 text-xs h-9 rounded-xl"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsPostJobModalOpen(false)}
                    className="flex-1 h-9 rounded-xl text-slate-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPosting}
                    className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  >
                    {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Listing'}
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
