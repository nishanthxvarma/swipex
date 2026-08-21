'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, Plus, Users, MapPin, DollarSign, Clock, MoreHorizontal, 
  Trash2, CheckCircle2, PauseCircle, Loader2, AlertCircle, X, Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { jobsApi } from '@swipex/api';

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Remote');
  const [salary, setSalary] = useState('$140,000 - $180,000');
  const [skills, setSkills] = useState('React, TypeScript, Next.js');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const feed = await jobsApi.getJobFeed(1, 30);
      if (Array.isArray(feed)) {
        setJobs(feed);
      }
    } catch (err: any) {
      console.error('Fetch jobs error:', err);
      setError('Could not load company job postings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await jobsApi.createJob({
        title,
        location,
        salary,
        requirements: skills,
        description: `We are seeking a ${title} to join our engineering department.`,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setIsAddModalOpen(false);
      setTitle('');
      await loadJobs();
    } catch (err) {
      console.error('Job create error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Job Postings Management</h1>
          <p className="text-xs text-slate-400">Manage active role listings, requirements, and candidate applications.</p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          <span>Create New Job</span>
        </Button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="h-80 rounded-2xl bg-[#0C1119] border border-slate-800 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center bg-[#0C1119] rounded-2xl border border-slate-800 max-w-md mx-auto space-y-4 my-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No active job listings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create your first job listing to start receiving candidate applications and matches.
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="h-9 px-4 rounded-xl bg-primary text-xs font-bold">
            Post Role Now
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0C1119] border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Job Title</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Compensation</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-slate-100">{job.title}</td>
                    <td className="p-4 text-slate-300">{job.location || 'Remote'}</td>
                    <td className="p-4 font-mono text-emerald-400 font-medium">
                      {job.salary_min && job.salary_max
                        ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`
                        : job.salary || '$140,000 - $180,000'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-slate-100">
                        View Applicants
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0C1119] border border-slate-700/80 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Post New Role</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddJob} className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label className="text-slate-300">Job Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Distributed Systems Engineer"
                  required
                  className="bg-slate-900 border-slate-700 text-slate-100 text-xs h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote (US) or San Francisco, CA"
                  className="bg-slate-900 border-slate-700 text-slate-100 text-xs h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Salary Band</Label>
                <Input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $150,000 - $190,000"
                  className="bg-slate-900 border-slate-700 text-slate-100 text-xs h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Skills (comma-separated)</Label>
                <Input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, TypeScript, Next.js, Node.js"
                  className="bg-slate-900 border-slate-700 text-slate-100 text-xs h-9 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-9 rounded-xl text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Role'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
