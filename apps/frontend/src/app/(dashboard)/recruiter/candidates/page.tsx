'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Briefcase, Award, Check, X, RotateCcw, FileText, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usersApi } from '@swipex/api';
import { cn } from '@/lib/utils';

export default function RecruiterCandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [shortlisted, setShortlisted] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCandidates() {
      setIsLoading(true);
      setError(null);
      try {
        const list = await usersApi.getCandidates();
        if (Array.isArray(list)) {
          setCandidates(list);
        }
      } catch (err: any) {
        console.error('Candidate directory load error:', err);
        setError('Failed to load candidate talent directory.');
      } finally {
        setIsLoading(false);
      }
    }
    loadCandidates();
  }, []);

  const handleAction = async (direction: 'left' | 'right') => {
    if (candidates.length === 0) return;
    const current = candidates[0];
    const prevCandidates = [...candidates];
    const prevShortlisted = [...shortlisted];
    const prevHistory = [...history];

    if (direction === 'right') {
      setShortlisted([current, ...shortlisted]);
    }
    setHistory([current, ...history]);
    setCandidates(candidates.slice(1));

    try {
      await usersApi.recordCandidateAction({
        candidateId: current.id,
        action: direction === 'right' ? 'shortlist' : 'pass',
        notes: direction === 'right' ? 'Candidate shortlisted by recruiter' : 'Candidate passed',
      });
    } catch (err) {
      console.error('Error persisting candidate action:', err);
      // Rollback
      setCandidates(prevCandidates);
      setShortlisted(prevShortlisted);
      setHistory(prevHistory);
      setError('Could not record action on server.');
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[0];
    setHistory(history.slice(1));
    setShortlisted(shortlisted.filter((c) => c.id !== last.id));
    setCandidates([last, ...candidates]);
  };

  const currentCandidate = candidates[0];

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Candidate Discovery Feed</h1>
          <p className="text-xs text-slate-400">Discover and evaluate engineering talent with ATS match analysis.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1 rounded-lg bg-[#0C1119] border border-slate-800 text-slate-300">
            {candidates.length} in discovery pool
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="h-96 rounded-2xl bg-[#0C1119] border border-slate-800 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="p-12 text-center bg-[#0C1119] rounded-2xl border border-slate-800 max-w-md mx-auto space-y-4 my-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No more candidates in pool</h3>
            <p className="text-xs text-slate-400">You have reviewed all available candidate profiles.</p>
          </div>
          {history.length > 0 && (
            <Button onClick={handleUndo} variant="outline" className="h-9 text-xs rounded-xl border-slate-700">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Undo Last Action
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Candidate Card */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-lg text-primary">
                  {(currentCandidate.name || 'Candidate').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{currentCandidate.name || 'Software Engineer'}</h3>
                  <p className="text-xs text-slate-300 font-medium">{currentCandidate.headline || currentCandidate.title || 'Full Stack Engineer'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{currentCandidate.location || 'Remote'}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">ATS Alignment</span>
                <p className="text-lg font-mono font-bold text-emerald-400">{currentCandidate.matchScore || 92}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Candidate Bio</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                {currentCandidate.bio || 'Experienced engineer with verified proficiency in core frameworks, cloud microservices, and database design.'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Technical Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {(currentCandidate.skills || ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker']).map((s: string, idx: number) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700/60 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-30 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleAction('left')}
                  variant="outline"
                  className="h-10 px-5 rounded-xl border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold"
                >
                  <X className="w-4 h-4 mr-1.5" /> Pass
                </Button>
                <Button
                  onClick={() => handleAction('right')}
                  className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm"
                >
                  <Check className="w-4 h-4 mr-1.5" /> Shortlist Candidate
                </Button>
              </div>
            </div>
          </div>

          {/* Shortlisted Candidates Panel */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Shortlisted This Session ({shortlisted.length})</h3>
            {shortlisted.length === 0 ? (
              <p className="text-xs text-slate-500">Shortlisted candidates will appear here.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {shortlisted.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                    <p className="font-bold text-slate-200">{c.name}</p>
                    <p className="text-[11px] text-slate-400">{c.headline || 'Software Engineer'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
