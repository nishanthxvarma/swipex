"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, MapPin, DollarSign, Briefcase, Calendar, CheckCircle2, Bookmark } from "lucide-react";
import { Job } from "../swipe/swipe-card";

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
  if (!job) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 md:inset-x-auto md:right-0 md:top-0 md:w-full md:max-w-2xl h-[90vh] md:h-screen bg-background rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b p-4 flex justify-between items-center z-10">
              <h3 className="font-semibold text-lg">Job Details</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-8">
              {/* Header */}
              <div className="flex gap-4 items-start">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: job.color }}
                >
                  {job.companyInitials}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">{job.title}</h1>
                  <div className="flex items-center gap-2 text-lg">
                    <span className="font-semibold text-primary">{job.company}</span>
                    {job.verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                    <a href="#" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{job.location}</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Salary</div>
                    <div className="font-medium">{job.salary}</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Job Type</div>
                    <div className="font-medium">{job.type}</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Posted</div>
                    <div className="font-medium">{job.postedTime}</div>
                  </div>
                </div>
              </div>

              {/* Applicant Competition Indicator Section */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Applicant Competition Signal
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                    {job.competition || 'Moderate'} Competition
                  </span>
                </div>
                
                <p className="text-sm font-bold text-foreground">
                  You&apos;re in the top 18% of applicants based on current matching signals.
                </p>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                  <div className="p-2 rounded-xl bg-background border">
                    <p className="text-[10px] text-muted-foreground font-semibold">Skill Match</p>
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400">{job.matchPercentage || 92}%</p>
                  </div>
                  <div className="p-2 rounded-xl bg-background border">
                    <p className="text-[10px] text-muted-foreground font-semibold">ATS Score</p>
                    <p className="font-extrabold text-primary">{job.atsScore || 88.5}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-background border">
                    <p className="text-[10px] text-muted-foreground font-semibold">Location Fit</p>
                    <p className="font-extrabold text-indigo-600 dark:text-indigo-400">100%</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <section>
                <h2 className="text-xl font-bold mb-3 border-b pb-2">Description</h2>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>{job.description || "Join our fast-growing team to build next-generation experiences. You will be responsible for designing and developing highly scalable applications."}</p>
                  <p>We are looking for passionate individuals who care about performance, accessibility, and clean code.</p>
                </div>
              </section>

              {/* Requirements */}
              <section>
                <h2 className="text-xl font-bold mb-3 border-b pb-2">Requirements</h2>
                <ul className="space-y-3">
                  {(job.requirements || ["3+ years of experience", "Strong computer science fundamentals", "Experience with modern web technologies"]).map((req, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Skills Match */}
              <section>
                <h2 className="text-xl font-bold mb-3 border-b pb-2 flex justify-between items-center">
                  <span>Skills Match</span>
                  <span className="text-sm font-normal text-primary">{job.matchPercentage}% Match</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${i % 3 !== 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-secondary text-muted-foreground'}`}>
                      {skill} {i % 3 !== 0 && "✓"}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Sticky Action Footer */}
            <div className="sticky bottom-0 p-4 bg-background border-t flex gap-3 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
              <button className="flex-1 bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-lg">
                Apply Now
              </button>
              <button className="w-16 flex items-center justify-center bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors">
                <Bookmark className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
