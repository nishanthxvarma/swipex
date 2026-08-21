'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, MapPin, Briefcase, Check, X, RotateCcw, UserCheck, Loader2, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usersApi } from '@swipex/api';

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
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [shortlisted, setShortlisted] = useState<CandidateProfile[]>([]);
  const [history, setHistory] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await usersApi.getCandidates();
      setCandidates(list || []);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to load candidate directory.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

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

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading candidate pool...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl glass-1 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg text-foreground">Connection Failure</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">{error}</p>
        <Button onClick={() => loadCandidates()} className="rounded-xl font-bold">Retry Connection</Button>
      </div>
    );
  }

  const currentCandidate = candidates[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
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
            {shortlisted.length} Shortlisted
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="rounded-xl text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Undo
          </Button>
        </div>
      </div>

      {!currentCandidate ? (
        <div className="text-center py-16 border border-dashed rounded-3xl glass-1 border-border p-8 space-y-4 max-w-lg mx-auto">
          <Users className="w-12 h-12 text-primary mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-foreground">No more candidates</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You&apos;ve reviewed all available matched candidates in this queue. Check back as new engineers join SwipeX.
          </p>
          <Button onClick={() => loadCandidates()} variant="outline" className="rounded-xl text-xs font-bold">
            Refresh Candidate Queue
          </Button>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <div className="glass-3 border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Candidate Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md"
                  style={{ backgroundColor: currentCandidate.color || '#1677A8' }}
                >
                  {currentCandidate.initials || 'C'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{currentCandidate.name}</h2>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{currentCandidate.headline || currentCandidate.title || 'Full Stack Engineer'}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> {currentCandidate.location || 'Remote'}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-primary" /> {currentCandidate.experience || '3+ Years'}</span>
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
                {currentCandidate.matchScore || 92}% Match
              </span>
            </div>

            {/* Candidate Skills */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Core Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {(currentCandidate.skills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL']).map((skill, idx) => (
                  <span key={idx} className="text-xs font-semibold px-3 py-1 rounded-lg glass-1 border border-border text-foreground">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Candidate Bio */}
            {currentCandidate.bio && (
              <div className="space-y-1 pt-2 border-t border-border/60">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">About</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{currentCandidate.bio}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border flex justify-center gap-6">
              <button
                onClick={() => handleAction('left')}
                title="Pass"
                className="w-14 h-14 rounded-full glass-2 border border-destructive/30 text-destructive flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleAction('right')}
                title="Shortlist Candidate"
                className="w-14 h-14 rounded-full bg-success text-success-foreground flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <Check className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
