'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ChevronRight, Info } from 'lucide-react';
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
    ? 'Moderate ATS Score. Optimize section metrics to reach top tier rank.'
    : 'Action Needed. Add essential contact, skills, and project sections.',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    { key: 'skills', label: 'Skills Coverage', data: breakdown?.skills, max: 25 },
    { key: 'projects', label: 'Projects & Tech', data: breakdown?.projects, max: 20 },
    { key: 'experience', label: 'Work Experience', data: breakdown?.experience, max: 15 },
    { key: 'education', label: 'Education Details', data: breakdown?.education, max: 15 },
    { key: 'contactInfo', label: 'Contact Info', data: breakdown?.contactInfo, max: 10 },
    { key: 'keywords', label: 'Role Keywords', data: breakdown?.keywords, max: 10 },
    { key: 'formatting', label: 'ATS Formatting', data: breakdown?.formatting, max: 5 },
  ];

  return (
    <div className="glass-1 border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-6">
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66788A]">
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
          <p className="text-sm text-[#66788A] leading-relaxed">
            {statusText}
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Automated Baseline Screening (No target JD required)
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="border-t pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#66788A]">
            Weighted Evaluation Breakdown
          </h4>
          <span className="text-xs text-muted-foreground font-semibold">
            Click a category for evidence
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {categories.map((cat, i) => {
            const currentScore = cat.data?.score ?? 0;
            const maxScore = cat.max;
            const pct = Math.round((currentScore / maxScore) * 100);
            const isSelected = selectedCategory === cat.key;

            return (
              <div
                key={cat.key}
                onClick={() => setSelectedCategory(isSelected ? null : cat.key)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-xs'
                    : 'glass-1/40 hover:border-primary/40'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    {cat.label}
                    <Info className="w-3 h-3 text-muted-foreground opacity-70" />
                  </span>
                  <span className="text-primary font-black">
                    {currentScore} / {maxScore} pts
                  </span>
                </div>
                <div className="w-full glass-1 rounded-full h-2 overflow-hidden my-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                  />
                </div>
                {cat.data?.details && (
                  <p className="text-[11px] text-[#66788A] leading-relaxed">
                    {cat.data.details}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
