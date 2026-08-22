'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Users,
  MapPin,
  DollarSign,
  Clock,
  Trash2,
  PauseCircle,
  PlayCircle,
  Loader2,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@swipex/api';
import { cn } from '@/lib/utils';

import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/hooks/queries';
import { useAuthStore } from '@/stores/auth-store';

interface RecruiterJob {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  applicantsCount: number;
  status: 'Active' | 'Paused' | 'Closed';
  postedDate: string;
  skills: string[];
}

export default function RecruiterJobsPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState(
    (user as any)?.company || (user?.headline?.includes('at ') ? user.headline.split('at ')[1]?.trim() : '') || ''
  );
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  const handleOpenAddModal = () => {
    if (!companyName && ((user as any)?.company || user?.headline?.includes('at '))) {
      setCompanyName((user as any)?.company || user?.headline?.split('at ')[1]?.trim() || '');
    }
    setIsAddModalOpen(true);
  };

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await jobsApi.getRecruiterJobs(1, 50);
      const mapped: RecruiterJob[] = (list || []).map((j: any) => ({
        id: String(j.id),
        title: j.title || 'Untitled Role',
        department: j.department || 'Engineering',
        location: j.location || 'Remote',
        salary: j.salary || '$140,000 - $180,000',
        applicantsCount: j.applicationsCount || 0,
        status: j.isActive !== false ? 'Active' : 'Paused',
        postedDate: j.postedAt ? new Date(j.postedAt).toLocaleDateString() : 'Recent',
        skills: j.skills || j.skillsRequired || ['React', 'TypeScript'],
      }));
      setJobs(mapped);
    } catch (err: unknown) {
      console.error('Failed to load recruiter jobs:', err);
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
    if (!title.trim() || !companyName.trim() || !description.trim()) {
      setActionError('Please fill in all required fields (Job Title, Company Name, Role Description).');
      return;
    }

    const minVal = salaryMin.trim() ? parseInt(salaryMin, 10) : undefined;
    const maxVal = salaryMax.trim() ? parseInt(salaryMax, 10) : undefined;

    if (minVal !== undefined && isNaN(minVal)) {
      setActionError('Minimum salary must be a valid number.');
      return;
    }
    if (maxVal !== undefined && isNaN(maxVal)) {
      setActionError('Maximum salary must be a valid number.');
      return;
    }
    if (minVal !== undefined && minVal < 0) {
      setActionError('Minimum salary cannot be negative.');
      return;
    }
    if (maxVal !== undefined && maxVal < 0) {
      setActionError('Maximum salary cannot be negative.');
      return;
    }
    if (minVal !== undefined && maxVal !== undefined && minVal > maxVal) {
      setActionError('Minimum salary cannot exceed maximum salary.');
      return;
    }

    setIsCreating(true);
    setActionError(null);
    try {
      const rawSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const skillsArray = Array.from(new Set(rawSkills));

      await jobsApi.createJob({
        title: title.trim(),
        company: companyName.trim(),
        companyName: companyName.trim(),
        department: department.trim() || 'Engineering',
        location: location.trim() || 'Remote',
        salaryMin: minVal,
        salaryMax: maxVal,
        description: description.trim(),
        skillsRequired: skillsArray.length > 0 ? skillsArray : ['General'],
        requirements: skillsArray.length > 0 ? `Proficiency with ${skillsArray.join(', ')}` : '',
      });
      setCreatedSuccess(true);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobFeed() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard(user?.id, 'recruiter') });
      setTimeout(async () => {
        setCreatedSuccess(false);
        setTitle('');
        setDepartment('');
        setLocation('');
        setSalaryMin('');
        setSalaryMax('');
        setSkills('');
        setDescription('');
        setIsAddModalOpen(false);
        await loadJobs();
      }, 1000);
    } catch (err: any) {
      console.error('Job creation error:', err);
      const detail = err?.response?.data?.detail || err?.message;
      if (err?.response?.status === 401) {
        setActionError('Your session has expired. Please log in again.');
      } else if (err?.response?.status === 403) {
        setActionError('You do not have permission to create job postings.');
      } else if (err?.response?.status === 422) {
        setActionError(typeof detail === 'string' ? `Invalid details: ${detail}` : 'Some job posting details are invalid. Please review the form.');
      } else if (typeof detail === 'string' && !detail.includes('Internal server error') && !detail.includes('SQL')) {
        setActionError(`Failed to create job: ${detail}`);
      } else {
        setActionError('Failed to create new job posting. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: 'Active' | 'Paused' | 'Closed') => {
    const newIsActive = currentStatus !== 'Active';
    // Optimistic UI
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: newIsActive ? 'Active' : 'Paused' } : j))
    );
    try {
      await jobsApi.updateJobStatus(id, newIsActive);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobFeed() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard(user?.id, 'recruiter') });
    } catch (err) {
      console.error('Failed to persist status change:', err);
      setActionError('Failed to update job status on server.');
      await loadJobs();
    }
  };

  const deleteJob = async (id: string) => {
    // Optimistic UI
    setJobs((prev) => prev.filter((j) => j.id !== id));
    try {
      await jobsApi.deleteJob(id);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobFeed() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard(user?.id, 'recruiter') });
    } catch (err) {
      console.error('Failed to delete job from server:', err);
      setActionError('Failed to delete job posting.');
      await loadJobs();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading active postings from database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground">
            <Building2 className="w-7 h-7 text-primary" />
            Manage Job Postings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, monitor, and manage open positions across your organization.
          </p>
        </div>

        <Button onClick={handleOpenAddModal} variant="primary" className="rounded-xl shadow-md font-bold">
          <Plus className="w-4 h-4 mr-2" /> Post New Position
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
          <Button size="sm" variant="outline" onClick={() => loadJobs()}>
            Retry
          </Button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-destructive font-bold">✕</button>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-3xl glass-1 border-border p-8 space-y-4">
          <Building2 className="w-12 h-12 text-primary mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-foreground">No active job listings</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Create your first job requisition to start matching with candidates in real-time.
          </p>
          <Button onClick={handleOpenAddModal} variant="primary" className="rounded-xl font-bold text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Post Job
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="glass-1 border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{job.department}</p>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0',
                      job.status === 'Active'
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-muted/40 text-muted-foreground border-border'
                    )}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-primary" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold text-foreground">{job.applicantsCount} Applicants</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {job.skills.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-medium glass-2 border border-border text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {job.postedDate}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(job.id, job.status)}
                    title={job.status === 'Active' ? 'Pause Requisition' : 'Resume Requisition'}
                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {job.status === 'Active' ? (
                      <PauseCircle className="w-4 h-4 text-warning" />
                    ) : (
                      <PlayCircle className="w-4 h-4 text-success" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteJob(job.id)}
                    title="Delete Requisition"
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Job Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-3 border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Post New Position</h3>
                  <p className="text-xs text-muted-foreground">Requisition will be saved and published immediately</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                <h4 className="font-bold text-base text-foreground">Position Created Successfully!</h4>
                <p className="text-xs text-muted-foreground">Updating live requisitions list...</p>
              </div>
            ) : (
              <form onSubmit={handleAddJob} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SwipeX Technologies"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, India or Remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Min Salary ($)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 120000"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Max Salary ($)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 160000"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Skills Required
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, TypeScript, Node.js"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Role Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the role, responsibilities, requirements, and qualifications..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-1 border border-border focus:border-primary focus:outline-hidden text-sm text-foreground resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 rounded-xl font-bold"
                    disabled={isCreating || !title.trim() || !companyName.trim() || !description.trim()}
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Create Position
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
