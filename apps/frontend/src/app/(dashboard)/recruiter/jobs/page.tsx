'use client';

import React, { useState } from 'react';
import { Building2, Plus, Users, MapPin, DollarSign, Clock, MoreHorizontal, Edit, Trash2, CheckCircle2, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@swipex/api';
import { Loader2, AlertTriangle } from 'lucide-react';

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

const INITIAL_JOBS: RecruiterJob[] = [
  {
    id: 'rj1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (US/EU)',
    salary: '$140,000 - $180,000',
    applicantsCount: 42,
    status: 'Active',
    postedDate: 'Oct 12, 2023',
  },
  {
    id: 'rj2',
    title: 'Full Stack Developer',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$150,000 - $200,000',
    applicantsCount: 28,
    status: 'Active',
    postedDate: 'Oct 18, 2023',
  },
  {
    id: 'rj3',
    title: 'Lead Product Designer',
    department: 'Design',
    location: 'Remote',
    salary: '$130,000 - $170,000',
    applicantsCount: 19,
    status: 'Paused',
    postedDate: 'Sep 28, 2023',
  },
];

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const feed = await jobsApi.getJobFeed(1, 20);
      const mapped = feed.map((j: any) => ({
        id: j.id,
        title: j.title,
        department: 'Engineering',
        location: j.location,
        salary: j.salary,
        applicantsCount: j.applicationsCount || 0,
        status: j.isActive ? 'Active' : 'Paused',
        postedDate: j.postedAt ? new Date(j.postedAt).toLocaleDateString('en-US') : 'Recent',
      }));
      setJobs(mapped);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch job postings from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [salary, setSalary] = useState('$140,000 - $180,000');

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsLoading(true);
    try {
      await jobsApi.createJob({
        title,
        location,
        salaryMin: 120000,
        salaryMax: 180000,
        requirements: 'Requirements here...',
      });
      setTitle('');
      setIsAddModalOpen(false);
      await loadJobs();
    } catch (err: any) {
      console.error(err);
      setError('Failed to create new job posting.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground animate-pulse">Loading active postings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl bg-destructive/5 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg">Connection Failure</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">{error}</p>
        <Button onClick={() => loadJobs()} className="rounded-xl font-bold">Retry</Button>
      </div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
            <Building2 className="w-8 h-8 text-primary" />
            Manage Job Postings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Create, monitor, and manage open positions across your organization.</p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl shadow-md font-bold">
          <Plus className="w-4 h-4 mr-2" /> Post New Position
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-card border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{job.department}</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    job.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <h3 className="font-bold text-xl">{job.title}</h3>
              <div className="space-y-1.5 mt-3 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {job.location}
                </div>
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {job.salary}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Posted {job.postedDate}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                <Users className="w-3.5 h-3.5" /> {job.applicantsCount} Applicants
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(job.id)}
                  className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  title={job.status === 'Active' ? 'Pause Listing' : 'Activate Listing'}
                >
                  <PauseCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteJob(job.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete Posting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Job Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleAddJob} className="bg-card border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg border-b pb-3">Create Job Posting</h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold block mb-1">Job Title</label>
                <input required type="text" placeholder="e.g. Senior Backend Engineer" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background font-medium">
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Location</label>
                <input type="text" placeholder="Remote / SF / NYC" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Target Compensation</label>
                <input type="text" placeholder="$140,000 - $180,000" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background" />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 rounded-xl font-bold">Publish Position</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
