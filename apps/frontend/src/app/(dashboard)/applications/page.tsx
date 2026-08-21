'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Briefcase, Clock, Calendar, CheckCircle2, XCircle, Plus, 
  LayoutGrid, List, ChevronRight, X, ExternalLink, Loader2, AlertCircle, ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@swipex/api';

const STAGES = [
  { id: 'applied', title: 'Applied', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { id: 'reviewing', title: 'Reviewing', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'shortlisted', title: 'Shortlisted', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'interview', title: 'Interview', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'offer', title: 'Offer', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'hired', title: 'Hired', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' },
  { id: 'rejected', title: 'Rejected', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' }
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobsApi.getUserApplications();
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      setError('Could not retrieve application records from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Application Tracking</h1>
          <p className="text-xs text-slate-400">Real-time status updates across your submitted applications.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-[#0C1119] border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === 'kanban'
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === 'table'
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            asChild
            className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm"
          >
            <Link href="/jobs">
              <span>Find More Roles</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
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
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-[#0C1119] rounded-2xl border border-slate-800 max-w-lg mx-auto space-y-4 my-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No applications submitted yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you swipe right on matching job cards, your applications will appear here with live tracking.
            </p>
          </div>
          <Button asChild className="h-9 px-4 rounded-xl bg-primary text-xs font-bold">
            <Link href="/jobs">Explore Job Discovery Feed</Link>
          </Button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-start">
          {STAGES.map((stage) => {
            const stageApps = applications.filter(
              (a) => a.status?.toLowerCase() === stage.id
            );
            return (
              <div key={stage.id} className="space-y-3 bg-[#0C1119] p-3 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{stage.title}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {stageApps.length}
                  </span>
                </div>

                <div className="space-y-2 min-h-[140px]">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 shadow-xs"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-slate-100 leading-snug">
                          {app.job?.title || 'Engineering Role'}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {app.job?.company?.name || 'Company'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                        <span>{app.job?.location || 'Remote'}</span>
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border", stage.color)}>
                          {stage.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="rounded-2xl bg-[#0C1119] border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Position</th>
                  <th className="p-4 font-semibold">Company</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-slate-100">{app.job?.title || 'Engineering Role'}</td>
                    <td className="p-4 text-slate-300">{app.job?.company?.name || 'Company'}</td>
                    <td className="p-4 text-slate-400">{app.job?.location || 'Remote'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                        {app.status || 'applied'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
