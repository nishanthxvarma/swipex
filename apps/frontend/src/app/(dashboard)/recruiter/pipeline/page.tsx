'use client';

import React, { useState } from 'react';
import {
  Users,
  Clock,
  Mail,
  AlertTriangle,
  X,
  Loader2,
  FileText,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@swipex/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/hooks/queries';
import { useAuthStore } from '@/stores/auth-store';

const STAGES = [
  { id: 'new', title: 'New Applicants', color: 'bg-primary', badgeColor: 'bg-primary/10 text-primary border border-primary/20' },
  { id: 'screening', title: 'Screening', color: 'bg-warning', badgeColor: 'bg-warning/10 text-warning border border-warning/20' },
  { id: 'interview', title: 'Interviewing', color: 'bg-accent', badgeColor: 'bg-accent/10 text-accent border border-accent/20' },
  { id: 'offer', title: 'Offer Extended', color: 'bg-success', badgeColor: 'bg-success/10 text-success border border-success/20' },
  { id: 'hired', title: 'Hired', color: 'bg-info', badgeColor: 'bg-info/10 text-info border border-info/20' },
];

interface CandidateApplicant {
  id: string;
  applicationId: string;
  name: string;
  roleApplied: string;
  stage: 'new' | 'screening' | 'interview' | 'offer' | 'hired';
  matchScore: number;
  appliedDate: string;
  color?: string;
  initials?: string;
  email?: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export default function RecruiterPipelinePage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplicant | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    data: pipelineData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.recruiterPipeline(user?.id),
    queryFn: () => jobsApi.getRecruiterPipeline(),
    staleTime: 2 * 60 * 1000,
  });

  const candidates: CandidateApplicant[] = Array.isArray(pipelineData) ? pipelineData : [];

  const moveStage = async (id: string, newStage: CandidateApplicant['stage']) => {
    // Optimistic UI update
    queryClient.setQueryData(QUERY_KEYS.recruiterPipeline(user?.id), (old: any) =>
      (old || []).map((c: any) => (c.id === id ? { ...c, stage: newStage } : c))
    );

    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));
    }

    try {
      await jobsApi.updateApplicationStatus(id, newStage);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recruiterPipeline(user?.id) });
    } catch (err) {
      console.error('Failed to update stage in database:', err);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recruiterPipeline(user?.id) });
      setErrorMsg('Failed to update candidate status on server.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground">
            <Users className="w-7 h-7 text-primary" />
            Hiring Pipeline
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track candidates across each stage of your hiring pipeline in real-time.
          </p>
        </div>

        {!isLoading && !isError && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              {candidates.length} Total Applicants
            </span>
          </div>
        )}
      </div>

      {isError ? (
        <div className="p-8 border border-dashed rounded-3xl glass-1 border-destructive/30 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
          <h3 className="text-base font-bold text-foreground">Unable to pull live applications pipeline</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Failed to connect to the applications database.
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="rounded-xl font-bold">
            Retry Connection
          </Button>
        </div>
      ) : errorMsg ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {errorMsg}
          </div>
          <Button size="sm" variant="outline" onClick={() => setErrorMsg(null)}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {/* Kanban Board */}
      {!isError && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {STAGES.map((stage) => {
            const stageCandidates = candidates.filter((c) => c.stage === stage.id);

            return (
              <div key={stage.id} className="glass-1 border border-border rounded-2xl p-4 flex flex-col min-h-[550px]">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', stage.color)} />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">{stage.title}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full glass-2 border border-border text-foreground">
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Stage Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-24 rounded-xl glass-2 border border-border animate-pulse" />
                      ))}
                    </div>
                  ) : stageCandidates.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border border-dashed border-border/40 rounded-xl text-[11px] text-muted-foreground/60 text-center p-3">
                      No candidates
                    </div>
                  ) : (
                    stageCandidates.map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand)}
                        className="glass-2 border border-border hover:border-primary/40 rounded-xl p-3.5 space-y-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {cand.name}
                          </div>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20 shrink-0">
                            {cand.matchScore || 90}%
                          </span>
                        </div>

                        <div className="text-[11px] text-muted-foreground font-medium truncate">
                          {cand.roleApplied}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" /> {cand.appliedDate}
                          </span>
                          <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                            Details →
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-3 border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative"
          >
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0"
                  style={{ backgroundColor: selectedCandidate.color || '#3B82F6' }}
                >
                  {selectedCandidate.initials || 'C'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{selectedCandidate.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedCandidate.roleApplied}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="glass-1 p-3 rounded-xl border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-semibold text-foreground truncate block">{selectedCandidate.email || 'applicant@swipex.io'}</span>
                </div>
                <div className="glass-1 p-3 rounded-xl border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Match Index</span>
                  <span className="font-bold text-success text-sm">{selectedCandidate.matchScore || 90}% Match</span>
                </div>
              </div>

              {selectedCandidate.coverLetter && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Application Notes</span>
                  <p className="text-xs text-foreground/90 glass-1 p-3 rounded-xl border border-border leading-relaxed">
                    {selectedCandidate.coverLetter}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Move Stage</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => moveStage(selectedCandidate.id, s.id as any)}
                      className={cn(
                        'py-2 px-1 text-[10px] font-bold rounded-lg transition-all border text-center cursor-pointer',
                        selectedCandidate.stage === s.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'glass-1 border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                      )}
                    >
                      {s.title.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-border">
              <Button variant="outline" className="rounded-xl text-xs font-bold" onClick={() => setSelectedCandidate(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
