"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Building2, TerminalSquare, TrendingUp, Clock, X } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");

  // Handle Cmd+K to open (handled in layout/provider usually, but modal should handle Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: -20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: -20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-background rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Header */}
          <div className="flex items-center p-4 border-b gap-3">
            <Search className="w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs, companies, skills..."
              className="flex-1 bg-transparent border-none outline-none text-xl placeholder:text-muted-foreground"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground text-xs font-medium px-2"
            >
              ESC
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!query ? (
              <>
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Frontend Engineer Remote</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Stripe</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Trending
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm cursor-pointer hover:bg-secondary/80">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" /> React
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm cursor-pointer hover:bg-secondary/80">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" /> AI Engineer
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm cursor-pointer hover:bg-secondary/80">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" /> San Francisco
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-2 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    Jobs
                  </h3>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left">
                      <TerminalSquare className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Senior Software Engineer</div>
                        <div className="text-xs text-muted-foreground">Google • Remote</div>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left">
                      <TerminalSquare className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Software Developer (React)</div>
                        <div className="text-xs text-muted-foreground">Meta • New York</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    Companies
                  </h3>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left">
                      <Building2 className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="font-medium">Vercel</div>
                        <div className="text-xs text-muted-foreground">Technology • 100+ open jobs</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
