'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Shield, Filter, Search, Terminal, AlertTriangle, CheckCircle2, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminActivityPage() {
  const [filter, setFilter] = useState('ALL');

  const logs = [
    { id: 1, type: 'SECURITY', message: 'Failed password attempt threshold reached for user@domain.com', timestamp: '2026-08-10 03:12:04', severity: 'HIGH' },
    { id: 2, type: 'RESUME_AI', message: 'ATS Engine scored resume ID #res_88194 with 92% match score', timestamp: '2026-08-10 03:10:40', severity: 'INFO' },
    { id: 3, type: 'AUTH', message: 'Admin user alex@swipex.io signed into Super Admin Portal', timestamp: '2026-08-10 03:05:12', severity: 'INFO' },
    { id: 4, type: 'APPLICATION', message: 'Job Seeker applied to Senior React Engineer position at Vercel', timestamp: '2026-08-10 02:58:33', severity: 'INFO' },
    { id: 5, type: 'SYSTEM', message: 'PostgreSQL database automated vacuum finished in 1.2s', timestamp: '2026-08-10 02:30:00', severity: 'LOW' },
  ];

  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.type === filter);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Real-Time Activity & Audit Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor real-time system events, authentication attempts, and AI engine queries.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-card p-3 rounded-2xl border">
        {['ALL', 'SECURITY', 'RESUME_AI', 'AUTH', 'APPLICATION', 'SYSTEM'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === type ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-3xl p-6 font-mono text-xs space-y-3 shadow-xs">
        <div className="flex items-center gap-2 border-b pb-3 text-muted-foreground font-sans font-bold">
          <Terminal className="w-4 h-4 text-primary" />
          System Event Output Log Stream
        </div>

        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-muted/40 border flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-sans font-bold">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    log.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-600' : 'bg-blue-500/10 text-blue-600'
                  }`}>
                    [{log.type}]
                  </span>
                  <span className="text-foreground">{log.message}</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">{log.timestamp}</p>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-sans ${
                log.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-600' : 'bg-secondary text-muted-foreground'
              }`}>
                {log.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
