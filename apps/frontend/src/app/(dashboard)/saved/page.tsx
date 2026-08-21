"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Search, MapPin, DollarSign, Calendar, ChevronDown, Trash2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { jobsApi } from '@swipex/api';
import { Loader2, AlertTriangle } from 'lucide-react';

interface SavedJobItem {
  id: string;
  title: string;
  company: string;
  initials: string;
  color: string;
  location: string;
  salary: string;
  savedDate: string;
  match: number;
}

const INITIAL_SAVED: SavedJobItem[] = [
  {
    id: "s1",
    title: "Senior React Developer",
    company: "Airbnb",
    initials: "A",
    color: "#FF5A5F",
    location: "Remote",
    salary: "$150K - $190K",
    savedDate: "2 days ago",
    match: 94
  },
  {
    id: "s2",
    title: "Machine Learning Engineer",
    company: "Spotify",
    initials: "S",
    color: "#1DB954",
    location: "New York, NY",
    salary: "$170K - $210K",
    savedDate: "3 days ago",
    match: 82
  },
  {
    id: "s3",
    title: "Frontend Architect",
    company: "Figma",
    initials: "F",
    color: "#F24E1E",
    location: "San Francisco, CA",
    salary: "$180K - $220K",
    savedDate: "1 week ago",
    match: 96
  }
];

export default function SavedJobsPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavedJobs = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await jobsApi.getSavedJobs(1);
      const mapped = list.map((s: any) => {
        const j = s.job;
        return {
          id: s.jobId,
          title: j?.title || "Position",
          company: j?.company || "SwipeX Partner",
          initials: j?.companyInitials || "S",
          color: j?.color || "#635BFF",
          location: j?.location || "Remote",
          salary: j?.salary || "$120K - $160K",
          savedDate: s.savedAt ? new Date(s.savedAt).toLocaleDateString("en-US") : "Recent",
          match: j?.matchPercentage || 85
        };
      });
      setSavedJobs(mapped);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load saved jobs from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);
  const [sortBy, setSortBy] = useState<"match" | "date">("match");
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    try {
      await jobsApi.unsaveJob(id);
      setSavedJobs(prev => prev.filter(j => j.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (id: string) => {
    setAppliedId(id);
    try {
      await jobsApi.createApplication(id, { coverLetter: "Applied from saved jobs." });
      await jobsApi.unsaveJob(id);
      router.push("/applications");
    } catch (err) {
      console.error(err);
      setAppliedId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground animate-pulse">Loading bookmarked listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl bg-destructive/5 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg">Connection Failure</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">{error}</p>
        <Button onClick={() => loadSavedJobs()} className="rounded-xl font-bold">Retry</Button>
      </div>
    );
  }

  const filteredJobs = savedJobs
    .filter(
      j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "match") return b.match - a.match;
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
            <Bookmark className="w-8 h-8 text-primary fill-primary/20" />
            Saved Jobs
          </h1>
          <p className="text-muted-foreground mt-1">You have {savedJobs.length} bookmarked opportunities saved for review.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search saved jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
            />
          </div>
          <button
            onClick={() => setSortBy(sortBy === "match" ? "date" : "match")}
            className="px-4 py-2 bg-card border rounded-xl flex items-center gap-2 hover:bg-secondary transition-colors text-xs font-bold"
          >
            Sort by: {sortBy === "match" ? "Highest Match" : "Date Saved"} <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-2xl p-8 space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-2xl">
            🔖
          </div>
          <h3 className="text-xl font-bold">No saved jobs found</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {search ? "No saved jobs match your search criteria." : "Start swiping right on job cards to bookmark roles you love!"}
          </p>
          <Button onClick={() => router.push("/jobs")} className="rounded-xl px-6 font-semibold">
            Discover Jobs <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-card border rounded-2xl p-5 hover:shadow-xl transition-all group flex flex-col h-full hover:border-primary/50 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: job.color }}
                  >
                    {job.initials}
                  </div>
                  <div>
                    <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="text-sm font-semibold text-muted-foreground">{job.company}</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  {job.match}% Match
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {job.location}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Calendar className="w-3.5 h-3.5" /> Saved {job.savedDate}
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t flex gap-2">
                <Button
                  onClick={() => handleApply(job.id)}
                  disabled={appliedId === job.id}
                  className="flex-1 rounded-xl font-semibold shadow-xs"
                >
                  {appliedId === job.id ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-300 animate-bounce" /> Applied!
                    </>
                  ) : (
                    "Apply Now"
                  )}
                </Button>
                <button
                  onClick={() => handleRemove(job.id)}
                  className="p-2.5 bg-secondary text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                  title="Remove from Saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
