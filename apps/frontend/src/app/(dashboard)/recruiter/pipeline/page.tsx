'use client';

import React, { useState } from 'react';
import { Users, Clock, Mail, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@swipex/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/hooks/queries';

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
  const queryClient = useQueryClient();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplicant | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: pipelineData, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.recruiterPipeline,
    queryFn: () => jobsApi.getRecruiterPipeline(),
    staleTime: 2 * 60 * 1000,
  });

  const candidates: CandidateApplicant[] = Array.isArray(pipelineData) ? pipelineData : [];

  const moveStage = async (id: string, newStage: CandidateApplicant['stage']) => {
    // Optimistic UI update
    queryClient.setQueryData(QUERY_KEYS.recruiterPipeline, (old: any) =>
      (old || []).map((c: any) => (c.id === id ? { ...c, stage: newStage } : c))
    );

    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));
    }

    try {
      await jobsApi.updateApplicationStatus(id, newStage);
    } catch (err) {
      console.error('Failed to update stage in database:', err);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recruiterPipeline });
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

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
            {candidates.length} Total Applicants
          </span>
        </div>
      </div>

      {error || errorMsg ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {errorMsg || 'Failed to pull live applications pipeline.'}
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {/* Kanban Board */}
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Drawer / Modal */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="glass-3 border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-foreground">{selectedCandidate.name}</h3>
                <p className="text-xs text-muted-foreground">Applying for {selectedCandidate.roleApplied}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1 rounded-full hover:bg-secondary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Match Score</span>
                <span className="font-bold text-success">{selectedCandidate.matchScore || 90}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Current Stage</span>
                <span className="font-bold uppercase text-primary">{selectedCandidate.stage}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Applied Date</span>
                <span className="font-semibold text-foreground">{selectedCandidate.appliedDate}</span>
              </div>
            </div>

            {/* Move stage action */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-xs font-semibold text-foreground block">Transition Pipeline Stage:</span>
              <div className="grid grid-cols-3 gap-2">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => moveStage(selectedCandidate.id, s.id as any)}
                    disabled={selectedCandidate.stage === s.id}
                    className={cn(
                      'text-[10px] font-bold py-1.5 px-2 rounded-lg border transition-all cursor-pointer',
                      selectedCandidate.stage === s.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'glass-2 border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {s.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={() => setSelectedCandidate(null)} className="w-full rounded-xl font-bold mt-2">
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
