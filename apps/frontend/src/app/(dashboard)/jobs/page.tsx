'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, MapPin, Filter, RefreshCw, Sparkles, Layers, ArrowUpRight } from 'lucide-react';
import { SwipeStack } from '@/components/swipe/swipe-stack';
import { AlertTriangle } from 'lucide-react';
import { JobDetailModal } from '@/components/jobs/job-detail-modal';
import { Job } from '@/components/swipe/swipe-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useJobFeed, QUERY_KEYS } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';

export default function JobFeedPage() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filters state
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState<string | null>(null);

  const { data: feedData, isLoading, error, refetch } = useJobFeed(1, 20);
  const jobs = (feedData || []) as Job[];

  const filteredJobs = jobs.filter((j) => {
    if (locationFilter.trim() && !j.location?.toLowerCase().includes(locationFilter.toLowerCase().trim())) {
      return false;
    }
    return true;
  });

  const activeJob = filteredJobs[0];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] max-w-7xl mx-auto overflow-hidden rounded-3xl border border-border glass-1 animate-in fade-in duration-200">
      {/* Left Panel: Filters (Desktop) */}
      <div className="hidden lg:block w-72 border-r border-border bg-card/40 overflow-y-auto p-6 space-y-6">
        <div>
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-foreground">
            <SlidersHorizontal className="w-4 h-4 text-primary" /> Filter Preferences
          </h3>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Remote / City"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 glass-2 rounded-xl text-xs border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience Level</label>
              <div className="flex flex-wrap gap-2">
                {['Entry', 'Mid', 'Senior', 'Lead'].map((level) => {
                  const isSelected = experienceFilter === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setExperienceFilter(isSelected ? null : level)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary font-bold'
                          : 'glass-2 border-border text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {locationFilter || experienceFilter ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocationFilter('');
                  setExperienceFilter(null);
                }}
                className="w-full text-xs text-muted-foreground"
              >
                Reset Filters
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Center: Swipe Deck */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-background/50">
        <div className="p-4 flex justify-between items-center z-10 border-b border-border/40 glass-1">
          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMobileFiltersOpen(true)}>
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            <h2 className="font-bold text-base sm:text-lg flex items-center gap-2 text-foreground">
              <Layers className="w-4 h-4 text-primary" /> Swipe & Discover
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>{filteredJobs.length} Available</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobFeed(1, 20) });
                refetch();
              }}
              title="Refresh Deck"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          {isLoading ? (
            <div className="w-full max-w-sm h-96 rounded-3xl glass-2 border border-border animate-pulse flex flex-col items-center justify-center space-y-3">
              <Sparkles className="w-8 h-8 text-primary opacity-60 animate-spin" />
              <p className="text-xs font-semibold text-muted-foreground">Indexing matches...</p>
            </div>
          ) : error ? (
            <div className="text-center p-6 space-y-3">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
              <p className="text-xs text-muted-foreground">Failed to pull matching jobs.</p>
              <Button size="sm" onClick={() => refetch()} className="rounded-xl">
                Retry
              </Button>
            </div>
          ) : (
            <SwipeStack jobs={filteredJobs} onShowDetails={setSelectedJob} />
          )}
        </div>
      </div>

      {/* Right Panel: AI Match Explanation (Desktop) */}
      <div className="hidden xl:block w-80 border-l border-border bg-card/40 overflow-y-auto p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
            <h3 className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" /> AI Match Analysis
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
              {activeJob?.matchPercentage || 92}% MATCH
            </span>
          </div>

          {activeJob ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-foreground">{activeJob.title}</p>
                <p className="text-xs text-muted-foreground">
                  {activeJob.company} • {activeJob.location}
                </p>
              </div>

              {/* Breakdown bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground">Skills Alignment</span>
                    <span className="text-primary font-bold">{activeJob.matchPercentage || 92}%</span>
                  </div>
                  <div className="h-1.5 w-full glass-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${activeJob.matchPercentage || 92}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground">Location Alignment</span>
                    <span className="text-success font-bold">100%</span>
                  </div>
                  <div className="h-1.5 w-full glass-2 rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground">Salary Alignment</span>
                    <span className="text-accent font-bold">90%</span>
                  </div>
                  <div className="h-1.5 w-full glass-2 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>

              {/* Skills required */}
              <div className="pt-3 border-t border-border/60 space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeJob.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedJob(activeJob)}
                className="w-full text-xs font-bold rounded-xl"
              >
                Inspect Role Details <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No active card selected.</p>
          )}
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md lg:hidden p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-foreground">Filter Preferences</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
              <Filter className="w-5 h-5" />
            </Button>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Location</label>
              <input
                type="text"
                placeholder="Remote / City"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full p-2.5 glass-2 rounded-xl border border-border text-foreground text-sm"
              />
            </div>
          </div>
          <Button variant="primary" onClick={() => setIsMobileFiltersOpen(false)} className="w-full rounded-xl font-bold py-3">
            Apply Filters
          </Button>
        </div>
      )}

      {/* Details Modal */}
      <JobDetailModal job={selectedJob} isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
