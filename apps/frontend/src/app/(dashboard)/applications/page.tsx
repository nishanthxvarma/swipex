"use client";

import React from "react";
import { Briefcase, Clock, Calendar, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { id: "applied", title: "Applied", color: "bg-blue-500" },
  { id: "reviewing", title: "Reviewing", color: "bg-yellow-500" },
  { id: "interview", title: "Interview", color: "bg-purple-500" },
  { id: "offer", title: "Offer", color: "bg-green-500" },
  { id: "rejected", title: "Rejected", color: "bg-red-500" }
];

const APPLICATIONS = [
  {
    id: "a1",
    company: "Google",
    title: "Senior Software Engineer",
    status: "interview",
    date: "Oct 15, 2023",
    color: "#4285F4",
    initials: "G"
  },
  {
    id: "a2",
    company: "Netflix",
    title: "UI Engineer",
    status: "reviewing",
    date: "Oct 18, 2023",
    color: "#E50914",
    initials: "N"
  },
  {
    id: "a3",
    company: "Meta",
    title: "Frontend Developer",
    status: "applied",
    date: "Oct 20, 2023",
    color: "#0668E1",
    initials: "M"
  },
  {
    id: "a4",
    company: "Amazon",
    title: "SDE II",
    status: "rejected",
    date: "Sep 30, 2023",
    color: "#FF9900",
    initials: "A"
  }
];

export default function ApplicationsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" />
            Application Tracker
          </h1>
          <p className="text-muted-foreground mt-2">Manage and track your job search progress.</p>
        </div>
        
        <div className="hidden sm:flex gap-4">
          <div className="bg-secondary px-4 py-2 rounded-lg text-sm">
            <span className="text-muted-foreground">Total:</span> <span className="font-bold text-lg ml-1">12</span>
          </div>
          <div className="bg-secondary px-4 py-2 rounded-lg text-sm">
            <span className="text-muted-foreground">Response Rate:</span> <span className="font-bold text-lg ml-1 text-green-500">35%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {COLUMNS.map(col => (
            <div key={col.id} className="w-80 flex flex-col bg-muted/30 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", col.color)}></div>
                  <h3 className="font-semibold">{col.title}</h3>
                </div>
                <div className="text-xs font-medium bg-secondary px-2 py-1 rounded-md">
                  {APPLICATIONS.filter(a => a.status === col.id).length}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {APPLICATIONS.filter(a => a.status === col.id).map(app => (
                  <div key={app.id} className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0"
                        style={{ backgroundColor: app.color }}
                      >
                        {app.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm line-clamp-1">{app.title}</h4>
                        <div className="text-xs text-muted-foreground">{app.company}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {app.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
