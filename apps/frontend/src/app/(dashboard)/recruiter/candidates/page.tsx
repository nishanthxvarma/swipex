'use client';

import React, { useState } from 'react';
import { Sparkles, MapPin, Briefcase, Award, Check, X, RotateCcw, FileText, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usersApi } from '@swipex/api';
import { Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CandidateProfile {
  id: string;
  name: string;
  headline: string;
  location: string;
  experience: string;
  matchScore: number;
  skills: string[];
  bio: string;
  color: string;
  initials: string;
}

const CANDIDATES: CandidateProfile[] = [
  {
    id: 'c1',
    name: 'Alex Rivers',
    headline: 'Senior React 19 & Next.js Architect',
    location: 'San Francisco, CA',
    experience: '6 Years Exp',
    matchScore: 96,
    skills: ['React 19', 'Next.js', 'TypeScript', 'TailwindCSS', 'GraphQL'],
    bio: 'Experienced frontend engineer specializing in design systems, performance optimization, and Next.js App Router applications.',
    color: '#3B82F6',
    initials: 'AR',
  },
  {
    id: 'c2',
    name: 'Sarah Chen',
    headline: 'Full Stack Engineer (Node.js & Postgres)',
    location: 'Remote (US)',
    experience: '5 Years Exp',
    matchScore: 92,
    skills: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS'],
    bio: 'Passionate full stack developer building high-throughput microservices and responsive web UIs.',
    color: '#10B981',
    initials: 'SC',
  },
  {
    id: 'c3',
    name: 'Michael Vance',
    headline: 'Mobile Lead (React Native / iOS)',
    location: 'New York, NY',
    experience: '4 Years Exp',
    matchScore: 88,
    skills: ['React Native', 'Swift', 'Kotlin', 'Redux'],
    bio: 'Mobile software engineer focused on shipping polished iOS and Android applications used by millions.',
    color: '#8B5CF6',
    initials: 'MV',
  },
];

export default function RecruiterCandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [shortlisted, setShortlisted] = useState<CandidateProfile[]>([]);
  const [history, setHistory] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadCandidates() {
      setIsLoading(true);
      setError(null);
      try {
        const list = await usersApi.getCandidates();
        setCandidates(list);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load candidate directory.');
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

    // Optimistic UI update
    if (direction === 'right') {
      setShortlisted([current, ...shortlisted]);
    }
    setHistory([current, ...history]);
    setCandidates(candidates.slice(1));

    try {
      await usersApi.recordCandidateAction({
        candidateId: current.id,
        action: direction === 'right' ? 'shortlist' : 'pass'
      });
    } catch (err: any) {
      console.error('Failed to persist candidate action:', err);
      // Rollback on error
      setCandidates(prevCandidates);
      setShortlisted(prevShortlisted);
      setHistory(prevHistory);
      setError('Failed to record candidate decision. Please check your connection.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-[#66788A] animate-pulse">Loading candidates feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl bg-destructive/5 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg">Connection Failure</h3>
        <p className="text-xs text-[#66788A] max-w-sm mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="rounded-xl font-bold">Retry</Button>
      </div>
    );
  }

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setShortlisted(shortlisted.filter((c) => c.id !== last.id));
    setCandidates([last, ...candidates]);
  };

  const activeCandidate = candidates[0];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
            <Sparkles className="w-8 h-8 text-primary" />
            Candidate Discovery
          </h1>
          <p className="text-[#66788A] text-sm mt-1">Swipe right to shortlist top matched talent for your open roles.</p>
        </div>
        
        <div className="text-xs font-bold glass-1 px-3 py-1.5 rounded-full border">
          Shortlisted: <span className="text-primary ml-1">{shortlisted.length}</span>
        </div>
      </div>

      <div className="relative w-full max-w-md mx-auto h-[540px] flex flex-col items-center justify-center">
        {!activeCandidate ? (
          <div className="text-center p-8 glass-1 rounded-3xl border shadow-md w-full space-y-4">
            <div className="text-4xl">🎉</div>
            <h3 className="text-xl font-bold">All Candidates Reviewed!</h3>
            <p className="text-[#66788A] text-xs">You have reviewed all available candidate profiles for your active listings.</p>
            <Button
              onClick={() => {
                setCandidates(CANDIDATES);
                setHistory([]);
                setShortlisted([]);
              }}
              className="rounded-xl font-bold text-xs"
            >
              Reset Stack
            </Button>
          </div>
        ) : (
          <div className="relative w-full h-[480px] glass-1 border rounded-3xl shadow-xl p-6 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                    style={{ backgroundColor: activeCandidate.color }}
                  >
                    {activeCandidate.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{activeCandidate.name}</h3>
                    <p className="text-xs font-semibold text-primary">{activeCandidate.headline}</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {activeCandidate.matchScore}% Match
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-medium text-[#66788A] mb-4">
                <span className="flex items-center gap-1 glass-1 px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {activeCandidate.location}
                </span>
                <span className="flex items-center gap-1 glass-1 px-2.5 py-1 rounded-lg">
                  <Briefcase className="w-3.5 h-3.5 text-primary" /> {activeCandidate.experience}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <span className="text-xs font-bold text-[#66788A] block">Key Technical Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeCandidate.skills.map((s, i) => (
                    <span key={i} className="text-xs font-semibold px-2.5 py-1 glass-1 border rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#66788A] block">About</span>
                <p className="text-xs text-[#66788A] leading-relaxed p-3 glass-1/40 rounded-xl">
                  {activeCandidate.bio}
                </p>
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 pt-4 border-t">
              <button
                onClick={() => handleAction('left')}
                className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-transform"
                title="Pass"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="w-10 h-10 rounded-full glass-1 text-[#66788A] hover:text-[#F5FAFF] disabled:opacity-40 flex items-center justify-center transition-all"
                title="Undo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAction('right')}
                className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-emerald-500 hover:scale-110 active:scale-95 transition-transform"
                title="Shortlist / Match"
              >
                <Check className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
