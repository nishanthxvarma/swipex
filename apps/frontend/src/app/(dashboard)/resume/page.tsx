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
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  FileCheck2,
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

  const atsScore = activeResume ? Math.round(activeResume.atsScore) : 0;
  const atsBreakdown = activeResume?.atsBreakdown;



  return (
    <div className="space-y-8 pb-20 md:pb-8 relative">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <FileCheck2 className="w-6 h-6 text-primary" />
              AI Resume Analysis &amp; ATS Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Extract resume structure, calculate deterministic ATS compatibility, detect keyword gaps, and match engineering roles.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {activeResume && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVersionsModalOpen(true)}
                className="rounded-xl text-xs"
              >
                <History className="w-4 h-4 mr-1.5" /> Versions
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewModalOpen(true)}
                className="rounded-xl text-xs"
              >
                <Eye className="w-4 h-4 mr-1.5" /> Preview Resume
              </Button>
            </>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            className="rounded-xl font-bold text-xs shadow-md"
          >
            <UploadCloud className="w-4 h-4 mr-1.5" /> {activeResume ? 'Upload New Version' : 'Upload Resume'}
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl flex items-center justify-between text-xs font-semibold bg-success/10 border border-success/20 text-success"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={clearNotifications} className="text-xs opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Error Notification Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl flex items-center justify-between text-xs font-semibold bg-destructive/10 border border-destructive/20 text-destructive"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={clearNotifications} className="text-xs opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
            Dismiss
          </button>
        </motion.div>
      )}

      {isLoading && !activeResume ? (
        <div className="border border-border glass-1 rounded-3xl p-10 max-w-xl mx-auto my-8 space-y-4 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto" />
          <div className="h-6 w-48 bg-muted rounded-xl mx-auto" />
          <div className="h-4 w-72 bg-muted rounded-xl mx-auto" />
        </div>
      ) : !activeResume ? (
        /* Empty State */
        <div className="border border-dashed border-border glass-1 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No Resume Analyzed Yet</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Upload your resume in PDF or DOCX format to receive deterministic ATS scoring, skill taxonomy extraction, and AI-powered recommendations.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setUploadModalOpen(true)}
              className="rounded-xl font-bold text-xs shadow-md"
            >
              <UploadCloud className="w-4 h-4 mr-2" /> Upload Resume for AI Analysis
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Dashboard Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-1 border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Resume</p>
                  <p className="text-lg font-bold text-foreground tracking-tight truncate">{activeResume.originalName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {new Date(activeResume.uploadedAt).toLocaleDateString()} • {(activeResume.fileSize / 1024).toFixed(0)} KB
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center justify-between text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <span>Upload New</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="glass-1 border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ATS Score Index</p>
                  <p className="text-lg font-bold text-foreground tracking-tight">{atsScore} / 100</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {atsScore >= 80 ? 'Optimal ATS Pass' : atsScore >= 60 ? 'Moderate ATS Rank' : 'Needs Optimization'}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Award className="h-5 w-5" />
                </div>
              </div>
              <button
                onClick={() => setPreviewModalOpen(true)}
                className="flex items-center justify-between text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <span>View Breakdown</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="glass-1 border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Target Job Match</p>
                  <p className="text-lg font-bold text-foreground tracking-tight">
                    {skillGap ? `${skillGap.matchPercentage}%` : 'Not evaluated'}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {skillGap ? `${skillGap.alreadyKnown.length} Satisfied Skills` : 'Select job to compare'}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Target className="h-5 w-5" />
                </div>
              </div>
              <button
                onClick={() => setJobMatchModalOpen(true)}
                className="flex items-center justify-between text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <span>Compare Job</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="glass-1 border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">AI Recommendations</p>
                  <p className="text-lg font-bold text-foreground tracking-tight">{recommendations.length} Roles</p>
                  <p className="text-[11px] text-muted-foreground truncate">Skill-matched opportunities</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('recommendations-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-between text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <span>Explore Jobs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Grid Section 1: ATS Meter & Skill Gap */}
          <div className="grid gap-6 lg:grid-cols-2">
            {atsBreakdown && (
              <AtsScoreMeter
                score={atsScore}
                breakdown={atsBreakdown}
              />
            )}
            <SkillGapAnalysisCard
              skillGap={skillGap}
              onOpenMatchModal={() => setJobMatchModalOpen(true)}
            />
          </div>

          {/* Health Report & AI Suggestions */}
          <div className="grid gap-6 lg:grid-cols-2">
            {activeResume.healthReport && (
              <ResumeHealthReportCard healthReport={activeResume.healthReport} />
            )}
            {activeResume.suggestions && (
              <AiResumeSuggestions suggestions={activeResume.suggestions} />
            )}
          </div>

          {/* Skill-Matched Job Recommendations */}
          <div id="recommendations-section">
            <AiJobRecommendationsSection recommendations={recommendations} />
          </div>

          {/* Analytics Dashboard */}
          {analytics && <ResumeAnalyticsSection analytics={analytics} />}
        </>
      )}

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
