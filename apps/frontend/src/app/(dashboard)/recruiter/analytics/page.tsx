'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
  UserCheck,
  Calendar,
  Award,
  Layers,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalyticsStore } from '@/stores/analytics-store';
import { cn } from '@/lib/utils';

export default function RecruiterAnalyticsPage() {
  const {
    recruiterAnalytics,
    timeRange,
    setTimeRange,
    fetchRecruiterAnalytics,
    isLoading,
    error,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchRecruiterAnalytics();
  }, [fetchRecruiterAnalytics]);

  const data = recruiterAnalytics;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Recruitment &amp; Hiring Analytics
            </h1>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
              Employer Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Data-driven recruitment insights calculated directly from PostgreSQL applications, requisitions, and stages.
          </p>
        </div>

        {/* Time Range Filter Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl text-xs font-semibold shrink-0 glass-1 border border-border">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all cursor-pointer',
                timeRange === range
                  ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
          <Button size="sm" variant="outline" onClick={() => fetchRecruiterAnalytics()}>
            Retry
          </Button>
        </div>
      )}

      {/* Recruiter Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Job Requisitions */}
        <div className="glass-1 border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Jobs</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : data?.activeJobsCount ?? 0}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
            <span>Published Requisitions</span>
          </div>
        </div>

        {/* Applications Received */}
        <div className="glass-1 border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Applications Received</span>
            <div className="p-2 rounded-xl bg-info/10 text-info">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-info" /> : data?.applicationsReceivedCount ?? 0}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <span>{data?.applicationsReviewedCount ?? 0} Reviewed</span>
          </div>
        </div>

        {/* Shortlisted & Interviews */}
        <div className="glass-1 border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shortlisted &amp; Interviews</span>
            <div className="p-2 rounded-xl bg-warning/10 text-warning">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-warning" /> : (data?.shortlistedCount ?? 0) + (data?.interviewsCount ?? 0)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-warning font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{data?.interviewsCount ?? 0} Interviews Active</span>
          </div>
        </div>

        {/* Average Match Index */}
        <div className="glass-2 border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Applicant Match</span>
            <div className="p-2 rounded-xl bg-success/10 text-success">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-success" /> : `${data?.avgApplicantMatchScore ?? 0}%`}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Conversion: {data?.hiringConversionPct ?? 0}%</span>
          </div>
        </div>
      </div>

      {/* Pipeline Stage Distribution & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pipeline Stage Distribution */}
        <div className="lg:col-span-7 glass-1 border border-border rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Pipeline Stage Breakdown
            </h2>
            <span className="text-xs text-muted-foreground font-semibold">Live Database Distribution</span>
          </div>

          <div className="space-y-4">
            {(data?.pipelineDistribution || []).map((stage, idx) => {
              const total = data?.applicationsReceivedCount || 1;
              const pct = total > 0 ? Math.round((stage.count / total) * 100) : 0;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground">{stage.stage}</span>
                    <span className="text-muted-foreground">{stage.count} Candidates ({pct}%)</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-500',
                        stage.stage === 'Applied'
                          ? 'bg-primary'
                          : stage.stage === 'Reviewing' || stage.stage === 'Shortlisted'
                          ? 'bg-warning'
                          : stage.stage === 'Interview'
                          ? 'bg-accent'
                          : stage.stage === 'Offer' || stage.stage === 'Hired'
                          ? 'bg-success'
                          : 'bg-destructive/60'
                      )}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Recruitment Conversion Insights */}
        <div className="lg:col-span-5 glass-1 border border-border rounded-3xl p-6 space-y-5">
          <div className="border-b border-border pb-4">
            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" /> Recruitment Conversion Metrics
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Authoritative funnel performance</p>
          </div>

          <div className="space-y-3">
            <div className="glass-2 p-4 rounded-2xl border border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase block">Applications to Review</span>
                <span className="text-lg font-bold text-foreground">
                  {data?.applicationsReceivedCount ? `${Math.round(((data.applicationsReviewedCount || 0) / data.applicationsReceivedCount) * 100)}%` : '0%'}
                </span>
              </div>
              <span className="text-xs text-primary font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                Review Rate
              </span>
            </div>

            <div className="glass-2 p-4 rounded-2xl border border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase block">Review to Interview</span>
                <span className="text-lg font-bold text-foreground">
                  {data?.applicationsReviewedCount ? `${Math.round(((data.interviewsCount || 0) / data.applicationsReviewedCount) * 100)}%` : '0%'}
                </span>
              </div>
              <span className="text-xs text-warning font-bold px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20">
                Screening Rate
              </span>
            </div>

            <div className="glass-2 p-4 rounded-2xl border border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase block">Overall Hiring Conversion</span>
                <span className="text-lg font-bold text-success">
                  {data?.hiringConversionPct ?? 0}%
                </span>
              </div>
              <span className="text-xs text-success font-bold px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                Hire Conversion
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
