'use client';

import React from 'react';
import { AiSuggestion } from '@swipex/types';
import { Sparkles, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AiResumeSuggestionsProps {
  suggestions: AiSuggestion[];
}

export const AiResumeSuggestions: React.FC<AiResumeSuggestionsProps> = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Recommended Improvements
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Actionable suggestions to increase recruiter callbacks and ATS ranking score.
          </p>
        </div>
        <span className="text-xs font-extrabold px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20 w-fit">
          {suggestions.length} High-Impact Suggestions
        </span>
      </div>

      <div className="space-y-4">
        {suggestions.map((sug) => (
          <div
            key={sug.id}
            className="p-5 rounded-2xl border bg-secondary/30 hover:border-primary/50 transition-all space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-md">
                  {sug.category}
                </span>
                <h4 className="font-bold text-sm text-foreground mt-1.5">{sug.problem}</h4>
              </div>
              {sug.impactScore && (
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +{sug.impactScore} pts
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{sug.reason}</p>

            <div className="grid gap-3 sm:grid-cols-2 text-xs font-medium pt-1">
              {/* Current */}
              <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 space-y-1">
                <span className="text-[10px] font-bold text-destructive uppercase tracking-wider block">
                  Current Phrasing
                </span>
                <p className="text-muted-foreground italic">&ldquo;{sug.current}&rdquo;</p>
              </div>

              {/* Suggested */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Recommended ATS Phrasing
                </span>
                <p className="text-foreground font-semibold">&ldquo;{sug.suggested}&rdquo;</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
