'use client';

import React from 'react';
import { SkillGapAnalysis } from '@swipex/types';
import { Target, CheckCircle, AlertCircle, ArrowUpRight, Flame, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SkillGapAnalysisCardProps {
  skillGap: SkillGapAnalysis | null;
  onOpenMatchModal?: () => void;
}

export const SkillGapAnalysisCard: React.FC<SkillGapAnalysisCardProps> = ({ skillGap, onOpenMatchModal }) => {
  if (!skillGap) {
    return (
      <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
        <Target className="w-10 h-10 text-primary opacity-60" />
        <h3 className="font-bold text-base">Target Job Skill Gap Analysis</h3>
        <p className="text-xs text-muted-foreground max-w-md">
          Compare your resume skills against any target job role to see matched skills, missing prerequisites, and learning priorities.
        </p>
        {onOpenMatchModal && (
          <Button onClick={onOpenMatchModal} size="sm" className="rounded-xl font-bold text-xs mt-2">
            Compare Against Job <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Skill Gap & Competency Analysis
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify critical skill gaps required to reach 100% job requirement compatibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-muted-foreground block font-medium">Match Readiness</span>
            <span className="text-lg font-black text-primary">{skillGap.matchPercentage}%</span>
          </div>
          {onOpenMatchModal && (
            <Button onClick={onOpenMatchModal} variant="outline" size="sm" className="rounded-xl text-xs font-bold">
              Compare Job
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 p-4 bg-secondary/30 rounded-2xl border">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" /> Target Competency Progress
          </span>
          <span className="text-primary">{skillGap.gapProgress}% Satisfied</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${skillGap.gapProgress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Already Known */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
          <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Already Mastered ({skillGap.alreadyKnown?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {skillGap.alreadyKnown?.map((skill, idx) => (
              <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-card border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Priority Skills to Learn */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
          <h4 className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> High-Priority Gaps ({skillGap.prioritySkills?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {skillGap.prioritySkills?.map((skill, idx) => (
              <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 dark:text-amber-400">
                ⚡ {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Need to Learn */}
        <div className="p-4 rounded-2xl bg-secondary/50 border space-y-2.5">
          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" /> Remaining Required Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {skillGap.needToLearn?.map((skill, idx) => (
              <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-card border rounded-lg text-muted-foreground">
                • {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Optional Skills */}
        <div className="p-4 rounded-2xl bg-secondary/50 border space-y-2.5">
          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
            Optional / Nice-to-Have Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {skillGap.optionalSkills?.map((skill, idx) => (
              <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-card border rounded-lg text-muted-foreground">
                + {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
