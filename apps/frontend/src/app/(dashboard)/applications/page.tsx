'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Clock, Plus, LayoutGrid, List, X, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@swipex/api';
import Link from 'next/link';

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
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Application Form State
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newSalary, setNewSalary] = useState('$140,000 / yr');
  const [newStatus, setNewStatus] = useState<Application['status']>('applied');

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await jobsApi.getApplications(1);
      const mapped: Application[] = (list || []).map((item: any) => {
        const rawStatus = (item.status || 'applied').toLowerCase();
        const validStatus: Application['status'] = ['applied', 'reviewing', 'interview', 'offer', 'rejected'].includes(rawStatus)
          ? rawStatus
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
      setApplications(mapped);
    } catch (err: unknown) {
      console.error('Applications load error:', err);
      setError('Failed to fetch applications pipeline from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newTitle.trim()) return;

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

    setApplications([newApp, ...applications]);
    setNewCompany('');
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  const moveStatus = async (appId: string, nextStatus: Application['status']) => {
    try {
      await jobsApi.updateApplicationStatus(appId, nextStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: nextStatus } : a))
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const responseRate = applications.length > 0
    ? Math.round((applications.filter((a) => a.status !== 'applied').length / applications.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading tracker pipeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl glass-1 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg text-foreground">Connection Failure</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">{error}</p>
        <Button onClick={() => loadApplications()} className="rounded-xl font-bold">Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
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

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-1 border border-border rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Tracked</p>
          <p className="text-2xl font-bold text-foreground mt-1">{applications.length}</p>
        </div>
        <div className="glass-1 border border-border rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Interviews</p>
          <p className="text-2xl font-bold text-accent mt-1">{applications.filter((a) => a.status === 'interview').length}</p>
        </div>
        <div className="glass-1 border border-border rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Offers Received</p>
          <p className="text-2xl font-bold text-success mt-1">{applications.filter((a) => a.status === 'offer').length}</p>
        </div>
        <div className="glass-1 border border-border rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Response Rate</p>
          <p className="text-2xl font-bold text-primary mt-1">{responseRate}%</p>
        </div>
      </div>

      {/* Empty state if 0 applications */}
      {applications.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-3xl glass-1 border-border p-8 space-y-4">
          <Briefcase className="w-12 h-12 text-primary mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-foreground">No applications yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Start discovering and swiping on roles that match your skillset. Applied roles will automatically appear in this pipeline.
          </p>
          <Button asChild variant="primary" className="rounded-xl font-bold text-xs">
            <Link href="/jobs">
              Discover Jobs <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="flex gap-6 min-w-max">
            {COLUMNS.map((col) => {
              const colApps = applications.filter((a) => a.status === col.id);
              return (
                <div key={col.id} className="w-80 flex flex-col glass-1 border border-border rounded-2xl p-4 min-h-[500px]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2.5 h-2.5 rounded-full', col.color)} />
                      <h3 className="font-bold text-sm text-foreground">{col.title}</h3>
                    </div>
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', col.badgeColor)}>
                      {colApps.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {colApps.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-border/60 rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">No applications in this stage</p>
                      </div>
                    ) : (
                      colApps.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className="glass-2 border border-border rounded-xl p-4 shadow-xs hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                              style={{ backgroundColor: app.color || '#1677A8' }}
                            >
                              {app.initials || 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors">{app.title}</h4>
                              <p className="text-xs font-medium text-muted-foreground">{app.company}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/60">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> {app.date}</span>
                            <span className="font-semibold text-foreground">{app.salary}</span>
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
      ) : (
        /* Table View */
        <div className="border border-border rounded-2xl overflow-hidden glass-1 shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="glass-2 border-b border-border text-xs font-bold text-muted-foreground uppercase">
              <tr>
                <th className="p-4">Company & Position</th>
                <th className="p-4">Location</th>
                <th className="p-4">Salary</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.map((app) => {
                const col = COLUMNS.find((c) => c.id === app.status);
                return (
                  <tr key={app.id} className="hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setSelectedApp(app)}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: app.color || '#1677A8' }}
                        >
                          {app.initials || 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{app.title}</div>
                          <div className="text-xs text-muted-foreground font-medium">{app.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{app.location}</td>
                    <td className="p-4 font-semibold text-foreground">{app.salary}</td>
                    <td className="p-4 text-muted-foreground">{app.date}</td>
                    <td className="p-4">
                      <span className={cn('inline-block text-xs font-bold px-2.5 py-1 rounded-full capitalize', col?.badgeColor)}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}>
                        Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>
          <div className="glass-3 border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: selectedApp.color || '#1677A8' }}>
                  {selectedApp.initials}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{selectedApp.title}</h3>
                  <p className="text-sm font-semibold text-primary">{selectedApp.company}</p>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1.5 rounded-full hover:bg-secondary cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 glass-2 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-xs text-muted-foreground block">Location</span>
                  <span className="font-semibold text-foreground">{selectedApp.location}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Compensation</span>
                  <span className="font-semibold text-success">{selectedApp.salary}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-muted-foreground block mb-2 uppercase tracking-wider">Move Application Stage</span>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => moveStatus(selectedApp.id, col.id as any)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer',
                        selectedApp.status === col.id ? 'bg-primary text-primary-foreground border-primary shadow-xs' : 'glass-1 hover:bg-secondary text-muted-foreground'
                      )}
                    >
                      {col.title}
                    </button>
                  ))}
                </div>
              </div>

              {selectedApp.notes && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground">Notes & Activity</span>
                  <p className="p-3 glass-2 border border-border rounded-xl text-xs text-foreground font-medium">{selectedApp.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setSelectedApp(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Application Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleAddApplication} className="glass-3 border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-foreground">Add New Application</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-secondary cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Company Name *</label>
                <input required type="text" placeholder="e.g. OpenAI" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Job Title *</label>
                <input required type="text" placeholder="e.g. Machine Learning Engineer" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Location</label>
                  <input type="text" placeholder="Remote / SF" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Salary</label>
                  <input type="text" placeholder="$150,000 / yr" value={newSalary} onChange={(e) => setNewSalary(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Initial Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground font-medium text-sm">
                  {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1 rounded-xl font-bold">Save Application</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
