'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Search, MapPin, DollarSign, Calendar, Trash2, ArrowRight, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { jobsApi } from '@swipex/api';
import Link from 'next/link';

interface SavedJobItem {
  id: string;
  title: string;
  company: string;
  initials: string;
  color: string;
  location: string;
  salary: string;
  savedDate: string;
  match: number;
}

export default function SavedJobsPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'match' | 'date'>('match');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const loadSavedJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await jobsApi.getSavedJobs(1);
      const mapped = (list || []).map((s: any) => {
        const j = s.job || s;
        return {
          id: String(s.jobId || s.id),
          title: j?.title || 'Position',
          company: j?.company || 'SwipeX Partner',
          initials: (j?.company || 'S').substring(0, 2).toUpperCase(),
          color: j?.color || '#1677A8',
          location: j?.location || 'Remote',
          salary: j?.salary || '$120K - $160K',
          savedDate: s.savedAt ? new Date(s.savedAt).toLocaleDateString('en-US') : 'Recent',
          match: j?.matchPercentage || 85,
        };
      });
      setSavedJobs(mapped);
    } catch (err: unknown) {
      console.error('Saved jobs load error:', err);
      setError('Failed to load saved jobs from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  const handleRemove = async (id: string) => {
    try {
      await jobsApi.unsaveJob(id);
      setSavedJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      console.error('Failed to unsave job:', err);
    }
  };

  const handleApply = async (id: string) => {
    setAppliedId(id);
    try {
      await jobsApi.applyToJob(id);
    } catch (err) {
      console.error('Failed to apply:', err);
    }
  };

  const filtered = savedJobs
    .filter((j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (sortBy === 'match' ? b.match - a.match : 0));

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading saved positions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl glass-1 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg text-foreground">Connection Failure</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">{error}</p>
        <Button onClick={() => loadSavedJobs()} className="rounded-xl font-bold">Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground">
            <Bookmark className="w-7 h-7 text-primary" />
            Saved Jobs
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Review and apply to positions you&apos;ve bookmarked.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search saved..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 glass-1 border border-border rounded-xl text-xs w-48 focus:outline-none focus:border-primary text-foreground"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="glass-1 border border-border rounded-xl text-xs px-3 py-2 text-foreground font-medium"
          >
            <option value="match">Sort by Match</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-3xl glass-1 border-border p-8 space-y-4">
          <Bookmark className="w-12 h-12 text-primary mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-foreground">Nothing saved yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            When you find roles you want to reconsider or prepare for, save them to access them here.
          </p>
          <Button asChild variant="primary" className="rounded-xl font-bold text-xs">
            <Link href="/jobs">
              Discover Jobs <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="glass-1 border border-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                    style={{ backgroundColor: job.color }}
                  >
                    {job.initials}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {job.match}% Match
                  </span>
                </div>

                <h3 className="font-bold text-base text-foreground line-clamp-1">{job.title}</h3>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">{job.company}</p>

                <div className="space-y-1.5 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{job.salary}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(job.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                </Button>

                <Button
                  variant={appliedId === job.id ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleApply(job.id)}
                  disabled={appliedId === job.id}
                  className="rounded-xl text-xs font-bold"
                >
                  {appliedId === job.id ? 'Applied ✓' : 'Apply Now'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
