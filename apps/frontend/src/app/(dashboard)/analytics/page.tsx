'use client';

import React, { useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Target, Activity, Calendar, Award, Layers, Users, Briefcase, Sparkles 
} from 'lucide-react';
import { useAnalyticsStore } from '@/stores/analytics-store';

export default function AnalyticsPage() {
  const {
    candidateAnalytics,
    timeRange,
    setTimeRange,
    fetchCandidateAnalytics,
    isLoading,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchCandidateAnalytics();
  }, [fetchCandidateAnalytics]);

  const data = candidateAnalytics;

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-primary" />
            <span>Career Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Calculated directly from your live database activity with zero simulated data.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#0C1119] rounded-xl border border-slate-800 text-xs font-semibold">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-2">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Applications Submitted</p>
          <p className="text-3xl font-bold text-slate-100">{data?.applicationsSubmitted ?? 0}</p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Success Rate: {data?.applicationSuccessRatePct ?? 0}%</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-2">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Interviews Scheduled</p>
          <p className="text-3xl font-bold text-cyan-400">{data?.interviewsCount ?? 0}</p>
          <p className="text-xs text-slate-400 font-medium">
            {data?.offersCount ?? 0} Offers Extended
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-2">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Roles Swiped Right</p>
          <p className="text-3xl font-bold text-slate-100">{data?.jobsLiked ?? 0}</p>
          <p className="text-xs text-slate-400 font-medium">
            {data?.jobsSaved ?? 0} Saved Positions
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-2">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">ATS Readiness Score</p>
          <p className="text-3xl font-bold text-emerald-400">{data?.careerScore ? `${data.careerScore}%` : '—'}</p>
          <p className="text-xs text-slate-400 font-medium">
            Profile {data?.profileCompletionPct ?? 0}% Complete
          </p>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="p-6 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span>Conversion Pipeline Funnel</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Stage-by-stage progression from impression to job offer.
          </p>
        </div>

        {data?.funnel && data.funnel.length > 0 ? (
          <div className="space-y-3">
            {data.funnel.map((step: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{step.stage}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-100 font-bold">{step.count}</span>
                    <span className="text-slate-500 text-[11px]">{step.conversionPct}% conversion</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(2, step.conversionPct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-400">No application funnel data yet</p>
            <p>Start discovering and applying to jobs to populate real-time metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
