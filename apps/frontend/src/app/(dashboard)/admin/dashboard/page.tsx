'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { analyticsApi, adminApi } from '@swipex/api';
import { 
  Users, Building2, Shield, Activity, 
  Briefcase, Loader2, AlertCircle, RefreshCw, Terminal, CheckCircle2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stats, logs] = await Promise.allSettled([
        analyticsApi.getAdminAnalytics(),
        adminApi.getActivityLogs()
      ]);
      if (stats.status === 'fulfilled') setTelemetry(stats.value);
      if (logs.status === 'fulfilled' && Array.isArray(logs.value)) setAuditLogs(logs.value);
    } catch (err: any) {
      console.error('Admin dashboard error:', err);
      setError('Failed to retrieve system operations telemetry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 text-[11px] font-mono text-slate-300 mb-1">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Platform Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            System Command Center
          </h1>
          <p className="text-xs text-slate-400">
            Authoritative platform telemetry, user verification, and security audit log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAdminData}
            className="h-9 px-3 rounded-xl border-slate-800 bg-[#0C1119] hover:bg-slate-800 text-xs font-semibold text-slate-300"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isLoading && "animate-spin")} />
            Sync Telemetry
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Telemetry Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500">Job Seekers</p>
          <p className="text-2xl font-bold text-slate-100">{telemetry?.totalJobSeekers ?? 0}</p>
          <Link href="/admin/users" className="text-[11px] text-primary hover:underline font-medium">User directory →</Link>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500">Verified Recruiters</p>
          <p className="text-2xl font-bold text-slate-100">{telemetry?.verifiedRecruiters ?? 0}</p>
          <Link href="/admin/recruiters" className="text-[11px] text-primary hover:underline font-medium">Approvals →</Link>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500">Active Job Postings</p>
          <p className="text-2xl font-bold text-slate-100">{telemetry?.activeJobListings ?? 0}</p>
          <span className="text-[11px] text-slate-400">In feed</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500">Platform Applications</p>
          <p className="text-2xl font-bold text-emerald-400">{telemetry?.platformApplications ?? 0}</p>
          <span className="text-[11px] text-slate-400">Total submitted</span>
        </div>
      </div>

      {/* Live Security & Activity Audit Log */}
      <div className="p-6 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-slate-100">Live Security & Operations Audit Stream</h3>
          </div>
          <Link href="/admin/activity" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
            <span>Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500">
            No audit log events recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {auditLogs.slice(0, 5).map((log, idx) => (
              <div
                key={log.id || idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'RECENT'}
                  </span>
                  <span className="font-bold text-slate-200">{log.action || log.event || 'SYSTEM_EVENT'}</span>
                  <span className="text-slate-400 font-sans text-[11px]">{log.details || log.target || ''}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {log.status || 'OK'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
