'use client';

import React, { useState } from 'react';
import { JobRecommendation } from '@swipex/types';
import { Sparkles, MapPin, DollarSign, ArrowUpRight, CheckCircle, XCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AiJobRecommendationsSectionProps {
  recommendations: JobRecommendation[];
  isLoading?: boolean;
}

export const AiJobRecommendationsSection: React.FC<AiJobRecommendationsSectionProps> = ({
  recommendations,
  isLoading = false,
}) => {
  const router = useRouter();
  const [selectedTierFilter, setSelectedTierFilter] = useState<'All' | 'Top Match' | 'Good Match' | 'Stretch Match'>('All');

  if (isLoading) {
    return (
      <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-36 bg-muted rounded-2xl" />
          <div className="h-36 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  const filtered = recommendations.filter((r) =>
    selectedTierFilter === 'All' ? true : r.tier === selectedTierFilter
  );

  return (
    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Recommended Jobs (Skill-Matched)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personalized role recommendations based on your parsed technical skills and experience.
          </p>
        </div>

        {/* Tier Filter Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-xl text-xs font-bold border">
          {(['All', 'Top Match', 'Good Match', 'Stretch Match'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTierFilter === tier
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((job) => {
          const badgeClass =
            job.tier === 'Top Match'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : job.tier === 'Good Match'
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

          return (
            <div
              key={job.id}
              className="p-5 rounded-2xl border bg-secondary/30 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                    {job.tier} ({job.matchPercentage}% Match)
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-500" /> Exp ATS: {job.expectedAtsScore}
                  </span>
                </div>

                <h4 className="font-bold text-base text-foreground leading-snug">{job.jobTitle}</h4>
                <p className="text-xs font-semibold text-primary">{job.companyName}</p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {job.salary}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground bg-card p-2.5 rounded-xl border leading-relaxed">
                  {job.reason}
                </p>

                {/* Skills tags */}
                <div className="space-y-1 pt-1">
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {job.matchingSkills?.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-semibold border border-emerald-500/20">
                        ✓ {s}
                      </span>
                    ))}
                    {job.missingSkills?.slice(0, 2).map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-secondary text-muted-foreground rounded-md font-semibold border">
                        + {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t flex justify-end">
                <Button
                  onClick={() => router.push('/jobs')}
                  size="sm"
                  className="rounded-xl font-bold text-xs w-full sm:w-auto"
                >
                  View Job Listing <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
