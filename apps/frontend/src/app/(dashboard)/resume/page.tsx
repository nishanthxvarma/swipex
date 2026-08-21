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
  CheckCircle2,
  AlertCircle,
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

  const atsScore = activeResume?.atsScore ?? 0;
  const atsBreakdown = activeResume?.atsBreakdown || {
    contactInfo: { score: 10.0, max: 10, details: 'Full contact details provided.' },
    education: { score: 15.0, max: 15, details: 'Verified degree information.' },
    projects: { score: 20.0, max: 20, details: 'Quantitative technical projects.' },
    skills: { score: 25.0, max: 25, details: 'Skills and technical keywords.' },
    experience: { score: 15.0, max: 15, details: 'Work history.' },
    keywords: { score: 10.0, max: 10, details: 'Industry keyword presence.' },
    formatting: { score: 5.0, max: 5, details: 'Parsable format.' },
  };

  const dashboardCards = [
    {
      title: 'Active Resume',
      value: activeResume?.originalName || 'No resume uploaded',
      subtitle: activeResume ? `Uploaded ${new Date(activeResume.uploadedAt).toLocaleDateString()}` : 'Upload PDF / DOCX',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      action: () => setUploadModalOpen(true),
      actionText: 'Upload New',
    },
    {
      title: 'ATS Readiness Score',
      value: `${atsScore} / 100`,
      subtitle: atsScore >= 80 ? 'High ATS Pass Likelihood' : 'Needs Optimization',
      icon: Award,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      action: () => setPreviewModalOpen(true),
      actionText: 'View Details',
    },
    {
      title: 'Skill Gap Alignment',
      value: `${skillGap?.matchPercentage || (atsScore > 0 ? atsScore : 0)}%`,
      subtitle: `${skillGap?.alreadyKnown?.length || 0} Core Skills Matched`,
      icon: Target,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      action: () => setJobMatchModalOpen(true),
      actionText: 'Compare Job',
    },
    {
      title: 'Matched Opportunities',
      value: `${recommendations.length} Roles`,
      subtitle: 'Deterministic skill matches',
      icon: Sparkles,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      action: () => {
        const el = document.getElementById('recommendations-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
      actionText: 'Explore Roles',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Resume Intelligence & ATS Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic ATS scoring, keyword density extraction, and skill gap identification.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setVersionsModalOpen(true)}
            className="rounded-xl font-semibold text-xs h-9 bg-[#0C1119] border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            <History className="w-3.5 h-3.5 mr-1.5 text-primary" /> Versions
          </Button>

          <Button
            variant="outline"
            onClick={() => setPreviewModalOpen(true)}
            className="rounded-xl font-semibold text-xs h-9 bg-[#0C1119] border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5 text-primary" /> Preview
          </Button>

          <Button
            onClick={() => setUploadModalOpen(true)}
            className="rounded-xl font-bold text-xs h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4 mr-1.5" /> Upload Resume
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={clearNotifications} className="hover:underline text-[11px]">Dismiss</button>
        </motion.div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dashboard Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-xl font-bold text-slate-100 tracking-tight truncate">{card.value}</p>
                <p className="text-[11px] text-slate-400 truncate">{card.subtitle}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bgColor} ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={card.action}
              className="text-xs font-semibold text-primary hover:text-primary justify-between p-0 h-auto hover:bg-transparent"
            >
              <span>{card.actionText}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
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
