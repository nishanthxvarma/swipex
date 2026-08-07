'use client';

import React from 'react';
import { HealthReport } from '@swipex/types';
import { ShieldAlert, CheckCircle, AlertTriangle, FileSearch, Sparkles, BookOpen, Layers } from 'lucide-react';

interface ResumeHealthReportCardProps {
  healthReport: HealthReport;
}

export const ResumeHealthReportCard: React.FC<ResumeHealthReportCardProps> = ({ healthReport }) => {
  if (!healthReport) return null;

  return (
    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" />
            Resume Health Diagnostics Report
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated quality evaluation across readability, keyword density, and structural integrity.
          </p>
        </div>

        <div className="flex gap-2 text-xs font-bold">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1">
            Readability: {healthReport.overallReadabilityScore}/100
          </span>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 flex items-center gap-1">
            Formatting: {healthReport.formattingQuality}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Strengths Card */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
          <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Core Strengths ({healthReport.strengths?.length || 0})
          </h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {healthReport.strengths?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses & Opportunities */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
          <h4 className="font-bold text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Improvement Areas ({healthReport.weaknesses?.length || 0})
          </h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {healthReport.weaknesses?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Sections */}
        <div className="p-4 rounded-2xl bg-secondary/50 border space-y-2.5">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Missing Recommended Sections
          </h4>
          {healthReport.missingSections?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {healthReport.missingSections.map((sec, idx) => (
                <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-card border rounded-lg text-muted-foreground">
                  + Add {sec}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ All key ATS sections present (Contact, Skills, Education, Projects, Experience).
            </p>
          )}
        </div>

        {/* Grammar & Phrasing Alerts */}
        <div className="p-4 rounded-2xl bg-secondary/50 border space-y-2.5">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Phrasing & Style Suggestions
          </h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {healthReport.grammarAlerts?.map((alert, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
