'use client';

import React, { useState } from 'react';
import { Briefcase, Plus, LayoutGrid, List, X, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@swipex/api';
import Link from 'next/link';
import { useUserApplications, QUERY_KEYS } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';

const COLUMNS = [
  { id: 'applied', title: 'Applied', color: 'bg-primary', badgeColor: 'bg-primary/10 text-primary border border-primary/20' },
  { id: 'reviewing', title: 'Reviewing', color: 'bg-warning', badgeColor: 'bg-warning/10 text-warning border border-warning/20' },
  { id: 'interview', title: 'Interview', color: 'bg-accent', badgeColor: 'bg-accent/10 text-accent border border-accent/20' },
  { id: 'offer', title: 'Offer', color: 'bg-success', badgeColor: 'bg-success/10 text-success border border-success/20' },
  { id: 'rejected', title: 'Rejected', color: 'bg-destructive', badgeColor: 'bg-destructive/10 text-destructive border border-destructive/20' },
];

interface Application {
  id: string;
  company: string;
  title: string;
  status: 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected';
  date: string;
  color?: string;
  initials?: string;
  location?: string;
  salary?: string;
  notes?: string;
}

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Application Form State
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newSalary, setNewSalary] = useState('$140,000 / yr');
  const [newStatus, setNewStatus] = useState<Application['status']>('applied');

  const { data: rawApps, isLoading, error, refetch } = useUserApplications(1);

  const applications: Application[] = (rawApps || []).map((item: any) => {
    const rawStatus = (item.status || 'applied').toLowerCase();
    const validStatus: Application['status'] = ['applied', 'reviewing', 'interview', 'offer', 'rejected'].includes(rawStatus)
      ? (rawStatus as Application['status'])
      : 'applied';
    const comp = item.job?.company || item.company || 'Company';
    return {
      id: String(item.id),
      company: comp,
      title: item.job?.title || item.title || 'Position',
      status: validStatus,
      date: item.appliedAt || item.applied_at ? new Date(item.appliedAt || item.applied_at).toLocaleDateString() : 'Recent',
      color: item.job?.color || '#1677A8',
      initials: comp.substring(0, 2).toUpperCase(),
      location: item.job?.location || item.location || 'Remote',
      salary: item.job?.salary || item.salary || '$120,000 - $160,000',
      notes: item.notes || '',
    };
  });

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newTitle.trim()) return;

    // Trigger optimistic update
    const newApp: Application = {
      id: 'app_' + Date.now(),
      company: newCompany.trim(),
      title: newTitle.trim(),
      status: newStatus,
      date: new Date().toLocaleDateString(),
      color: '#1677A8',
      initials: newCompany.trim().substring(0, 2).toUpperCase(),
      location: newLocation.trim(),
      salary: newSalary.trim(),
      notes: 'Added manually to tracker.',
    };

    queryClient.setQueryData(QUERY_KEYS.applications(1), (old: any) => [newApp, ...(old || [])]);

    setIsAddModalOpen(false);
    setNewCompany('');
    setNewTitle('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground">
            <Briefcase className="w-7 h-7 text-primary" />
            Application Tracker
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage, update, and track your job applications in real-time.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border border-border rounded-xl p-1 glass-1 shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                viewMode === 'kanban' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} variant="primary" className="rounded-xl shadow-sm font-bold">
            <Plus className="w-4 h-4 mr-1.5" /> Add Application
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Failed to synchronize live applications from database.
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {/* Main View: Kanban */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const columnApps = applications.filter((a) => a.status === col.id);

            return (
              <div key={col.id} className="glass-1 border border-border rounded-2xl p-4 flex flex-col min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', col.color)} />
                    <h3 className="font-bold text-sm text-foreground">{col.title}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full glass-2 border border-border text-foreground">
                    {columnApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-24 rounded-xl glass-2 border border-border animate-pulse" />
                      ))}
                    </div>
                  ) : columnApps.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border border-dashed border-border/40 rounded-xl text-[11px] text-muted-foreground/60 text-center p-3">
                      No applications
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className="glass-2 border border-border hover:border-primary/40 rounded-xl p-3.5 space-y-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {app.title}
                          </div>
                          <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0', col.badgeColor)}>
                            {app.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: app.color }}
                          >
                            {app.initials}
                          </div>
                          <span className="text-xs text-muted-foreground truncate">{app.company}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-1 border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-card/60 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="p-4">Role & Company</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Salary</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground animate-pulse">
                      Loading applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                      No active applications tracked yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="hover:bg-card/40 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="font-bold text-foreground">{app.title}</div>
                        <div className="text-xs text-muted-foreground">{app.company}</div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{app.location}</td>
                      <td className="p-4 text-xs font-semibold text-foreground">{app.salary}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            'text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                            COLUMNS.find((c) => c.id === app.status)?.badgeColor || 'bg-primary/10 text-primary'
                          )}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{app.date}</td>
                      <td className="p-4 text-right">
                        <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-primary">
                          Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Details & Add Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="glass-3 border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-foreground">{selectedApp.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedApp.company} • {selectedApp.location}
                </p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1 rounded-full hover:bg-secondary cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Status</span>
                <span className="font-bold uppercase text-primary">{selectedApp.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Salary</span>
                <span className="font-semibold text-foreground">{selectedApp.salary}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Applied On</span>
                <span className="font-semibold text-foreground">{selectedApp.date}</span>
              </div>
              {selectedApp.notes && (
                <div className="pt-2">
                  <span className="text-muted-foreground block mb-1">Notes</span>
                  <p className="p-2.5 rounded-xl glass-2 border border-border text-foreground leading-relaxed">
                    {selectedApp.notes}
                  </p>
                </div>
              )}
            </div>
            <Button onClick={() => setSelectedApp(null)} className="w-full rounded-xl font-bold">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsAddModalOpen(false)}
        >
          <form
            onSubmit={handleAddApplication}
            className="glass-3 border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-foreground">Add Custom Application</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-secondary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Company Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. OpenAI, Stripe, Linear"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Role Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Full Stack Engineer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-xs font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="applied">Applied</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1 rounded-xl font-bold">
                Save Application
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
