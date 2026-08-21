'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Users, MapPin, DollarSign, Clock, Trash2, PauseCircle, PlayCircle, Loader2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@swipex/api';

interface RecruiterJob {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  applicantsCount: number;
  status: 'Active' | 'Paused' | 'Closed';
  postedDate: string;
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [salaryMin, setSalaryMin] = useState('140000');
  const [salaryMax, setSalaryMax] = useState('180000');
  const [skills, setSkills] = useState('React, TypeScript');
  const [isCreating, setIsCreating] = useState(false);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const feed = await jobsApi.getJobFeed(1, 50);
      const mapped: RecruiterJob[] = (feed || []).map((j: any) => ({
        id: String(j.id),
        title: j.title || 'Untitled Role',
        department: 'Engineering',
        location: j.location || 'Remote',
        salary: j.salary || '$140,000 - $180,000',
        applicantsCount: j.applicationsCount || 0,
        status: j.isActive !== false ? 'Active' : 'Paused',
        postedDate: j.postedAt ? new Date(j.postedAt).toLocaleDateString() : 'Recent',
      }));
      setJobs(mapped);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to fetch job postings from database.');
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
    setIsCreating(true);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      await jobsApi.createJob({
        title: title.trim(),
        location: location.trim() || 'Remote',
        salaryMin: parseInt(salaryMin, 10) || 120000,
        salaryMax: parseInt(salaryMax, 10) || 180000,
        description: `Position for ${title.trim()} in ${department}`,
        skillsRequired: skillsArray.length > 0 ? skillsArray : ['React', 'TypeScript'],
        requirements: `Proficiency with ${skillsArray.join(', ')}`,
      });
      setTitle('');
      setIsAddModalOpen(false);
      await loadJobs();
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to create new job posting.');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleStatus = (id: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, status: j.status === 'Active' ? 'Paused' : 'Active' } : j
      )
    );
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading active postings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl glass-1 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg text-foreground">Connection Failure</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">{error}</p>
        <Button onClick={() => loadJobs()} className="rounded-xl font-bold">Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground">
            <Building2 className="w-7 h-7 text-primary" />
            Manage Job Postings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Create, monitor, and manage open positions across your organization.</p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} variant="primary" className="rounded-xl shadow-md font-bold">
          <Plus className="w-4 h-4 mr-2" /> Post New Position
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-3xl glass-1 border-border p-8 space-y-4">
          <Building2 className="w-12 h-12 text-primary mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-foreground">No active job listings</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Create your first job requisition to start matching with top talent on SwipeX.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} variant="primary" className="rounded-xl font-bold text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Post Job
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="glass-1 border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{job.department}</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      job.status === 'Active'
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-warning/10 text-warning border-warning/20'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-foreground">{job.title}</h3>
                <div className="space-y-1.5 mt-3 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {job.location}
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <DollarSign className="w-3.5 h-3.5 text-success" /> {job.salary}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Posted {job.postedDate}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <Users className="w-3.5 h-3.5" /> {job.applicantsCount} Applicants
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(job.id)}
                    title={job.status === 'Active' ? 'Pause Requisition' : 'Activate Requisition'}
                    className="p-2 rounded-lg glass-2 border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {job.status === 'Active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4 text-success" />}
                  </button>
                  <button
                    onClick={() => deleteJob(job.id)}
                    title="Remove Job"
                    className="p-2 rounded-lg glass-2 border border-border text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !isCreating && setIsAddModalOpen(false)}>
          <form onSubmit={handleAddJob} className="glass-3 border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-foreground">Post New Position</h3>
              <button type="button" disabled={isCreating} onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-secondary cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Job Title *</label>
                <input required type="text" placeholder="e.g. Senior Frontend Engineer" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Department</label>
                  <input type="text" placeholder="Engineering / Design" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Location</label>
                  <input type="text" placeholder="Remote / SF" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Min Salary ($)</label>
                  <input type="number" placeholder="140000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-foreground">Max Salary ($)</label>
                  <input type="number" placeholder="180000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Required Skills</label>
                <input type="text" placeholder="React, TypeScript, GraphQL" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm" />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" disabled={isCreating} className="flex-1 rounded-xl" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isCreating} className="flex-1 rounded-xl font-bold">
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isCreating ? 'Publishing...' : 'Publish Position'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
