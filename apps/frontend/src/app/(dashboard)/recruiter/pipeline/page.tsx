'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Clock, Mail, Loader2, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@swipex/api';

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
  const [candidates, setCandidates] = useState<CandidateApplicant[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplicant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobsApi.getRecruiterPipeline();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Failed to load recruiter pipeline:', err);
      setError('Failed to load live applications pipeline.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const moveStage = async (id: string, newStage: CandidateApplicant['stage']) => {
    const prevCandidates = [...candidates];
    
    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: newStage } : c))
    );
    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));
    }

    try {
      await jobsApi.updateApplicationStatus(id, newStage);
    } catch (err) {
      console.error('Failed to update stage in database:', err);
      // Rollback
      setCandidates(prevCandidates);
      if (selectedCandidate && selectedCandidate.id === id) {
        const orig = prevCandidates.find((c) => c.id === id);
        if (orig) setSelectedCandidate(orig);
      }
      setError('Failed to update candidate status on server.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading candidate pipeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl glass-1 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg text-foreground">Connection Failure</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">{error}</p>
        <Button onClick={() => fetchPipeline()} className="rounded-xl font-bold">Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground">
            <Users className="w-7 h-7 text-primary" />
            Candidate Pipeline
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Review applicant profiles and progress candidates across recruitment stages.</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 pt-2">
        <div className="flex gap-6 min-w-max">
          {STAGES.map((stg) => {
            const list = candidates.filter((c) => c.stage === stg.id);
            return (
              <div key={stg.id} className="w-80 flex flex-col glass-1 border border-border rounded-2xl p-4 min-h-[520px]">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2.5 h-2.5 rounded-full', stg.color)} />
                    <h3 className="font-bold text-sm text-foreground">{stg.title}</h3>
                  </div>
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', stg.badgeColor)}>
                    {list.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {list.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border/60 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground">No candidates in this stage</p>
                    </div>
                  ) : (
                    list.map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand)}
                        className="glass-2 border border-border rounded-xl p-4 shadow-xs hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                            style={{ backgroundColor: cand.color || '#1677A8' }}
                          >
                            {cand.initials || 'C'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors">{cand.name}</h4>
                              <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                                {cand.matchScore}%
                              </span>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">{cand.roleApplied}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/60">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> {cand.appliedDate}</span>
                          <span className="font-semibold text-primary group-hover:underline">Review</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Action Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)}>
          <div className="glass-3 border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ backgroundColor: selectedCandidate.color || '#1677A8' }}
                >
                  {selectedCandidate.initials || 'C'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{selectedCandidate.name}</h3>
                  <p className="text-sm font-semibold text-primary">{selectedCandidate.roleApplied}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-1.5 rounded-full hover:bg-secondary cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 text-sm">
              {selectedCandidate.email && (
                <div className="p-3 glass-2 border border-border rounded-xl space-y-1">
                  <span className="text-xs text-muted-foreground block">Email</span>
                  <span className="font-semibold text-xs flex items-center gap-1.5 text-foreground"><Mail className="w-3.5 h-3.5 text-primary" /> {selectedCandidate.email}</span>
                </div>
              )}

              <div>
                <span className="text-xs font-bold text-muted-foreground block mb-2 uppercase tracking-wider">Move Recruitment Stage</span>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((stg) => (
                    <button
                      key={stg.id}
                      onClick={() => moveStage(selectedCandidate.id, stg.id as any)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer',
                        selectedCandidate.stage === stg.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'glass-1 hover:bg-secondary text-muted-foreground'
                      )}
                    >
                      {stg.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setSelectedCandidate(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
