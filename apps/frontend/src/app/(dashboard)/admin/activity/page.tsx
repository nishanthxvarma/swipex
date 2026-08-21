'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Shield, Filter, Search, Terminal, AlertTriangle, CheckCircle2, FileText, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usersApi } from '@swipex/api';

interface AuditLogEntry {
  id: string;
  type: string;
  action: string;
  message: string;
  timestamp: string;
  severity: 'HIGH' | 'INFO' | 'LOW';
  metadata: Record<string, any>;
}

export default function AdminActivityPage() {
  const [filter, setFilter] = useState('ALL');
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAdminActivity(filter);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
      setError('Failed to fetch real-time system audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Real-Time Activity & Audit Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor real-time system events, authentication attempts, recruiter verifications, and user actions.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchLogs} className="gap-2 rounded-xl text-xs font-bold">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Feed
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-card p-3 rounded-2xl border">
        {['ALL', 'RECRUITER', 'USER', 'AUTH', 'APPLICATION', 'SYSTEM'].map((type) => (
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
        <div className="flex items-center justify-between border-b pb-3 text-muted-foreground font-sans font-bold">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            System Event Output Log Stream
          </div>
          {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-sans font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {logs.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-muted-foreground font-sans text-xs">
              No audit logs recorded for this category yet.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-muted/40 border flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-sans font-bold">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      log.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-600' :
                      log.severity === 'INFO' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-muted-foreground text-[10px]">{log.timestamp}</span>
                  </div>
                  <p className="text-foreground text-xs">{log.message}</p>
                </div>

                <div className="text-[10px] text-muted-foreground whitespace-nowrap font-sans font-semibold">
                  STATUS: 200 OK
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
