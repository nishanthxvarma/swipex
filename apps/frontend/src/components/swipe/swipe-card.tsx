"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, X, Bookmark, Info, MapPin, Briefcase, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  location: string;
  type: string;
  jobType?: string;
  salary: string;
  postedTime: string;
  skills: string[];
  matchPercentage: number;
  atsScore?: number;
  competition: "Low" | "Medium" | "High";
  verified: boolean;
  color?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  isSaved?: boolean;
}

interface SwipeCardProps {
  job: Job;
  isTop: boolean;
  onSwipe: (direction: "left" | "right") => void;
  onShowDetails?: () => void;
  onToggleSave?: (job: Job) => void;
}

export function SwipeCard({ job, isTop, onSwipe, onShowDetails, onToggleSave }: SwipeCardProps) {
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);

  // Progressive directional badge opacity
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-20, -100], [0, 1]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 120 || info.velocity.x > 500) {
      onSwipe("right");
    } else if (info.offset.x < -120 || info.velocity.x < -500) {
      onSwipe("left");
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (onToggleSave) {
      onToggleSave({ ...job, isSaved: nextSaved });
    }
  };

  const matchColor = job.matchPercentage >= 90 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : job.matchPercentage >= 75 ? "text-blue-400 border-blue-500/30 bg-blue-500/10" : "text-amber-400 border-amber-500/30 bg-amber-500/10";

  return (
    <motion.div
      className={cn(
        "absolute w-full max-w-md h-[540px] bg-[#0C1119] rounded-2xl shadow-xl border border-slate-700/40 overflow-hidden flex flex-col select-none",
        isTop ? "cursor-grab active:cursor-grabbing z-20" : "pointer-events-none z-10"
      )}
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.01 }}
      transition={{ type: "spring", damping: 26, stiffness: 280 }}
    >
      {/* PASS label overlay (Left Drag) */}
      <motion.div
        className="absolute top-6 right-6 z-30 pointer-events-none"
        style={{ opacity: passOpacity }}
      >
        <div className="px-4 py-1.5 rounded-lg border-2 border-rose-500 bg-rose-500/20 text-rose-400 font-mono font-black text-sm tracking-widest uppercase rotate-12 shadow-lg">
          PASS
        </div>
      </motion.div>

      {/* APPLY label overlay (Right Drag) */}
      <motion.div
        className="absolute top-6 left-6 z-30 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <div className="px-4 py-1.5 rounded-lg border-2 border-emerald-500 bg-emerald-500/20 text-emerald-400 font-mono font-black text-sm tracking-widest uppercase -rotate-12 shadow-lg">
          APPLY
        </div>
      </motion.div>

      {/* Card Header */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Top metadata row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center font-bold text-sm text-foreground shrink-0 shadow-xs">
                {job.companyInitials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground tracking-tight">{job.company}</span>
                  {job.verified && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </div>
                <span className="text-xs text-muted-foreground">{job.postedTime}</span>
              </div>
            </div>

            {/* Match Score Pill */}
            <div className={cn("px-2.5 py-1 rounded-full border text-xs font-mono font-bold flex items-center gap-1 shrink-0", matchColor)}>
              <Sparkles className="w-3 h-3" />
              <span>{job.matchPercentage}% MATCH</span>
            </div>
          </div>

          {/* Job Title & Main Attributes */}
          <h2 className="text-2xl font-bold text-foreground tracking-tight leading-snug mb-3">
            {job.title}
          </h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-muted text-slate-300 border border-border/40 font-medium">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-muted text-slate-300 border border-border/40 font-medium">
              <Briefcase className="w-3 h-3 text-muted-foreground" />
              {job.type || job.jobType || "Full-time"}
            </span>
            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
              {job.salary}
            </span>
          </div>

          {/* Skills Required */}
          <div className="space-y-1.5 mb-4">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Skills Required
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 5).map((skill, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-300 font-medium">
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="text-xs px-2 py-1 text-muted-foreground font-mono">
                  +{job.skills.length - 5}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Why this matches you signals */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI Match Signals</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            Matches your core competencies in {job.skills.slice(0, 2).join(" & ")} with strong alignment to role seniority.
          </p>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="p-3.5 bg-[#090E16] border-t border-border/60 flex items-center justify-center gap-4">
        <button
          onClick={() => onSwipe("left")}
          title="Pass (Left arrow)"
          className="w-12 h-12 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 border border-slate-700/60 hover:border-rose-500/30 text-muted-foreground hover:text-rose-400 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={handleBookmarkClick}
          title={isSaved ? "Saved" : "Save Role"}
          className={cn(
            "w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer",
            isSaved
              ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
              : "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/60 text-muted-foreground hover:text-foreground"
          )}
        >
          <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
        </button>

        <button
          onClick={onShowDetails}
          title="View Job Details"
          className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Info className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSwipe("right")}
          title="Apply (Right arrow)"
          className="w-12 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer font-bold"
        >
          <Check className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
