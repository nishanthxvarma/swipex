'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Clock, Plus, ChevronRight, CheckCircle2, X, Mail, Loader2, AlertCircle, RefreshCw, ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@swipex/api';

const STAGES = [
  { id: 'applied', title: 'New Applicants', color: 'text-blue-400 border-blue-500/30' },
  { id: 'reviewing', title: 'Reviewing', color: 'text-amber-400 border-amber-500/30' },
  { id: 'shortlisted', title: 'Shortlisted', color: 'text-purple-400 border-purple-500/30' },
  { id: 'interview', title: 'Interviewing', color: 'text-cyan-400 border-cyan-500/30' },
  { id: 'offer', title: 'Offer Extended', color: 'text-emerald-400 border-emerald-500/30' },
  { id: 'hired', title: 'Hired', color: 'text-emerald-400 border-emerald-500/40' },
  { id: 'rejected', title: 'Rejected', color: 'text-rose-400 border-rose-500/30' },
];

export default function RecruiterPipelinePage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobsApi.getRecruiterPipeline();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setError('Could not load candidate pipeline from the database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const moveStage = async (id: string, newStage: string) => {
    const prevCandidates = [...candidates];
    
    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: newStage, status: newStage } : c))
    );
    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate((prev: any) => (prev ? { ...prev, stage: newStage, status: newStage } : null));
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

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" />
            <span>Recruitment Pipeline</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Progress applicants through review, interview, offer, and hire stages.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchPipeline}
          className="h-9 px-3 rounded-xl border-slate-800 bg-[#0C1119] hover:bg-slate-800 text-xs font-semibold text-slate-300"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isLoading && "animate-spin")} />
          Refresh Pipeline
        </Button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Kanban Pipeline Columns */}
      {isLoading ? (
        <div className="h-96 rounded-2xl bg-[#0C1119] border border-slate-800 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stg) => {
              const stageList = candidates.filter((c) => {
                const s = (c.status || c.stage || 'applied').toLowerCase();
                return s === stg.id || (stg.id === 'applied' && s === 'new');
              });

              return (
                <div
                  key={stg.id}
                  className="w-72 bg-[#0C1119] border border-slate-800/80 rounded-2xl p-3.5 flex flex-col min-h-[520px] space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{stg.title}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {stageList.length}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {stageList.map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand)}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2.5 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-xs text-slate-100 leading-snug">{cand.name}</h4>
                            <p className="text-[11px] text-slate-400">{cand.roleApplied || 'Software Engineer'}</p>
                          </div>
                          {cand.matchScore && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {cand.matchScore}%
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                          <span>{cand.appliedDate ? new Date(cand.appliedDate).toLocaleDateString() : 'Applied'}</span>
                          <span className="text-primary hover:underline font-sans font-medium">Review →</span>
                        </div>
                      </div>
                    ))}

                    {stageList.length === 0 && (
                      <div className="h-32 rounded-xl border border-dashed border-slate-800/60 flex items-center justify-center text-slate-600 text-xs">
                        No candidates
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Candidate Review Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0C1119] border border-slate-700/80 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">{selectedCandidate.name}</h3>
                <p className="text-xs text-slate-400">{selectedCandidate.email}</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-slate-300">Progress Stage</p>
              <div className="grid grid-cols-2 gap-2">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => moveStage(selectedCandidate.id, s.id)}
                    className={cn(
                      "py-2 px-3 rounded-lg font-semibold text-left transition-all border text-xs cursor-pointer",
                      (selectedCandidate.status || selectedCandidate.stage)?.toLowerCase() === s.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setSelectedCandidate(null)}
              className="w-full h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
