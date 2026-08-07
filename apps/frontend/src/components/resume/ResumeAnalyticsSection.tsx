'use client';

import React from 'react';
import { ResumeAnalytics } from '@swipex/types';
import { BarChart3, TrendingUp, Award, Layers, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResumeAnalyticsSectionProps {
  analytics: ResumeAnalytics | null;
}

export const ResumeAnalyticsSection: React.FC<ResumeAnalyticsSectionProps> = ({ analytics }) => {
  if (!analytics) return null;

  const maxSkillCount = Math.max(...(analytics.skillDistribution?.map((s) => s.count) || [1]));
  const maxMonthlyUpload = Math.max(...(analytics.monthlyUploads?.map((m) => m.uploads) || [1]));

  return (
    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Resume Optimization Analytics & Trends
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track your ATS score evolution, skill distribution, and target job matching performance.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="p-3 bg-secondary/50 rounded-2xl border text-center min-w-[100px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Improvement
            </span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              +{analytics.resumeImprovementRate}%
            </span>
          </div>
          <div className="p-3 bg-secondary/50 rounded-2xl border text-center min-w-[100px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Job Matches
            </span>
            <span className="text-base font-black text-primary">
              {analytics.jobMatchesCount} Roles
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ATS Score Trend Line Chart Visualization */}
        <div className="p-5 rounded-2xl border bg-secondary/30 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> ATS Score Evolution Trend
            </h4>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Latest: {analytics.atsTrend?.[analytics.atsTrend.length - 1]?.score || 88.5} pts
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {analytics.atsTrend?.map((t, idx) => {
              const heightPct = Math.max(15, (t.score / 100) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] font-extrabold text-primary">{t.score}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="w-full bg-primary/80 hover:bg-primary rounded-t-xl transition-all relative group"
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap z-10">
                      {t.version}
                    </div>
                  </motion.div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{t.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Category Distribution Bar Chart */}
        <div className="p-5 rounded-2xl border bg-secondary/30 space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Skill Inventory Category Breakdown
          </h4>

          <div className="space-y-3 pt-1">
            {analytics.skillDistribution?.map((sk, idx) => {
              const pct = Math.round((sk.count / maxSkillCount) * 100);
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>{sk.category}</span>
                    <span className="text-primary">{sk.count} skills</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
