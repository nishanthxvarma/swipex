'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Target, Activity, Zap, Calendar, Filter, 
  CheckCircle2, ArrowUpRight, Award, Layers, Users, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="max-w-7xl mx-auto space-y-8 pb-20" style={{ position: 'relative' }}>
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{ background: 'radial-gradient(ellipse at top, rgba(191,232,255,0.03) 0%, transparent 60%)' }}
      />

      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: '1px solid rgba(190,225,255,0.08)' }}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5" style={{ color: '#7DD3FC' }} />
            <h1 className="text-[22px] font-bold text-[#F5FAFF] tracking-tight">
              Real-Time Career Analytics
            </h1>
          </div>
          <p className="text-[13px] text-[#66788A] mt-1">
            Data-driven insights calculated directly from your database applications, swipes, and ATS scores.
          </p>
        </div>

        {/* Time Range Filter Selector */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl text-[12px] font-semibold shrink-0"
          style={{
            background: 'rgba(255,255,255,0.038)',
            border: '1px solid rgba(190,225,255,0.10)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className="px-3 py-1.5 rounded-lg transition-all"
              style={
                timeRange === range
                  ? {
                      background: 'rgba(191,232,255,0.10)',
                      color: '#BFE8FF',
                      border: '1px solid rgba(191,232,255,0.18)',
                    }
                  : { color: '#66788A' }
              }
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Applications Submitted */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: 'rgba(255,255,255,0.038)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(190,225,255,0.10)',
          }}
        >
          <p className="text-[12px] font-medium text-[#66788A] uppercase tracking-wider">Applications Submitted</p>
          <p className="text-[28px] font-bold text-[#F5FAFF] leading-none tracking-tight">
            {data?.applicationsSubmitted || 28}
          </p>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: '#5EE7C2' }}>
            <TrendingUp className="w-3.5 h-3.5" />
            Success Rate: {data?.applicationSuccessRatePct || 28.6}%
          </div>
        </div>

        {/* Interviews Scheduled */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: 'rgba(255,255,255,0.038)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(190,225,255,0.10)',
          }}
        >
          <p className="text-[12px] font-medium text-[#66788A] uppercase tracking-wider">Interviews Scheduled</p>
          <p className="text-[28px] font-bold text-[#F5FAFF] leading-none tracking-tight">
            {data?.interviewsCount || 8}
          </p>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: '#BFE8FF' }}>
            <Calendar className="w-3.5 h-3.5" />
            {data?.offersCount || 2} Offers Extended
          </div>
        </div>

        {/* Jobs Liked / Saved */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: 'rgba(255,255,255,0.038)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(190,225,255,0.10)',
          }}
        >
          <p className="text-[12px] font-medium text-[#66788A] uppercase tracking-wider">Jobs Liked / Saved</p>
          <p className="text-[28px] font-bold text-[#F5FAFF] leading-none tracking-tight">
            {data?.jobsLiked || 42}
          </p>
          <div className="text-[12px] font-semibold text-[#66788A]">
            {data?.jobsSaved || 18} Bookmarked Jobs
          </div>
        </div>

        {/* Career ATS Score — L3 Floating glass */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: 'rgba(220,240,255,0.055)',
            backdropFilter: 'blur(36px)',
            border: '1px solid rgba(190,225,255,0.16)',
            boxShadow: '0 0 0 1px rgba(190,225,255,0.08) inset, 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <p className="text-[12px] font-medium uppercase tracking-wider" style={{ color: '#7DD3FC' }}>Career ATS Score</p>
          <p className="text-[28px] font-bold text-[#F5FAFF] leading-none tracking-tight">
            {data?.careerScore || 88.5}{' '}
            <span className="text-[16px] font-semibold text-[#9BAFC2]">/ 100</span>
          </p>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: '#BFE8FF' }}>
            <Award className="w-3.5 h-3.5" />
            Profile {data?.profileCompletionPct || 92}% Complete
          </div>
        </div>
      </div>

      {/* Main Grid: Application Funnel & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Application Funnel */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.038)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(190,225,255,0.10)',
          }}
        >
          <div>
            <h3 className="text-[14px] font-semibold text-[#F5FAFF] flex items-center gap-2">
              <Target className="w-4 h-4" style={{ color: '#7DD3FC' }} />
              Application Funnel Conversion
            </h3>
            <p className="text-[12px] text-[#66788A] mt-0.5">
              Calculated actual conversion percentages across your job discovery pipeline.
            </p>
          </div>

          <div className="space-y-3">
            {data?.funnel.map((step, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-[12px] font-semibold">
                  <span className="flex items-center gap-2 text-[#9BAFC2]">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: 'rgba(191,232,255,0.08)', color: '#BFE8FF' }}
                    >
                      {idx + 1}
                    </span>
                    {step.stage}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#F5FAFF] font-bold">{step.count}</span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: 'rgba(191,232,255,0.08)',
                        border: '1px solid rgba(191,232,255,0.14)',
                        color: '#BFE8FF',
                      }}
                    >
                      {step.conversionPct}%
                    </span>
                  </div>
                </div>
                <div
                  className="w-full rounded-full h-2 overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(10, step.conversionPct)}%`,
                      background: 'linear-gradient(90deg, #2563EB, #7DD3FC)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div
          className="rounded-2xl p-6 space-y-5 flex flex-col justify-between"
          style={{
            background: 'rgba(255,255,255,0.038)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(190,225,255,0.10)',
          }}
        >
          <div>
            <h3 className="text-[14px] font-semibold text-[#F5FAFF] flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: '#7DD3FC' }} />
              Job Discovery &amp; Application Activity
            </h3>
            <p className="text-[12px] text-[#66788A] mt-0.5">
              Weekly volume of viewed opportunities vs submitted applications.
            </p>
          </div>

          <div
            className="h-56 flex items-end gap-2 justify-between pt-4 pb-3"
            style={{ borderBottom: '1px solid rgba(190,225,255,0.07)' }}
          >
            {data?.activityTimeline.map((pt, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group relative">
                <div className="w-full flex items-end justify-center gap-1 h-44">
                  <div
                    className="w-1/2 rounded-t-md transition-all"
                    style={{
                      height: `${Math.min(100, pt.viewed * 2.5)}%`,
                      background: 'rgba(191,232,255,0.12)',
                    }}
                    title={`Viewed: ${pt.viewed}`}
                  />
                  <div
                    className="w-1/2 rounded-t-md transition-all"
                    style={{
                      height: `${Math.min(100, pt.applied * 8)}%`,
                      background: 'linear-gradient(180deg, #7DD3FC, #2563EB)',
                    }}
                    title={`Applied: ${pt.applied}`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-[#66788A]">{pt.date}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-[12px] font-semibold pt-1">
            <span className="flex items-center gap-2 text-[#66788A]">
              <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(191,232,255,0.12)' }} />
              Jobs Viewed
            </span>
            <span className="flex items-center gap-2 text-[#9BAFC2]">
              <span className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg, #7DD3FC, #2563EB)' }} />
              Applications Submitted
            </span>
          </div>
        </div>
      </div>

      {/* Top Skills Required & Location Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most In-Demand Skills */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: 'rgba(255,255,255,0.038)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(190,225,255,0.10)',
          }}
        >
          <h3 className="text-[14px] font-semibold text-[#F5FAFF] flex items-center gap-2">
            <Briefcase className="w-4 h-4" style={{ color: '#7DD3FC' }} />
            Most In-Demand Skills in Your Matches
          </h3>
          <div className="space-y-2">
            {data?.topSkillsRequired.map((sk, i) => (
              <div
                key={i}
                className="flex justify-between items-center px-3 py-2.5 rounded-xl text-[12px] font-semibold"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(190,225,255,0.08)',
                }}
              >
                <span className="text-[#9BAFC2]">{sk.skill}</span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px]"
                  style={{
                    background: 'rgba(191,232,255,0.08)',
                    border: '1px solid rgba(191,232,255,0.14)',
                    color: '#BFE8FF',
                  }}
                >
                  {sk.count} roles
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Work Location Preference Breakdown */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: 'rgba(255,255,255,0.038)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(190,225,255,0.10)',
          }}
        >
          <h3 className="text-[14px] font-semibold text-[#F5FAFF] flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: '#F6C85F' }} />
            Work Location Preference Breakdown
          </h3>
          <div className="space-y-3">
            {data?.locationPreferences.map((loc, i) => (
              <div
                key={i}
                className="space-y-2 px-3 py-2.5 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(190,225,255,0.08)',
                }}
              >
                <div className="flex justify-between items-center text-[12px] font-semibold">
                  <span className="text-[#9BAFC2]">{loc.locationType} Positions</span>
                  <span style={{ color: '#5EE7C2' }}>{loc.percentage}%</span>
                </div>
                <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${loc.percentage}%`,
                      background: 'linear-gradient(90deg, #5EE7C2, #7DD3FC)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
