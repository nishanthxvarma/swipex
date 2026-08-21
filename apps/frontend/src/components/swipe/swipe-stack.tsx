"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SwipeCard, Job } from "./swipe-card";
import { RotateCcw, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { SwipeOverlay } from "./swipe-overlay";

interface SwipeStackProps {
  jobs: Job[];
  onShowDetails: (job: Job) => void;
  onSwipe?: (job: Job, direction: "left" | "right") => void;
}

export function SwipeStack({ jobs, onShowDetails, onSwipe }: SwipeStackProps) {
  const [cards, setCards] = useState(jobs);
  const [history, setHistory] = useState<Job[]>([]);
  const [overlayStatus, setOverlayStatus] = useState<"right" | "left" | null>(null);
  const [matchedJob, setMatchedJob] = useState<Job | null>(null);

  useEffect(() => {
    setCards(jobs);
  }, [jobs]);

  const handleSwipe = (direction: "left" | "right") => {
    if (cards.length === 0) return;
    
    const currentCard = cards[0];
    setHistory((prev) => [...prev, currentCard]);
    setCards((prev) => prev.slice(1));
    
    if (onSwipe) {
      onSwipe(currentCard, direction);
    }

    setOverlayStatus(direction);
    if (direction === "right" && (currentCard.matchPercentage || 90) >= 88) {
      setMatchedJob(currentCard);
    }
    setTimeout(() => setOverlayStatus(null), 600);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastCard = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCards((prev) => [lastCard, ...prev]);
  };

  // Keyboard navigation: Left = Pass, Right = Apply, Up = Save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSwipe("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSwipe("right");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards]);

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px] flex flex-col items-center justify-center">
      <AnimatePresence>
        {overlayStatus && <SwipeOverlay direction={overlayStatus} />}
      </AnimatePresence>

      {/* Editorial Match Dialog */}
      <AnimatePresence>
        {matchedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setMatchedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0C1119] border border-slate-700/60 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xl">
                {matchedJob.matchPercentage || 92}%
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  HIGH PROFILE ALIGNMENT
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Strong Match Identified
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your background matches key requirements for <span className="font-semibold text-foreground">{matchedJob.title}</span> at <span className="font-semibold text-foreground">{matchedJob.company}</span>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border/50 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified core skills overlap</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Location alignment: {matchedJob.location}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMatchedJob(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Continue Swiping
                </button>
                <button
                  onClick={() => {
                    const job = matchedJob;
                    setMatchedJob(null);
                    onShowDetails(job);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards Stack Rendering */}
      <div className="relative w-full h-[540px] flex items-center justify-center">
        {cards.length > 0 ? (
          cards.slice(0, 3).map((job, index) => {
            const isTop = index === 0;
            return (
              <motion.div
                key={job.id}
                className="absolute inset-0 flex items-center justify-center"
                initial={false}
                animate={{
                  scale: 1 - index * 0.04,
                  y: index * 10,
                  zIndex: 30 - index,
                  opacity: 1 - index * 0.15,
                }}
                transition={{ duration: 0.2 }}
              >
                <SwipeCard
                  job={job}
                  isTop={isTop}
                  onSwipe={handleSwipe}
                  onShowDetails={() => onShowDetails(job)}
                />
              </motion.div>
            );
          })
        ) : (
          <div className="text-center p-8 bg-[#0C1119] rounded-2xl border border-slate-800/80 shadow-xl max-w-sm w-full space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">You&apos;re all caught up!</h3>
              <p className="text-xs text-muted-foreground">
                No more opportunities matching your current filter in this batch.
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleUndo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-border/40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo Last Action</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Keyboard Helper Hint */}
      <div className="mt-3 text-[11px] font-mono text-muted-foreground flex items-center gap-3">
        <span>← Pass</span>
        <span>•</span>
        <span>→ Apply</span>
      </div>
    </div>
  );
}
