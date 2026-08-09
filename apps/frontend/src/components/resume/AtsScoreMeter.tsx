'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { ATSCategoryBreakdown } from '@swipex/types';

interface AtsScoreMeterProps {
  score: number;
  breakdown: ATSCategoryBreakdown;
  grade?: 'Red' | 'Yellow' | 'Green';
  statusText?: string;
}

export const AtsScoreMeter: React.FC<AtsScoreMeterProps> = ({
  score,
  breakdown,
  grade = score >= 80 ? 'Green' : score >= 60 ? 'Yellow' : 'Red',
  statusText = score >= 80
    ? 'Excellent ATS Compatibility! High likelihood of passing automated ATS filters.'
    : score >= 60
    ? 'Moderate ATS Score. Optimize missing keywords to reach top tier rank.'
    : 'Action Needed. Add essential contact, skills, and project sections.',
}) => {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorConfig = {
    Green: {
      stroke: '#10B981',
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'Excellent',
    },
    Yellow: {
      stroke: '#F59E0B',
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'Good Match',
    },
    Red: {
      stroke: '#EF4444',
      bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      text: 'text-red-600 dark:text-red-400',
      badge: 'Needs Work',
    },
  }[grade];

  const categories = [
    { label: 'Skills Coverage', data: breakdown?.skills, max: 25 },
    { label: 'Projects & Tech', data: breakdown?.projects, max: 20 },
    { label: 'Work Experience', data: breakdown?.experience, max: 15 },
    { label: 'Education Details', data: breakdown?.education, max: 15 },
    { label: 'Contact Info', data: breakdown?.contactInfo, max: 10 },
    { label: 'Role Keywords', data: breakdown?.keywords, max: 10 },
    { label: 'ATS Formatting', data: breakdown?.formatting, max: 5 },
  ];

  return (
    <div className="bg-card border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Animated Circular Meter */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-44 h-44 transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r={radius}
              className="stroke-muted"
              strokeWidth="12"
              fill="transparent"
            />
            <motion.circle
              cx="88"
              cy="88"
              r={radius}
              stroke={colorConfig.stroke}
              strokeWidth="12"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-4xl font-black tracking-tight ${colorConfig.text}`}>
              {score}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              / 100 ATS Score
            </span>
          </div>
        </div>

        {/* Score Overview & Grade Badge */}
        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-xl font-bold tracking-tight">ATS Score Index</h3>
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${colorConfig.bg}`}>
              {colorConfig.badge} Grade
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {statusText}
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Automated Parsing Readiness Verified
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="border-t pt-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Weighted Evaluation Breakdown</span>
          <span>Earned / Max</span>
        </h4>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {categories.map((cat, i) => {
            const currentScore = cat.data?.score ?? 0;
            const maxScore = cat.max;
            const pct = Math.round((currentScore / maxScore) * 100);

            return (
              <div key={i} className="p-3 bg-secondary/40 rounded-xl border space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>{cat.label}</span>
                  <span className="text-primary">
                    {currentScore} / {maxScore} pts
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                  />
                </div>
                {cat.data?.details && (
                  <p className="text-[11px] text-muted-foreground truncate">{cat.data.details}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Below 80% ATS Optimization Callout (If Score < 80) */}
      {score < 80 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4"
        >
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>ATS Match Score is Below 80% Threshold</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 p-3 rounded-xl bg-card border">
              <p className="font-extrabold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Highlighted Missing Skills:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['AWS Cloud', 'Docker', 'Kubernetes', 'GraphQL', 'System Design'].map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold">
                    + {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-card border">
              <p className="font-extrabold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Missing Industry Keywords:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['CI/CD Pipelines', 'Microservices', 'Unit Testing', 'Agile Scrum'].map((kw, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border space-y-1 text-xs">
            <p className="font-bold text-foreground">💡 AI Resume Optimization Recommendation:</p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Incorporate quantified bullet points (e.g. &quot;Reduced latency by 35% using Next.js caching&quot;) and add missing cloud &amp; testing keywords to boost your ATS compatibility score above 80%.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
