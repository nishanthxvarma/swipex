'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, SlidersHorizontal, MapPin, DollarSign, Briefcase, 
  Layers, Grid, RefreshCw, Loader2, Sparkles, Check, Bookmark, Info, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { jobsApi } from '@swipex/api';
import { SwipeStack } from '@/components/swipe/swipe-stack';
import { JobDetailModal } from '@/components/jobs/job-detail-modal';
import { Job } from '@/components/swipe/swipe-card';

export default function JobFeedPage() {
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState<string>('all');

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const feed = await jobsApi.getJobFeed(1, 30);
      if (Array.isArray(feed)) {
        const mapped: Job[] = feed.map((j: any) => ({
          id: String(j.id),
          company: j.company?.name || j.company_name || 'SwipeX Partner',
          companyInitials: (j.company?.name || j.company_name || 'SP').substring(0, 2).toUpperCase(),
          color: '#3B82F6',
          verified: true,
          title: j.title,
          location: j.location || (j.is_remote ? 'Remote' : 'Onsite'),
          type: j.job_type || j.type || 'Full-time',
          salary: j.salary_min && j.salary_max
            ? `$${Math.round(j.salary_min / 1000)}k - $${Math.round(j.salary_max / 1000)}k`
            : '$120,000 - $160,000',
          skills: j.skills_required || j.skills || ['TypeScript', 'React', 'Node.js'],
          matchPercentage: j.match_percentage || 88,
          competition: 'Medium',
          postedTime: 'Active',
          description: j.description || '',
          requirements: j.requirements ? [j.requirements] : [],
          benefits: j.benefits || [],
          isSaved: false,
        }));
        setJobs(mapped);
      }
    } catch (err: any) {
      console.error('Jobs fetch error:', err);
      setError('Unable to load available positions from the live database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSwipe = async (job: Job, direction: 'left' | 'right') => {
    try {
      if (direction === 'right') {
        await jobsApi.swipeJob(job.id, 'right');
        await jobsApi.applyToJob(job.id, { coverLetter: '1-Tap Swipe Application', atsScore: job.matchPercentage });
      } else {
        await jobsApi.swipeJob(job.id, 'left');
      }
    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  const handleToggleSave = async (job: Job) => {
    try {
      await jobsApi.saveJob(job.id);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, isSaved: !j.isSaved } : j)));
    } catch (err) {
      console.error('Save job error:', err);
    }
  };

  // Client-side filtering over genuine DB results
  const filteredJobs = jobs.filter((j) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = j.title.toLowerCase().includes(q);
      const matchCompany = j.company.toLowerCase().includes(q);
      const matchSkills = j.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchCompany && !matchSkills) return false;
    }
    if (remoteOnly && !j.location.toLowerCase().includes('remote')) {
      return false;
    }
    if (selectedJobType !== 'all' && j.type.toLowerCase() !== selectedJobType.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Job Discovery Feed</h1>
          <p className="text-xs text-slate-400">Discover verified engineering positions matched to your skills.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-[#0C1119] border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('swipe')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === 'swipe'
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Swipe Stack</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === 'grid'
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid Catalog</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchJobs}
            title="Refresh feed"
            className="h-9 w-9 rounded-xl border-slate-800 bg-[#0C1119] hover:bg-slate-800 text-slate-400"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0C1119] border border-slate-800/80 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, company, or tech stack (e.g. Go, React)..."
            className="pl-9 bg-slate-900/80 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs h-9 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setRemoteOnly(!remoteOnly)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0",
              remoteOnly
                ? "bg-primary/10 border-primary text-primary"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
            )}
          >
            Remote Only
          </button>

          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium outline-none shrink-0"
          >
            <option value="all">All Employment Types</option>
            <option value="full-time">Full-time</option>
            <option value="contract">Contract</option>
            <option value="part-time">Part-time</option>
          </select>
        </div>
      </div>

      {/* Main Content: Swipe View vs. Grid View */}
      {isLoading ? (
        <div className="h-96 rounded-2xl bg-[#0C1119] border border-slate-800 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : viewMode === 'swipe' ? (
        <div className="py-4">
          <SwipeStack
            jobs={filteredJobs}
            onShowDetails={(job) => setSelectedJob(job)}
            onSwipe={handleSwipe}
          />
        </div>
      ) : (
        /* Grid Catalog View */
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center bg-[#0C1119] rounded-2xl border border-slate-800 space-y-2">
              <p className="text-sm font-semibold text-slate-300">No matching positions found.</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4 hover-lift"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-xs text-slate-200">
                          {job.companyInitials}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-200">{job.company}</p>
                          <p className="text-[11px] text-slate-500">{job.location}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                        {job.matchPercentage}% MATCH
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 leading-snug">
                      {job.title}
                    </h3>

                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 4).map((s, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">{job.salary}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedJob(job)}
                        className="h-8 text-xs font-medium text-slate-400 hover:text-slate-100"
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleSwipe(job, 'right');
                          setSelectedJob(null);
                        }}
                        className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => {
            handleSwipe(selectedJob, 'right');
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}
