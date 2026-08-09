'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Building2, Shield, Activity, TrendingUp, AlertTriangle, 
  CheckCircle2, XCircle, Search, Filter, RefreshCw, Sparkles, 
  ArrowUpRight, BarChart3, UserCheck, Briefcase, Lock, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('7d');

  const stats = [
    { name: 'Total Job Seekers', value: '24,580', change: '+12.4%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Verified Recruiters', value: '1,420', change: '+8.1%', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'Active Job Listings', value: '5,890', change: '+15.3%', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Platform Applications', value: '184,200', change: '+24.6%', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const pendingApprovals = [
    { id: 'rec_1', name: 'Apex AI Systems', contact: 'recruiter@apexai.io', type: 'Enterprise Recruiter', submitted: '2 hours ago' },
    { id: 'rec_2', name: 'Starlight Labs', contact: 'talent@starlightlabs.com', type: 'Agency Partner', submitted: '5 hours ago' },
    { id: 'rec_3', name: 'Quantum Health', contact: 'hr@quantumhealth.org', type: 'Corporate Employer', submitted: '1 day ago' },
  ];

  const recentLogs = [
    { id: 1, event: 'New Recruiter Registration', user: 'sarah.jenkins@techcorp.com', time: '10 mins ago', status: 'Approved' },
    { id: 2, event: 'ATS Algorithm Model Retrained', user: 'System Task', time: '45 mins ago', status: 'Success' },
    { id: 3, event: 'Security Alert: Failed Login Burst', user: 'ip_192.168.1.102', time: '2 hours ago', status: 'Blocked' },
    { id: 4, event: 'System Maintenance Window Scheduled', user: 'admin@swipex.io', time: '4 hours ago', status: 'Completed' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Super Admin Control Hub</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Platform governance, user & recruiter verifications, system metrics, and security oversight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/users">
            <Button variant="outline" className="rounded-xl gap-2 font-semibold">
              <Users className="w-4 h-4" /> Manage Users
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button className="rounded-xl gap-2 font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
              <Settings className="w-4 h-4" /> System Config
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-3xl bg-card border shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
                <p className="text-xs font-medium text-muted-foreground mt-1">{stat.name}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/users">
          <div className="p-6 rounded-3xl bg-card border hover:border-primary/50 transition-all cursor-pointer group space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-lg">User Directory</h3>
              <p className="text-xs text-muted-foreground mt-1">Manage Job Seekers, view candidate profiles, suspend or activate accounts.</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/recruiters">
          <div className="p-6 rounded-3xl bg-card border hover:border-primary/50 transition-all cursor-pointer group space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Recruiter Verification</h3>
              <p className="text-xs text-muted-foreground mt-1">Review employer credentials, set posting limits, and approve recruiter profiles.</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/analytics">
          <div className="p-6 rounded-3xl bg-card border hover:border-primary/50 transition-all cursor-pointer group space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Platform Analytics</h3>
              <p className="text-xs text-muted-foreground mt-1">Monitor match conversion rates, total swipe velocity, and revenue metrics.</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Pending Approvals & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruiter Verification Queue */}
        <div className="p-6 rounded-3xl bg-card border space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-lg">Pending Recruiter Approvals</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full">
              {pendingApprovals.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((req) => (
              <div key={req.id} className="p-4 rounded-2xl bg-muted/40 border flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">{req.name}</h4>
                  <p className="text-xs text-muted-foreground">{req.contact} • {req.type}</p>
                  <span className="text-[10px] text-muted-foreground">Submitted {req.submitted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="rounded-xl text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-xl text-xs text-rose-500 hover:bg-rose-500/10">
                    <XCircle className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Logs */}
        <div className="p-6 rounded-3xl bg-card border space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-lg">Real-Time Platform Logs</h3>
            </div>
            <Link href="/admin/activity" className="text-xs font-semibold text-primary hover:underline">
              View All Logs
            </Link>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-muted/30 border flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">{log.event}</p>
                  <p className="text-[11px] text-muted-foreground">{log.user} • {log.time}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary border">
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
