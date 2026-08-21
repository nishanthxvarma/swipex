'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { ApiClient, AnalyticsApi } from '@swipex/api';
import { motion } from 'framer-motion';
import { 
  Users, Building2, Shield, Activity, TrendingUp, AlertTriangle, 
  CheckCircle2, XCircle, Search, Filter, RefreshCw, Sparkles, Loader2,
  ArrowUpRight, BarChart3, UserCheck, Briefcase, Lock, Settings, Clock, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminStats = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = new ApiClient(
        process.env.NEXT_PUBLIC_API_URL || 'https://swipex-backend.onrender.com/api/v1',
        () => token || null,
        () => {}
      );
      const api = new AnalyticsApi(client);
      const res = await api.getAdminAnalytics();
      
      setStats([
        { name: 'Total Job Seekers', value: res.totalJobSeekers.toLocaleString(), change: '+12.4%', icon: Users, color: 'text-[#BFE8FF]', bg: 'bg-[#BFE8FF]/10 border-[rgba(190,225,255,0.12)]' },
        { name: 'Verified Recruiters', value: res.verifiedRecruiters.toLocaleString(), change: '+8.1%', icon: Building2, color: 'text-[#7DD3FC]', bg: 'bg-[#7DD3FC]/10 border-[rgba(190,225,255,0.12)]' },
        { name: 'Active Job Listings', value: res.activeJobListings.toLocaleString(), change: '+15.3%', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { name: 'Platform Applications', value: res.platformApplications.toLocaleString(), change: '+24.6%', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
      ]);
    } catch (err: any) {
      console.error(err);
      setError('Failed to retrieve system operations telemetry.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAdminStats();
  }, [loadAdminStats]);

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-[#66788A] animate-pulse">Loading system telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl bg-destructive/5 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg">Telemetry offline</h3>
        <p className="text-xs text-[#66788A] max-w-sm mb-4">{error}</p>
        <Button onClick={() => loadAdminStats()} className="rounded-xl font-bold">Reconnect</Button>
      </div>
    );
  }

  const pendingApprovals = [
    { id: 'rec_1', name: 'Apex AI Systems', contact: 'recruiter@apexai.io', type: 'Enterprise Recruiter', submitted: '2 hours ago', status: 'PENDING' },
    { id: 'rec_2', name: 'Starlight Labs', contact: 'talent@starlightlabs.com', type: 'Agency Partner', submitted: '5 hours ago', status: 'PENDING' },
    { id: 'rec_3', name: 'Quantum Health', contact: 'hr@quantumhealth.org', type: 'Corporate Employer', submitted: '1 day ago', status: 'FLAGGED' },
  ];

  const liveStreamLogs = [
    { id: 1, timestamp: '18:14:02', event: 'RECRUITER_VERIFIED', details: 'sarah.jenkins@techcorp.com', status: 'APPROVED', statusBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 2, timestamp: '18:09:45', event: 'ATS_MODEL_RETRAINED', details: 'Core ML Engine v2.4 initialized', status: 'SYSTEM', statusBg: 'bg-[#BFE8FF]/10 text-[#BFE8FF] border-[rgba(190,225,255,0.12)]' },
    { id: 3, timestamp: '17:45:12', event: 'AUTH_BURST_BLOCKED', details: 'IP 192.168.1.102 (5 failed attempts)', status: 'BLOCKED', statusBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { id: 4, timestamp: '17:30:00', event: 'CRON_MAINTENANCE', details: 'Database indexing task complete', status: 'SUCCESS', statusBg: 'bg-[#7DD3FC]/10 text-[#7DD3FC] border-[rgba(190,225,255,0.12)]' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header — Command Center Density */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#BFE8FF]/10 text-[#BFE8FF] border border-[rgba(190,225,255,0.12)]">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">System Command Center</h1>
            <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Ops
            </span>
          </div>
          <p className="text-[#66788A] text-xs mt-1">
            Real-time platform governance, automated candidate matching, and security stream.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs font-bold border-white/10">
              <Users className="w-3.5 h-3.5" /> Users
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button size="sm" className="rounded-xl gap-1.5 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md">
              <Settings className="w-3.5 h-3.5" /> Config
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Tighter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl glass-1 border border-border flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={cn("p-2.5 rounded-xl border", stat.bg, stat.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                <p className="text-[11px] font-semibold text-[#66788A] mt-0.5">{stat.name}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Command Split: Verification Queue & Live Stream Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recruiter Verification Queue */}
        <div className="lg:col-span-6 p-5 rounded-2xl glass-1 border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#7DD3FC] dark:text-[#7DD3FC]" />
              <h3 className="font-bold text-sm">Recruiter Verification Queue</h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full">
              {pendingApprovals.length} Action Required
            </span>
          </div>

          <div className="space-y-2.5">
            {pendingApprovals.map((req) => (
              <div key={req.id} className="p-3.5 rounded-xl glass-1 border border-border flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs">{req.name}</h4>
                    <span className={cn(
                      "text-[9px] font-extrabold px-1.5 py-0.5 rounded border",
                      req.status === 'FLAGGED' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-primary/10 text-primary border border-primary/20"
                    )}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66788A]">{req.contact} • {req.type}</p>
                  <span className="text-[10px] text-[#66788A]/70">Submitted {req.submitted}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-500/10">
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Live Stream */}
        <div className="lg:col-span-6 p-5 rounded-2xl glass-1 border border-border space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-border pb-3 font-sans">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-[#F5FAFF]">Live Security & System Feed</h3>
            </div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              STREAM ACTIVE
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {liveStreamLogs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg glass-1 border border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-[#66788A] text-[10px] font-mono shrink-0">{log.timestamp}</span>
                  <div className="truncate">
                    <p className="font-bold text-[#F5FAFF] text-[11px] truncate">{log.event}</p>
                    <p className="text-[10px] text-[#66788A] font-sans truncate">{log.details}</p>
                  </div>
                </div>
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded border shrink-0", log.statusBg)}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
