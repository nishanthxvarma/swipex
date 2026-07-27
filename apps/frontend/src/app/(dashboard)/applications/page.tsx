"use client";

import React, { useState } from "react";
import { Briefcase, Clock, Calendar, CheckCircle, XCircle, Plus, LayoutGrid, List, ChevronRight, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { id: "applied", title: "Applied", color: "bg-blue-500", badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { id: "reviewing", title: "Reviewing", color: "bg-amber-500", badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { id: "interview", title: "Interview", color: "bg-purple-500", badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { id: "offer", title: "Offer", color: "bg-emerald-500", badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { id: "rejected", title: "Rejected", color: "bg-rose-500", badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400" }
];

interface Application {
  id: string;
  company: string;
  title: string;
  status: "applied" | "reviewing" | "interview" | "offer" | "rejected";
  date: string;
  color: string;
  initials: string;
  location: string;
  salary: string;
  notes?: string;
}

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: "a1",
    company: "Google",
    title: "Senior Software Engineer",
    status: "interview",
    date: "Oct 15, 2023",
    color: "#4285F4",
    initials: "G",
    location: "Mountain View, CA",
    salary: "$180,000 / yr",
    notes: "Technical phone screen completed. System design round on Thursday."
  },
  {
    id: "a2",
    company: "Netflix",
    title: "UI Engineer",
    status: "reviewing",
    date: "Oct 18, 2023",
    color: "#E50914",
    initials: "N",
    location: "Los Gatos, CA",
    salary: "$195,000 / yr",
    notes: "Recruiter screen scheduled for next week."
  },
  {
    id: "a3",
    company: "Meta",
    title: "Frontend Developer",
    status: "applied",
    date: "Oct 20, 2023",
    color: "#0668E1",
    initials: "M",
    location: "Menlo Park, CA",
    salary: "$165,000 / yr",
    notes: "Applied via SwipeX one-tap apply."
  },
  {
    id: "a4",
    company: "Amazon",
    title: "SDE II",
    status: "rejected",
    date: "Sep 30, 2023",
    color: "#FF9900",
    initials: "A",
    location: "Seattle, WA",
    salary: "$155,000 / yr",
    notes: "Position closed."
  },
  {
    id: "a5",
    company: "Stripe",
    title: "Full Stack Engineer",
    status: "offer",
    date: "Oct 22, 2023",
    color: "#635BFF",
    initials: "S",
    location: "Remote",
    salary: "$190,000 / yr",
    notes: "Offer received! Base: $190k + $40k equity."
  }
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Application Form State
  const [newCompany, setNewCompany] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("Remote");
  const [newSalary, setNewSalary] = useState("$140,000 / yr");
  const [newStatus, setNewStatus] = useState<Application["status"]>("applied");

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newTitle) return;

    const colors = ["#4285F4", "#635BFF", "#000000", "#FF5A5F", "#10B981"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newApp: Application = {
      id: "app_" + Date.now(),
      company: newCompany,
      title: newTitle,
      status: newStatus,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      color: randomColor,
      initials: newCompany.substring(0, 1).toUpperCase(),
      location: newLocation,
      salary: newSalary,
      notes: "Added manually to tracker."
    };

    setApplications([newApp, ...applications]);
    setNewCompany("");
    setNewTitle("");
    setIsAddModalOpen(false);
  };

  const moveStatus = (appId: string, nextStatus: Application["status"]) => {
    setApplications(prev =>
      prev.map(a => (a.id === appId ? { ...a, status: nextStatus } : a))
    );
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp(prev => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  const responseRate = Math.round(
    (applications.filter(a => a.status !== "applied").length / (applications.length || 1)) * 100
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
            <Briefcase className="w-8 h-8 text-primary" />
            Application Tracker
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage, update, and track your job search progress in real-time.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border rounded-xl p-1 bg-card shadow-xs">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all", viewMode === "kanban" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all", viewMode === "table" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Add Application
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Total Tracked</p>
          <p className="text-2xl font-bold mt-1">{applications.length}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Active Interviews</p>
          <p className="text-2xl font-bold mt-1 text-purple-500">{applications.filter(a => a.status === "interview").length}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Offers Received</p>
          <p className="text-2xl font-bold mt-1 text-emerald-500">{applications.filter(a => a.status === "offer").length}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Response Rate</p>
          <p className="text-2xl font-bold mt-1 text-primary">{responseRate}%</p>
        </div>
      </div>

      {/* View Content */}
      {viewMode === "kanban" ? (
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="flex gap-6 min-w-max">
            {COLUMNS.map(col => {
              const colApps = applications.filter(a => a.status === col.id);
              return (
                <div key={col.id} className="w-80 flex flex-col bg-muted/40 border rounded-2xl p-4 min-h-[500px]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", col.color)} />
                      <h3 className="font-bold text-sm text-foreground">{col.title}</h3>
                    </div>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", col.badgeColor)}>
                      {colApps.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {colApps.length === 0 ? (
                      <div className="text-center py-12 border border-dashed rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">No applications in this stage</p>
                      </div>
                    ) : (
                      colApps.map(app => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className="bg-card border rounded-xl p-4 shadow-xs hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                              style={{ backgroundColor: app.color }}
                            >
                              {app.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{app.title}</h4>
                              <p className="text-xs font-semibold text-muted-foreground">{app.company}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t">
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
        <div className="border rounded-2xl overflow-hidden bg-card shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs font-bold text-muted-foreground uppercase">
              <tr>
                <th className="p-4">Company & Position</th>
                <th className="p-4">Location</th>
                <th className="p-4">Salary</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.map(app => {
                const col = COLUMNS.find(c => c.id === app.status);
                return (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedApp(app)}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: app.color }}
                        >
                          {app.initials}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{app.title}</div>
                          <div className="text-xs text-muted-foreground font-medium">{app.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{app.location}</td>
                    <td className="p-4 font-semibold">{app.salary}</td>
                    <td className="p-4 text-muted-foreground">{app.date}</td>
                    <td className="p-4">
                      <span className={cn("inline-block text-xs font-bold px-2.5 py-1 rounded-full capitalize", col?.badgeColor)}>
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
          <div className="bg-card border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: selectedApp.color }}>
                  {selectedApp.initials}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedApp.title}</h3>
                  <p className="text-sm font-semibold text-primary">{selectedApp.company}</p>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1.5 rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-muted-foreground block">Location</span>
                  <span className="font-semibold">{selectedApp.location}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Compensation</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedApp.salary}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-muted-foreground block mb-2">Move Application Stage</span>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => moveStatus(selectedApp.id, col.id as any)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                        selectedApp.status === col.id ? "bg-primary text-primary-foreground border-primary shadow-xs" : "bg-card hover:bg-muted text-muted-foreground"
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
                  <p className="p-3 bg-secondary rounded-xl text-xs text-foreground font-medium">{selectedApp.notes}</p>
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
          <form onSubmit={handleAddApplication} className="bg-card border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg">Add New Application</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold block mb-1">Company Name</label>
                <input required type="text" placeholder="e.g. OpenAI" value={newCompany} onChange={e => setNewCompany(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Job Title</label>
                <input required type="text" placeholder="e.g. Machine Learning Engineer" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Location</label>
                  <input type="text" placeholder="Remote / SF" value={newLocation} onChange={e => setNewLocation(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Salary</label>
                  <input type="text" placeholder="$150,000 / yr" value={newSalary} onChange={e => setNewSalary(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Initial Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl bg-background font-medium">
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 rounded-xl">Save Application</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
