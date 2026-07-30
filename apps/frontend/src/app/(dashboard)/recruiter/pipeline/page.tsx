'use client';

import React, { useState } from 'react';
import { Users, Clock, Plus, ChevronRight, CheckCircle, X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const STAGES = [
  { id: 'new', title: 'New Applicants', color: 'bg-blue-500', badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { id: 'screening', title: 'Screening', color: 'bg-amber-500', badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'interview', title: 'Interviewing', color: 'bg-purple-500', badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { id: 'offer', title: 'Offer Extended', color: 'bg-emerald-500', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'hired', title: 'Hired', color: 'bg-cyan-500', badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
];

interface CandidateApplicant {
  id: string;
  name: string;
  roleApplied: string;
  stage: 'new' | 'screening' | 'interview' | 'offer' | 'hired';
  matchScore: number;
  appliedDate: string;
  color: string;
  initials: string;
  email: string;
}

const INITIAL_CANDIDATES: CandidateApplicant[] = [
  {
    id: 'ca1',
    name: 'Alex Rivers',
    roleApplied: 'Senior Frontend Engineer',
    stage: 'interview',
    matchScore: 96,
    appliedDate: '2 hours ago',
    color: '#3B82F6',
    initials: 'AR',
    email: 'alex.rivers@dev.io',
  },
  {
    id: 'ca2',
    name: 'Sarah Chen',
    roleApplied: 'Full Stack Developer',
    stage: 'screening',
    matchScore: 92,
    appliedDate: '5 hours ago',
    color: '#10B981',
    initials: 'SC',
    email: 'sarah.chen@tech.com',
  },
  {
    id: 'ca3',
    name: 'Michael Vance',
    roleApplied: 'Senior Frontend Engineer',
    stage: 'new',
    matchScore: 88,
    appliedDate: '1 day ago',
    color: '#8B5CF6',
    initials: 'MV',
    email: 'michael.v@mobile.net',
  },
  {
    id: 'ca4',
    name: 'Elena Rostova',
    roleApplied: 'Product Designer',
    stage: 'offer',
    matchScore: 95,
    appliedDate: '3 days ago',
    color: '#F59E0B',
    initials: 'ER',
    email: 'elena.design@studio.org',
  },
];

export default function RecruiterPipelinePage() {
  const [candidates, setCandidates] = useState<CandidateApplicant[]>(INITIAL_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplicant | null>(null);

  const moveStage = (id: string, newStage: CandidateApplicant['stage']) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: newStage } : c))
    );
    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
            <Users className="w-8 h-8 text-primary" />
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
              <div key={stg.id} className="w-80 flex flex-col bg-muted/40 border rounded-2xl p-4 min-h-[520px]">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', stg.color)} />
                    <h3 className="font-bold text-sm">{stg.title}</h3>
                  </div>
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', stg.badgeColor)}>
                    {list.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {list.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl p-4">
                      <p className="text-xs text-muted-foreground">No candidates in this stage</p>
                    </div>
                  ) : (
                    list.map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand)}
                        className="bg-card border rounded-xl p-4 shadow-xs hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                            style={{ backgroundColor: cand.color }}
                          >
                            {cand.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{cand.name}</h4>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                {cand.matchScore}%
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-muted-foreground">{cand.roleApplied}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> {cand.appliedDate}</span>
                          <span className="font-semibold text-primary group-hover:underline">Review Candidate</span>
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
          <div className="bg-card border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ backgroundColor: selectedCandidate.color }}
                >
                  {selectedCandidate.initials}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedCandidate.name}</h3>
                  <p className="text-sm font-semibold text-primary">{selectedCandidate.roleApplied}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-1.5 rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-3 bg-muted/50 rounded-xl space-y-1">
                <span className="text-xs text-muted-foreground block">Email</span>
                <span className="font-semibold text-xs flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary" /> {selectedCandidate.email}</span>
              </div>

              <div>
                <span className="text-xs font-bold text-muted-foreground block mb-2">Move Recruitment Stage</span>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((stg) => (
                    <button
                      key={stg.id}
                      onClick={() => moveStage(selectedCandidate.id, stg.id as any)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border',
                        selectedCandidate.stage === stg.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-card hover:bg-muted text-muted-foreground'
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
