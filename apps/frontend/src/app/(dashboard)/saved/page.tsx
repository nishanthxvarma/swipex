'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Search, MapPin, Trash2, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@swipex/api';
import Link from 'next/link';
import { useSavedJobs, QUERY_KEYS } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';

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
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'date'>('match');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const { data: rawSaved, isLoading, error, refetch } = useSavedJobs();

  const savedJobs: SavedJobItem[] = (rawSaved || []).map((s: any) => {
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

  const handleRemove = async (id: string) => {
    // Optimistic removal
    queryClient.setQueryData(QUERY_KEYS.savedJobs(user?.id), (old: any) =>
      (old || []).filter((s: any) => String(s.jobId || s.id) !== id)
    );
    try {
      await jobsApi.unsaveJob(id);
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
    .filter(
      (j) =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (sortBy === 'match' ? b.match - a.match : 0));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground">
            <Bookmark className="w-7 h-7 text-primary" />
            Saved Opportunities
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Revisit, compare, and apply to roles you bookmarked for later.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === 'match' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('match')}
            className="rounded-xl text-xs font-semibold"
          >
            Highest Match
          </Button>
          <Button
            variant={sortBy === 'date' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('date')}
            className="rounded-xl text-xs font-semibold"
          >
            Recently Saved
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter saved roles by title or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 glass-1 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Failed to load saved positions from database.
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {/* Grid of Saved Jobs */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl glass-1 border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-3xl glass-1 border-border p-8 space-y-4">
          <Bookmark className="w-10 h-10 text-primary mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-foreground">No saved jobs found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Swipe right or click bookmark while discovering roles to save positions here.
          </p>
          <Button onClick={() => router.push('/jobs')} variant="outline" className="rounded-xl text-xs font-bold">
            Explore Job Feed
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="group glass-1 border border-border hover:border-primary/40 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
                      style={{ backgroundColor: job.color }}
                    >
                      {job.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                    {job.match}%
                  </span>
                </div>

                <div className="space-y-1.5 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {job.location}
                  </div>
                  <div className="font-semibold text-foreground">{job.salary}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  onClick={() => handleRemove(job.id)}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>

                <Button
                  size="sm"
                  variant={appliedId === job.id ? 'outline' : 'primary'}
                  disabled={appliedId === job.id}
                  onClick={() => handleApply(job.id)}
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
