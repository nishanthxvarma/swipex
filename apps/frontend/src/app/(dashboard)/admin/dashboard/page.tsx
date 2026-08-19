'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Building2, Shield, Activity, TrendingUp, AlertTriangle, 
  CheckCircle2, XCircle, Search, Filter, RefreshCw, Sparkles, 
  ArrowUpRight, BarChart3, UserCheck, Briefcase, Lock, Settings, Clock, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const stats = [
    { name: 'Total Job Seekers', value: '24,580', change: '+12.4%', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { name: 'Verified Recruiters', value: '1,420', change: '+8.1%', icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { name: 'Active Job Listings', value: '5,890', change: '+15.3%', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Platform Applications', value: '184,200', change: '+24.6%', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  ];

  const pendingApprovals = [
    { id: 'rec_1', name: 'Apex AI Systems', contact: 'recruiter@apexai.io', type: 'Enterprise Recruiter', submitted: '2 hours ago', status: 'PENDING' },
    { id: 'rec_2', name: 'Starlight Labs', contact: 'talent@starlightlabs.com', type: 'Agency Partner', submitted: '5 hours ago', status: 'PENDING' },
    { id: 'rec_3', name: 'Quantum Health', contact: 'hr@quantumhealth.org', type: 'Corporate Employer', submitted: '1 day ago', status: 'FLAGGED' },
  ];

  const liveStreamLogs = [
    { id: 1, timestamp: '18:14:02', event: 'RECRUITER_VERIFIED', details: 'sarah.jenkins@techcorp.com', status: 'APPROVED', statusBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 2, timestamp: '18:09:45', event: 'ATS_MODEL_RETRAINED', details: 'Core ML Engine v2.4 initialized', status: 'SYSTEM', statusBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { id: 3, timestamp: '17:45:12', event: 'AUTH_BURST_BLOCKED', details: 'IP 192.168.1.102 (5 failed attempts)', status: 'BLOCKED', statusBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { id: 4, timestamp: '17:30:00', event: 'CRON_MAINTENANCE', details: 'Database indexing task complete', status: 'SUCCESS', statusBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header — Command Center Density */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">System Command Center</h1>
            <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Ops
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
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
              className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={cn("p-2.5 rounded-xl border", stat.bg, stat.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{stat.name}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Command Split: Verification Queue & Live Stream Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recruiter Verification Queue */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-sm">Recruiter Verification Queue</h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
              {pendingApprovals.length} Action Required
            </span>
          </div>

          <div className="space-y-2.5">
            {pendingApprovals.map((req) => (
              <div key={req.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs">{req.name}</h4>
                    <span className={cn(
                      "text-[9px] font-extrabold px-1.5 py-0.5 rounded border",
                      req.status === 'FLAGGED' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-sky-500/10 text-sky-400 border-sky-400/20"
                    )}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{req.contact} • {req.type}</p>
                  <span className="text-[10px] text-muted-foreground/70">Submitted {req.submitted}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs font-bold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg text-rose-400 hover:bg-rose-500/10">
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Live Stream */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 font-sans">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-sm text-foreground">Live Security & System Feed</h3>
            </div>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-400/20">
              STREAM ACTIVE
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {liveStreamLogs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-muted-foreground text-[10px] font-mono shrink-0">{log.timestamp}</span>
                  <div className="truncate">
                    <p className="font-bold text-slate-200 text-[11px] truncate">{log.event}</p>
                    <p className="text-[10px] text-muted-foreground font-sans truncate">{log.details}</p>
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
