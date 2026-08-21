'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Bookmark, Search, MapPin, DollarSign, Trash2, CheckCircle2, ArrowRight, Loader2, AlertCircle, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { jobsApi } from '@swipex/api';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedJobId, setAppliedJobId] = useState<string | null>(null);

  const loadSavedJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await jobsApi.getSavedJobs(1);
      if (Array.isArray(list)) {
        setSavedJobs(list);
      }
    } catch (err: any) {
      console.error('Failed to load saved jobs:', err);
      setError('Could not retrieve saved jobs from the database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  const handleRemove = async (jobId: string) => {
    try {
      await jobsApi.saveJob(jobId);
      setSavedJobs((prev) => prev.filter((s) => s.job_id !== jobId && s.jobId !== jobId && s.id !== jobId));
    } catch (err) {
      console.error('Remove saved job error:', err);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await jobsApi.applyToJob(jobId, { coverLetter: '1-Tap Application from Saved Roles' });
      setAppliedJobId(jobId);
      setTimeout(() => setAppliedJobId(null), 3000);
    } catch (err) {
      console.error('Apply error:', err);
    }
  };

  const filteredJobs = savedJobs.filter((s) => {
    const title = s.job?.title || s.title || '';
    const company = s.job?.company?.name || s.job?.company || s.company || '';
    if (!search.trim()) return true;
    return title.toLowerCase().includes(search.toLowerCase()) || company.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Saved Opportunities</h1>
          <p className="text-xs text-slate-400">Bookmarked positions saved during discovery.</p>
        </div>

        <Button asChild className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm">
          <Link href="/jobs">
            <span>Discover More</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Filter */}
      <div className="p-3.5 rounded-2xl bg-[#0C1119] border border-slate-800/80">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved positions..."
            className="pl-9 bg-slate-900/80 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs h-9 rounded-xl"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 rounded-2xl bg-[#0C1119] border border-slate-800 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-[#0C1119] rounded-2xl border border-slate-800 max-w-lg mx-auto space-y-4 my-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No saved roles found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When browsing the Job Feed, click the bookmark icon on any card to save it for later review.
            </p>
          </div>
          <Button asChild className="h-9 px-4 rounded-xl bg-primary text-xs font-bold">
            <Link href="/jobs">Browse Job Discovery Feed</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((item) => {
            const j = item.job || item;
            const jobId = item.job_id || item.jobId || item.id;
            const companyName = j.company?.name || j.company || 'Partner';
            const initials = companyName.substring(0, 2).toUpperCase();
            const salary = j.salary_min && j.salary_max
              ? `$${Math.round(j.salary_min / 1000)}k - $${Math.round(j.salary_max / 1000)}k`
              : j.salary || '$130,000 - $170,000';

            return (
              <div
                key={jobId}
                className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4 hover-lift"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-xs text-slate-200">
                        {initials}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-200">{companyName}</p>
                        <p className="text-[11px] text-slate-500">{j.location || 'Remote'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(jobId)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 leading-snug">
                    {j.title || 'Engineering Role'}
                  </h3>

                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {salary}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {item.saved_at || item.savedAt ? new Date(item.saved_at || item.savedAt).toLocaleDateString() : 'Saved'}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleApply(jobId)}
                    disabled={appliedJobId === jobId}
                    className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {appliedJobId === jobId ? (
                      <span className="flex items-center gap-1 text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Applied
                      </span>
                    ) : (
                      '1-Tap Apply'
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
