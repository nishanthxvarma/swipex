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

  const handleSwipe = (direction: "left" | "right") => {
    if (cards.length === 0) return;
    
    const currentCard = cards[0];
    setHistory([...history, currentCard]);
    setCards(cards.slice(1));
    
    setOverlayStatus(direction);
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
