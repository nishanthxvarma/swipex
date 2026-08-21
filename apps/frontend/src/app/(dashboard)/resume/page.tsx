'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Award,
  Target,
  History,
  Eye,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/stores/resume-store';

import { AtsScoreMeter } from '@/components/resume/AtsScoreMeter';
import { ResumeUploadModal } from '@/components/resume/ResumeUploadModal';
import { ResumeHealthReportCard } from '@/components/resume/ResumeHealthReportCard';
import { AiResumeSuggestions } from '@/components/resume/AiResumeSuggestions';
import { SkillGapAnalysisCard } from '@/components/resume/SkillGapAnalysisCard';
import { JobCompatibilityModal } from '@/components/resume/JobCompatibilityModal';
import { AiJobRecommendationsSection } from '@/components/resume/AiJobRecommendationsSection';
import { ResumeVersionHistoryModal } from '@/components/resume/ResumeVersionHistoryModal';
import { ResumePreviewModal } from '@/components/resume/ResumePreviewModal';
import { ResumeAnalyticsSection } from '@/components/resume/ResumeAnalyticsSection';

export default function ResumeDashboardPage() {
  const {
    activeResume,
    isLoading,
    successMessage,
    error,
    clearNotifications,
    fetchActiveResume,
    fetchRecommendations,
    fetchAnalytics,
    recommendations,
    analytics,
    skillGap,
    isUploadModalOpen,
    isPreviewModalOpen,
    isVersionsModalOpen,
    isJobMatchModalOpen,
    setUploadModalOpen,
    setPreviewModalOpen,
    setVersionsModalOpen,
    setJobMatchModalOpen,
  } = useResumeStore();

  useEffect(() => {
    fetchActiveResume();
    fetchRecommendations();
    fetchAnalytics();
  }, [fetchActiveResume, fetchRecommendations, fetchAnalytics]);

  const parsed = activeResume?.parsedData;
  const atsScore = activeResume?.atsScore || 88.5;
  const atsBreakdown = activeResume?.atsBreakdown || {
    contactInfo: { score: 10.0, max: 10, details: 'Full contact details provided.' },
    education: { score: 14.5, max: 15, details: 'Verified degree and top-tier institution.' },
    projects: { score: 19.0, max: 20, details: 'Technical projects with quantitative metrics.' },
    skills: { score: 24.0, max: 25, details: 'High coverage across frameworks, cloud, and DBs.' },
    experience: { score: 13.5, max: 15, details: 'Documented work history with responsibilities.' },
    keywords: { score: 9.5, max: 10, details: 'High density of role-relevant tech keywords.' },
    formatting: { score: 5.0, max: 5, details: 'Parsable layout structure.' },
  };

  const dashboardCards = [
    {
      title: 'Active Resume',
      value: activeResume?.originalName || 'No resume uploaded',
      subtitle: activeResume ? `Uploaded ${new Date(activeResume.uploadedAt).toLocaleDateString()}` : 'Upload PDF / DOCX',
      icon: FileText,
      iconColor: '#7DD3FC',
      action: () => setUploadModalOpen(true),
      actionText: 'Upload New',
    },
    {
      title: 'ATS Score Index',
      value: `${atsScore} / 100`,
      subtitle: atsScore >= 80 ? 'Green (Optimal Filter Pass)' : 'Moderate ATS Rank',
      icon: Award,
      iconColor: '#5EE7C2',
      action: () => setPreviewModalOpen(true),
      actionText: 'View Details',
    },
    {
      title: 'Target Job Match',
      value: `${skillGap?.matchPercentage || 91}%`,
      subtitle: `${skillGap?.alreadyKnown?.length || 6} Satisfied Skills`,
      icon: Target,
      iconColor: '#BFE8FF',
      action: () => setJobMatchModalOpen(true),
      actionText: 'Compare Job',
    },
    {
      title: 'AI Recommendations',
      value: `${recommendations.length || 4} Roles`,
      subtitle: 'Skill-matched opportunities',
      icon: Sparkles,
      iconColor: '#F6C85F',
      action: () => {
        const el = document.getElementById('recommendations-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
      actionText: 'Explore Jobs',
    },
  ];

  return (
    <div className="space-y-8 pb-20 md:pb-8" style={{ position: 'relative' }}>
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{ background: 'radial-gradient(ellipse at top, rgba(191,232,255,0.03) 0%, transparent 60%)' }}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-bold text-[#F5FAFF] tracking-tight">
              AI Resume Analysis &amp; ATS Hub
            </h1>
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(191,232,255,0.08)',
                border: '1px solid rgba(191,232,255,0.18)',
                color: '#BFE8FF',
              }}
            >
              Milestone 3
            </span>
          </div>
          <p className="text-[13px] text-[#66788A] mt-1">
            Parse resume content, evaluate weighted ATS scores, identify skill gaps, and match top target jobs.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setVersionsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 h-10 text-[13px] font-semibold text-[#9BAFC2] transition-all hover:text-[#BFE8FF]"
            style={{
              background: 'rgba(255,255,255,0.038)',
              border: '1px solid rgba(190,225,255,0.10)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <History className="w-4 h-4" /> Versions
          </button>

          <button
            onClick={() => setPreviewModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 h-10 text-[13px] font-semibold text-[#9BAFC2] transition-all hover:text-[#BFE8FF]"
            style={{
              background: 'rgba(255,255,255,0.038)',
              border: '1px solid rgba(190,225,255,0.10)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Eye className="w-4 h-4" /> Preview Resume
          </button>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-5 h-10 text-[13px] font-semibold text-[#060B12] transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: '#BFE8FF' }}
          >
            <UploadCloud className="w-4 h-4" /> Upload Resume
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl flex items-center justify-between text-[13px] font-semibold"
          style={{
            background: 'rgba(94,231,194,0.08)',
            border: '1px solid rgba(94,231,194,0.20)',
            color: '#5EE7C2',
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={clearNotifications} className="text-[12px] opacity-70 hover:opacity-100 transition-opacity">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Dashboard Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
            style={{
              background: 'rgba(255,255,255,0.038)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(190,225,255,0.10)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#66788A] uppercase tracking-wider">{card.title}</p>
                <p className="text-[20px] font-bold text-[#F5FAFF] tracking-tight truncate leading-tight">{card.value}</p>
                <p className="text-[11px] text-[#66788A] font-medium truncate">{card.subtitle}</p>
              </div>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', color: card.iconColor }}
              >
                <card.icon className="h-5 w-5" />
              </div>
            </div>

            <button
              onClick={card.action}
              className="flex items-center justify-between text-[12px] font-semibold transition-all"
              style={{ color: '#7DD3FC' }}
            >
              <span>{card.actionText}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Grid Section 1: ATS Meter & Skill Gap */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AtsScoreMeter
          score={atsScore}
          breakdown={atsBreakdown}
        />
        <SkillGapAnalysisCard
          skillGap={skillGap}
          onOpenMatchModal={() => setJobMatchModalOpen(true)}
        />
      </div>

      {/* Health Report & AI Suggestions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {activeResume?.healthReport && (
          <ResumeHealthReportCard healthReport={activeResume.healthReport} />
        )}
        {activeResume?.suggestions && (
          <AiResumeSuggestions suggestions={activeResume.suggestions} />
        )}
      </div>

      {/* Skill-Matched Job Recommendations */}
      <div id="recommendations-section">
        <AiJobRecommendationsSection recommendations={recommendations} />
      </div>

      {/* Analytics Dashboard */}
      <ResumeAnalyticsSection analytics={analytics} />

      {/* Modals */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
      <ResumePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
      />
      <ResumeVersionHistoryModal
        isOpen={isVersionsModalOpen}
        onClose={() => setVersionsModalOpen(false)}
      />
      <JobCompatibilityModal
        isOpen={isJobMatchModalOpen}
        onClose={() => setJobMatchModalOpen(false)}
      />
    </div>
  );
}
