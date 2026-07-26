"use client";

import React, { useState } from "react";
import { Bookmark, Search, MapPin, DollarSign, Calendar, ChevronDown, ExternalLink } from "lucide-react";

const SAVED_JOBS = [
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
  const [search, setSearch] = useState("");

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-primary" />
            Saved Jobs
          </h1>
          <p className="text-muted-foreground mt-1">You have {SAVED_JOBS.length} jobs saved for later.</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search saved jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary rounded-lg border-none outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="px-4 py-2 bg-secondary rounded-lg flex items-center gap-2 hover:bg-secondary/80 transition-colors">
            Sort <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAVED_JOBS.map(job => (
          <div key={job.id} className="bg-card border rounded-2xl p-5 hover:shadow-lg transition-shadow group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ backgroundColor: job.color }}
                >
                  {job.initials}
                </div>
                <div>
                  <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{job.title}</h3>
                  <div className="text-sm text-muted-foreground">{job.company}</div>
                </div>
              </div>
              <div className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md">
                {job.match}%
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" /> {job.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" /> {job.salary}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" /> Saved {job.savedDate}
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t flex gap-2">
              <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Apply Now
              </button>
              <button className="px-3 py-2 bg-secondary text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Remove">
                <Bookmark className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
