"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SwipeCard, Job } from "./swipe-card";
import { RotateCcw } from "lucide-react";
import { SwipeOverlay } from "./swipe-overlay";

interface SwipeStackProps {
  jobs: Job[];
  onShowDetails: (job: Job) => void;
}

export function SwipeStack({ jobs, onShowDetails }: SwipeStackProps) {
  const [cards, setCards] = useState(jobs);
  const [history, setHistory] = useState<Job[]>([]);
  const [overlayStatus, setOverlayStatus] = useState<"right" | "left" | null>(null);
  const [matchedJob, setMatchedJob] = useState<Job | null>(null);

  const handleSwipe = (direction: "left" | "right") => {
    if (cards.length === 0) return;
    
    const currentCard = cards[0];
    setHistory([...history, currentCard]);
    setCards(cards.slice(1));
    
    setOverlayStatus(direction);
    if (direction === "right" && (currentCard.matchPercentage || 90) >= 85) {
      setMatchedJob(currentCard);
    }
    setTimeout(() => setOverlayStatus(null), 800);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastCard = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCards([lastCard, ...cards]);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px] flex flex-col items-center justify-center">
      <AnimatePresence>
        {overlayStatus && <SwipeOverlay direction={overlayStatus} />}
      </AnimatePresence>

      {/* "It's a Match!" Celebration Screen */}
      <AnimatePresence>
        {matchedJob && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setMatchedJob(null)}
          >
            <div className="bg-card border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-purple-600" />
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-2xl shadow-lg animate-pulse">
                {matchedJob.matchPercentage || 96}%
              </div>
              <div>
                <span className="text-xs font-extrabold tracking-widest text-emerald-400 uppercase">HIGH MATCH FOUND</span>
                <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-foreground">It's a Match!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Your profile alignment with <span className="font-bold text-foreground">{matchedJob.company}</span> for <span className="font-bold text-foreground">{matchedJob.title}</span> is outstanding.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/50 border space-y-2 text-left text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-muted-foreground">Skill Overlap</span>
                  <span className="font-bold text-emerald-400">95%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-muted-foreground">Location Alignment</span>
                  <span className="font-bold text-emerald-400">100%</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMatchedJob(null)}
                  className="flex-1 py-3 rounded-full bg-secondary hover:bg-secondary/80 font-bold text-xs transition-colors"
                >
                  Keep Swiping
                </button>
                <button
                  onClick={() => {
                    const job = matchedJob;
                    setMatchedJob(null);
                    onShowDetails(job);
                  }}
                  className="flex-1 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white shadow-lg transition-all"
                >
                  View Role Details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-sm font-medium text-muted-foreground mb-4">
        Card {jobs.length - cards.length + 1} of {jobs.length}
      </div>

      <div className="relative w-full h-[520px] flex items-center justify-center">
        {cards.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-2xl shadow-sm border w-full max-w-sm">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2">No more jobs!</h3>
            <p className="text-muted-foreground">Check back later for more opportunities matching your profile.</p>
            <button 
              onClick={() => { setCards(jobs); setHistory([]); }}
              className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
            >
              Start Over
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {cards.slice(0, 3).reverse().map((job, index, array) => {
              const isTop = index === array.length - 1;
              const stackIndex = array.length - 1 - index;
              
              return (
                <motion.div
                  key={job.id}
                  className="absolute w-full h-full flex items-center justify-center"
                  initial={{ scale: 0.95, y: 20, opacity: 0 }}
                  animate={{ 
                    scale: 1 - stackIndex * 0.05, 
                    y: stackIndex * 15,
                    opacity: 1 - stackIndex * 0.1
                  }}
                  exit={{ x: overlayStatus === "right" ? 500 : -500, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <SwipeCard
                    job={job}
                    isTop={isTop}
                    onSwipe={handleSwipe}
                    onShowDetails={() => onShowDetails(job)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="mt-6 flex justify-center w-full">
        <button
          onClick={handleUndo}
          disabled={history.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground disabled:opacity-50 hover:bg-secondary/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Undo</span>
        </button>
      </div>
    </div>
  );
}
