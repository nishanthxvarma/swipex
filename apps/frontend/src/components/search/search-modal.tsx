"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Building2, Briefcase, User, Sparkles, X, Loader2, ArrowRight } from "lucide-react";
import { searchApi, GlobalSearchResponse } from "@swipex/api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Live debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [searchRes, suggRes] = await Promise.allSettled([
          searchApi.globalSearch({ q: query }),
          searchApi.getSuggestions(query)
        ]);

        if (searchRes.status === "fulfilled") {
          setResults(searchRes.value);
        }
        if (suggRes.status === "fulfilled") {
          setSuggestions(suggRes.value || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, y: -16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, y: -16, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-[#0C1119] rounded-2xl shadow-2xl border border-slate-700/40 overflow-hidden flex flex-col max-h-[80vh]"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Search Input Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-border/60 gap-3 bg-[#090E16]">
            <Search className="w-5 h-5 text-primary shrink-0" />
            <input
              type="text"
              placeholder="Search jobs, companies, skills, candidates..."
              className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground font-medium"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
            <button
              onClick={onClose}
              className="px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground text-xs font-mono font-semibold"
            >
              ESC
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {!query ? (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Instant Search Suggestions
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Type a title, technology (e.g. <span className="text-primary font-mono">React</span>, <span className="text-primary font-mono">Python</span>), or company to query the live database.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Auto suggestions */}
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(s)}
                        className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border/40 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Jobs Results */}
                {results?.jobs && results.jobs.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
                      <span>Jobs ({results.jobs.length})</span>
                    </h3>
                    <div className="space-y-1">
                      {results.jobs.map((job) => (
                        <button
                          key={job.id}
                          onClick={() => navigateTo(`/jobs?id=${job.id}`)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 text-left transition-colors group border border-transparent hover:border-border/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                              {job.companyInitials}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                {job.title}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span>{job.company}</span>
                                <span>•</span>
                                <span>{job.location}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-medium text-emerald-500">{job.salary}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Companies Results */}
                {results?.companies && results.companies.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                      Companies ({results.companies.length})
                    </h3>
                    <div className="space-y-1">
                      {results.companies.map((comp) => (
                        <button
                          key={comp.id}
                          onClick={() => navigateTo(`/companies/${comp.id}`)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 text-left transition-colors group border border-transparent hover:border-border/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs text-foreground shrink-0 border border-border/40">
                              {comp.initials}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                {comp.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {comp.industry} • {comp.location}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Candidates Results (Recruiter/Admin) */}
                {results?.candidates && results.candidates.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                      Candidates ({results.candidates.length})
                    </h3>
                    <div className="space-y-1">
                      {results.candidates.map((cand) => (
                        <button
                          key={cand.id}
                          onClick={() => navigateTo(`/recruiter/candidates?id=${cand.id}`)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 text-left transition-colors group border border-transparent hover:border-border/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-xs text-accent shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                {cand.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {cand.headline} • {cand.location}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {cand.experienceYears}y exp
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {results && results.totalResults === 0 && !loading && (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-sm font-semibold text-foreground">No matches found for &quot;{query}&quot;</p>
                    <p className="text-xs text-muted-foreground">Try searching for a different skill, job title, or company.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
