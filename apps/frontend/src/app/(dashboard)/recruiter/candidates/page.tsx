'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, MapPin, Briefcase, Check, X, RotateCcw, UserCheck, AlertTriangle, Users } from 'lucide-react';
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
}

export default function RecruiterCandidatesPage() {
  const queryClient = useQueryClient();
  const [shortlisted, setShortlisted] = useState<CandidateProfile[]>([]);
  const [history, setHistory] = useState<CandidateProfile[]>([]);

  const { data: rawCandidates, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.recruiterCandidates,
    queryFn: () => usersApi.getCandidates(),
    staleTime: 2 * 60 * 1000,
  });

  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);

  useEffect(() => {
    if (rawCandidates) {
      setCandidates(rawCandidates);
    }
  }, [rawCandidates]);

  const handleAction = async (direction: 'left' | 'right') => {
    if (candidates.length === 0) return;
    const current = candidates[0];

    if (direction === 'right') {
      setShortlisted([current, ...shortlisted]);
    }
    setHistory([current, ...history]);
    setCandidates(candidates.slice(1));
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
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground">
            <UserCheck className="w-7 h-7 text-primary" />
            Candidate Discovery
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Review AI-matched candidates looking for new opportunities.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
            {candidates.length} in Active Pool
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success">
            {shortlisted.length} Shortlisted
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Failed to load candidate directory from database.
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Candidate Evaluation Card */}
        <div className="lg:col-span-8 space-y-6">
          {isLoading ? (
            <div className="h-96 rounded-3xl glass-1 border border-border animate-pulse" />
          ) : currentCandidate ? (
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
                      {currentCandidate.matchScore || 90}% Match Score
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

                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">Skills & Technologies</h4>
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

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Undo Last Action
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleAction('left')}
                    className="rounded-2xl px-6 py-6 border-destructive/30 hover:bg-destructive/10 text-destructive font-bold text-sm"
                  >
                    <X className="w-5 h-5 mr-1.5" /> Pass
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleAction('right')}
                    className="rounded-2xl px-8 py-6 font-bold text-sm shadow-md"
                  >
                    <Check className="w-5 h-5 mr-1.5" /> Shortlist Candidate
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed rounded-3xl glass-1 border-border p-8 space-y-4">
              <Users className="w-10 h-10 text-primary mx-auto opacity-70" />
              <h3 className="text-lg font-bold text-foreground">All Candidates Reviewed</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You have reached the end of the current candidate pool. New matching candidates will appear automatically.
              </p>
              <Button onClick={() => refetch()} variant="outline" className="rounded-xl text-xs font-bold">
                Refresh Directory
              </Button>
            </div>
          )}
        </div>

        {/* Shortlist Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-bold text-base text-foreground">Shortlisted Candidates ({shortlisted.length})</h3>
          <div className="glass-1 border border-border rounded-2xl p-4 space-y-3 min-h-[300px]">
            {shortlisted.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground text-center">
                Shortlisted candidates will appear here for batch outreach and interview scheduling.
              </div>
            ) : (
              shortlisted.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 glass-2 border border-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: c.color || '#1677A8' }}
                    >
                      {c.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{c.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{c.location || 'Remote'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                    {c.matchScore || 90}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
