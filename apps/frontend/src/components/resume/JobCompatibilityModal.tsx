'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, XCircle, Sparkles, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/stores/resume-store';
import { SkillGapAnalysisCard } from './SkillGapAnalysisCard';

interface JobCompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobCompatibilityModal: React.FC<JobCompatibilityModalProps> = ({ isOpen, onClose }) => {
  const { matchJob, isMatchingJob, jobMatchResult, skillGap } = useResumeStore();
  const [jobDescription, setJobDescription] = useState('');
  const [targetRoleTitle, setTargetRoleTitle] = useState('Senior Full Stack Engineer');

  if (!isOpen) return null;

  const handleRunMatch = () => {
    matchJob(undefined, jobDescription || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-card border rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Job Compatibility Engine</h3>
              <p className="text-xs text-muted-foreground">Compare your active resume against target job postings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input area */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Target Role Title</label>
            <input
              type="text"
              value={targetRoleTitle}
              onChange={(e) => setTargetRoleTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-background font-semibold"
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Paste Job Description (Optional)</label>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job posting duties, required qualifications, and tech stack here..."
              className="w-full px-3 py-2 text-xs border rounded-xl bg-background leading-relaxed"
            />
          </div>

          <Button
            onClick={handleRunMatch}
            disabled={isMatchingJob}
            className="w-full font-bold rounded-xl h-11"
          >
            {isMatchingJob ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Calculating Match & Skill Gaps...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> Calculate Match Score & Gaps
              </>
            )}
          </Button>
        </div>

        {/* Output comparison result */}
        {jobMatchResult && (
          <div className="space-y-6 pt-4 border-t">
            {/* Match Score Banner */}
            <div className="p-5 rounded-2xl bg-secondary/40 border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Job Match Compatibility
                </span>
                <h4 className="text-lg font-bold">{jobMatchResult.jobTitle}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {jobMatchResult.recommendationReason}
                </p>
              </div>

              <div className="text-center bg-card border px-5 py-3 rounded-2xl shadow-xs shrink-0">
                <span className="text-3xl font-black text-primary">{jobMatchResult.matchPercentage}%</span>
                <span className="text-[10px] font-bold text-muted-foreground block uppercase">Overall Match</span>
              </div>
            </div>

            {/* Satisfied vs Missing */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <h5 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Satisfied Requirements ({jobMatchResult.satisfiedSkills?.length || 0})
                </h5>
                <div className="flex flex-wrap gap-1">
                  {jobMatchResult.satisfiedSkills?.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-card border border-emerald-500/30 rounded-md font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-2">
                <h5 className="font-bold text-destructive flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Missing Keywords ({jobMatchResult.missingSkills?.length || 0})
                </h5>
                <div className="flex flex-wrap gap-1">
                  {jobMatchResult.missingSkills?.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 bg-card border border-destructive/30 rounded-md font-semibold text-destructive">
                      ✕ {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Embedded Skill Gap */}
            {skillGap && <SkillGapAnalysisCard skillGap={skillGap} />}
          </div>
        )}
      </motion.div>
    </div>
  );
};
