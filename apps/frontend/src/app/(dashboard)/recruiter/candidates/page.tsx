'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  MapPin,
  Briefcase,
  Check,
  X,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  Users,
  Loader2,
  Bookmark,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usersApi } from '@swipex/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/hooks/queries';

interface CandidateProfile {
  id: string;
  name: string;
  headline?: string;
  title?: string;
  location?: string;
  experience?: string;
  matchScore?: number;
  skills?: string[];
  bio?: string;
  color?: string;
  initials?: string;
  email?: string;
}

export default function RecruiterCandidatesPage() {
  const queryClient = useQueryClient();
  const [shortlisted, setShortlisted] = useState<CandidateProfile[]>([]);
  const [passed, setPassed] = useState<CandidateProfile[]>([]);
  const [history, setHistory] = useState<CandidateProfile[]>([]);

  const {
    data: rawCandidates,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.recruiterCandidates,
    queryFn: () => usersApi.getCandidates(),
    staleTime: 2 * 60 * 1000,
  });

  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);

  useEffect(() => {
    if (rawCandidates && Array.isArray(rawCandidates)) {
      setCandidates(rawCandidates);
    }
  }, [rawCandidates]);

  const handleAction = async (direction: 'left' | 'right') => {
    if (candidates.length === 0) return;
    const current = candidates[0];

    if (direction === 'right') {
      setShortlisted([current, ...shortlisted]);
      try {
        await usersApi.recordCandidateAction({
          candidateId: current.id,
          action: 'shortlist',
        });
      } catch (err) {
        console.warn('Failed to record candidate action:', err);
      }
    } else {
      setPassed([current, ...passed]);
      try {
        await usersApi.recordCandidateAction({
          candidateId: current.id,
          action: 'pass',
        });
      } catch (err) {
        console.warn('Failed to record candidate action:', err);
      }
    }
    setHistory([current, ...history]);
    setCandidates(candidates.slice(1));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[0];
    setHistory(history.slice(1));
    setShortlisted(shortlisted.filter((c) => c.id !== last.id));
    setPassed(passed.filter((c) => c.id !== last.id));
    setCandidates([last, ...candidates]);
  };

  const currentCandidate = candidates[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground">
            <UserCheck className="w-7 h-7 text-primary" />
            Candidate Discovery
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Evaluate candidate profiles and shortlist top engineering talent.
          </p>
        </div>

        {!isLoading && !isError && (
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              {candidates.length} in Active Pool
            </div>
            <div className="text-xs font-semibold px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success">
              {shortlisted.length} Shortlisted
            </div>
          </div>
        )}
      </div>

      {isError ? (
        <div className="p-8 border border-dashed rounded-3xl glass-1 border-destructive/30 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
          <h3 className="text-base font-bold text-foreground">Unable to connect to candidate directory</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Please ensure you have recruiter permissions and database connectivity.
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="rounded-xl font-bold">
            Retry Connection
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading verified candidate pool...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="p-12 border border-dashed rounded-3xl glass-1 border-border text-center space-y-4 max-w-lg mx-auto">
          <Users className="w-12 h-12 text-primary mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-foreground">You have reviewed all available candidates</h3>
          <p className="text-xs text-muted-foreground">
            {shortlisted.length > 0
              ? `You shortlisted ${shortlisted.length} candidate${shortlisted.length === 1 ? '' : 's'}. You can review them in your Shortlisted list.`
              : 'Check back soon as new candidate profiles are registered on SwipeX.'}
          </p>
          {history.length > 0 && (
            <Button size="sm" variant="outline" onClick={handleUndo} className="rounded-xl">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Undo Last Action
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Candidate Evaluation Card */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-2 border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-border pb-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md shrink-0"
                  style={{ backgroundColor: currentCandidate.color || '#1677A8' }}
                >
                  {currentCandidate.initials || 'C'}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-2xl font-bold text-foreground">{currentCandidate.name}</h2>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-success/10 text-success border border-success/20">
                      {currentCandidate.matchScore || 88}% Match Index
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {currentCandidate.headline || currentCandidate.title || 'Software Engineer'}
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {currentCandidate.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-primary" /> {currentCandidate.experience || '2+ Years Exp'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & Skills */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About Candidate</h4>
                <p className="text-sm text-foreground/90 leading-relaxed glass-1 p-4 rounded-2xl border border-border">
                  {currentCandidate.bio || 'Experienced software professional specialized in full-stack web applications.'}
                </p>

                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">Skills &amp; Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {(currentCandidate.skills && currentCandidate.skills.length > 0
                    ? currentCandidate.skills
                    : ['React', 'TypeScript', 'Node.js', 'PostgreSQL']
                  ).map((s, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg text-xs font-semibold glass-1 border border-border text-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
                <Button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12"
                  title="Undo"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleAction('left')}
                  variant="destructive"
                  className="rounded-2xl px-6 h-12 font-bold shadow-md"
                >
                  <X className="w-5 h-5 mr-1.5" /> Pass
                </Button>
                <Button
                  onClick={() => handleAction('right')}
                  variant="primary"
                  className="rounded-2xl px-8 h-12 font-bold shadow-lg"
                >
                  <Check className="w-5 h-5 mr-1.5" /> Shortlist Candidate
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Shortlisted Candidates */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-primary" /> Shortlisted ({shortlisted.length})
              </h3>
            </div>

            {shortlisted.length === 0 ? (
              <div className="p-6 border border-dashed rounded-2xl glass-1 border-border text-center text-xs text-muted-foreground">
                Shortlisted candidates will appear here during this session.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {shortlisted.map((c) => (
                  <div key={c.id} className="glass-1 border border-border rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-foreground">{c.name}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-success/10 text-success">
                        {c.matchScore || 90}%
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{c.headline || 'Software Engineer'}</p>
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
