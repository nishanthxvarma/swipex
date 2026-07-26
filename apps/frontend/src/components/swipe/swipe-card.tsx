"use client";

import React from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, X, Bookmark, Heart, Info, DollarSign, Clock, MapPin, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  location: string;
  type: string;
  salary: string;
  postedTime: string;
  skills: string[];
  matchPercentage: number;
  competition: "Low" | "Medium" | "High";
  verified: boolean;
  color: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
}

interface SwipeCardProps {
  job: Job;
  isTop: boolean;
  onSwipe: (direction: "left" | "right") => void;
  onShowDetails?: () => void;
}

export function SwipeCard({ job, isTop, onSwipe, onShowDetails }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Overlay opacity
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [0, -100], [0, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 150) {
      onSwipe("right");
    } else if (info.offset.x < -150) {
      onSwipe("left");
    }
  };

  const competitionColors = {
    Low: "bg-green-500",
    Medium: "bg-yellow-500",
    High: "bg-red-500",
  };

  return (
    <motion.div
      className="absolute w-full max-w-sm h-[520px] bg-card rounded-2xl shadow-xl border overflow-hidden flex flex-col bg-white dark:bg-zinc-900"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? 1 : 0.9,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
    >
      {/* Overlays */}
      <motion.div
        className="absolute inset-0 bg-green-500/20 z-10 flex items-center justify-center pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <div className="bg-green-500 text-white p-4 rounded-full">
          <Check size={48} />
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-red-500/20 z-10 flex items-center justify-center pointer-events-none"
        style={{ opacity: skipOpacity }}
      >
        <div className="bg-red-500 text-white p-4 rounded-full">
          <X size={48} />
        </div>
      </motion.div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: job.color }}
            >
              {job.companyInitials}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{job.company}</span>
                {job.verified && <Check className="w-4 h-4 text-blue-500 bg-blue-100 rounded-full p-[2px]" />}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {job.postedTime}
              </div>
            </div>
          </div>
          
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted" />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * job.matchPercentage) / 100}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {job.matchPercentage}%
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 leading-tight">{job.title}</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-secondary rounded-md">
            <MapPin className="w-3 h-3" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-secondary rounded-md">
            <Briefcase className="w-3 h-3" />
            {job.type}
          </span>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-secondary rounded-md font-medium text-green-600 dark:text-green-400">
            <DollarSign className="w-3 h-3" />
            {job.salary}
          </span>
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">Required Skills</div>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, i) => (
              <span key={i} className="text-xs px-2 py-1 border rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">Competition:</div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", competitionColors[job.competition])}></div>
              <span className="font-medium">{job.competition}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-muted/50 flex justify-center gap-4">
        <button
          onClick={() => onSwipe("left")}
          className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-red-500 hover:scale-105 transition-transform"
        >
          <X className="w-6 h-6" />
        </button>
        <button
          className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-yellow-500 hover:scale-105 transition-transform mt-2"
        >
          <Bookmark className="w-5 h-5" />
        </button>
        <button
          onClick={onShowDetails}
          className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-blue-500 hover:scale-105 transition-transform mt-2"
        >
          <Info className="w-5 h-5" />
        </button>
        <button
          onClick={() => onSwipe("right")}
          className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-green-500 hover:scale-105 transition-transform"
        >
          <Heart className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
}
