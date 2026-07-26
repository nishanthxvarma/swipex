"use client";

import React, { useState } from "react";
import { SlidersHorizontal, MapPin, DollarSign, Filter, RefreshCw } from "lucide-react";
import { SwipeStack } from "@/components/swipe/swipe-stack";
import { JobDetailModal } from "@/components/jobs/job-detail-modal";
import { Job } from "@/components/swipe/swipe-card";

// MOCK DATA
const MOCK_JOBS: Job[] = [
  {
    id: "j1",
    title: "Senior Frontend Engineer",
    company: "Vercel",
    companyInitials: "V",
    location: "Remote",
    type: "Full-time",
    salary: "$140K - $180K",
    postedTime: "2 hours ago",
    skills: ["React", "Next.js", "TypeScript", "TailwindCSS"],
    matchPercentage: 92,
    competition: "High",
    verified: true,
    color: "#000000",
    description: "Join Vercel to help build the future of the web. You will work on core features of our frontend platform, improving developer experience and performance globally.",
    requirements: ["5+ years React experience", "Deep Next.js knowledge", "Experience with Edge computing"]
  },
  {
    id: "j2",
    title: "Product Designer",
    company: "Linear",
    companyInitials: "L",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$130K - $170K",
    postedTime: "5 hours ago",
    skills: ["Figma", "Prototyping", "UI/UX", "CSS"],
    matchPercentage: 85,
    competition: "High",
    verified: true,
    color: "#5E6AD2",
    description: "Help us design the tool that software teams actually want to use. We are looking for a product designer who obsesses over details and interactions.",
  },
  {
    id: "j3",
    title: "Backend Engineer",
    company: "Stripe",
    companyInitials: "S",
    location: "New York, NY",
    type: "Full-time",
    salary: "$160K - $200K",
    postedTime: "1 day ago",
    skills: ["Go", "Ruby", "PostgreSQL", "Kafka"],
    matchPercentage: 78,
    competition: "High",
    verified: true,
    color: "#635BFF",
  },
  {
    id: "j4",
    title: "Full Stack Developer",
    company: "Notion",
    companyInitials: "N",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$150K - $190K",
    postedTime: "2 days ago",
    skills: ["React", "Node.js", "PostgreSQL", "Redis"],
    matchPercentage: 88,
    competition: "Medium",
    verified: true,
    color: "#000000",
  }
];

export default function JobFeedPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden">
      {/* Left Panel: Filters (Desktop) */}
      <div className="hidden lg:block w-72 border-r bg-background overflow-y-auto p-6 space-y-8">
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="City or Remote" className="w-full pl-9 pr-3 py-2 bg-secondary rounded-md text-sm border-none" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Salary Range</label>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" className="w-full px-3 py-2 bg-secondary rounded-md text-sm border-none" />
                <span>-</span>
                <input type="number" placeholder="Max" className="w-full px-3 py-2 bg-secondary rounded-md text-sm border-none" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Experience Level</label>
              <div className="flex flex-wrap gap-2">
                {["Entry", "Mid", "Senior", "Lead"].map(level => (
                  <button key={level} className="px-3 py-1.5 rounded-full text-xs bg-secondary hover:bg-secondary/80 transition-colors">
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Center: Swipe Stack */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-muted/20">
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-background to-transparent">
          <div className="lg:hidden">
            <button className="p-2 bg-background rounded-full shadow-sm" onClick={() => setIsMobileFiltersOpen(true)}>
              <Filter className="w-5 h-5" />
            </button>
          </div>
          <h2 className="font-bold text-xl hidden sm:block">Discover Jobs</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium bg-background px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              92% Avg Match
            </div>
            <button className="p-2 bg-background rounded-full shadow-sm hover:rotate-180 transition-transform duration-500">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <SwipeStack jobs={MOCK_JOBS} onShowDetails={setSelectedJob} />
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Filters</h3>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-secondary rounded-full">
              <Filter className="w-5 h-5" />
            </button>
          </div>
          {/* Filter content here for mobile */}
          <button onClick={() => setIsMobileFiltersOpen(false)} className="mt-auto py-3 bg-primary text-primary-foreground rounded-xl font-medium">
            Show Results
          </button>
        </div>
      )}

      {/* Details Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
