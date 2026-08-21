'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Layers, FileSearch, ArrowRight, CheckCircle2,
  MapPin, Briefcase, DollarSign, Check, X, Shield, Users, BarChart3, Building2, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [demoSwiped, setDemoSwiped] = useState<"pass" | "apply" | null>(null);

  const demoCard = {
    title: "Staff Distributed Systems Engineer",
    company: "Nexus Cloud Infrastructure",
    location: "San Francisco, CA • Remote",
    salary: "$180,000 - $240,000",
    matchScore: 94,
    skills: ["Go", "Kubernetes", "gRPC", "Distributed Systems", "PostgreSQL"],
    signals: [
      "Extensive experience with high-throughput distributed architectures",
      "Direct skill overlap on Kubernetes orchestration & Go microservices",
      "Matches remote compensation band"
    ]
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 selection:bg-primary/30 flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#070A0F]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-sm tracking-wider">
              SX
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">SwipeX</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
              AI v2
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="#capabilities" className="hover:text-slate-200 transition-colors">Capabilities</Link>
            <Link href="#workflow" className="hover:text-slate-200 transition-colors">How It Works</Link>
            <Link href="/companies" className="hover:text-slate-200 transition-colors">Companies</Link>
            <Link href="/jobs" className="hover:text-slate-200 transition-colors">Explore Feed</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 px-4 text-xs font-bold text-primary-foreground shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b border-slate-800/60 bg-editorial-grid">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Brand Statement */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Next-Generation Career Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 leading-[1.1]">
                Don&apos;t search for the future. <br />
                <span className="text-gradient-accent">Swipe into it.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-xl font-normal leading-relaxed">
                SwipeX pairs deterministic ATS resume scoring with natural gesture discovery to connect software engineers with verified tech roles.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold text-primary-foreground shadow-md transition-all active:scale-95"
                >
                  <span>Start Discovering</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/signup?role=recruiter"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#0C1119] hover:bg-slate-800 border border-slate-700/70 text-sm font-semibold text-slate-200 transition-all"
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Recruiter Workspace</span>
                </Link>
              </div>

              {/* Verified Product Guarantees */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-xs font-mono font-bold text-slate-200">100% Deterministic</p>
                  <p className="text-[11px] text-slate-500">Reproducible ATS Scoring</p>
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-slate-200">PostgreSQL Backed</p>
                  <p className="text-[11px] text-slate-500">Real-Time Sync</p>
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-slate-200">Role-Based RBAC</p>
                  <p className="text-[11px] text-slate-500">Secure Access Controls</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Product Card Demo */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-[#0C1119] border border-slate-700/60 p-6 shadow-2xl space-y-5 relative">
                
                {/* Header with Match Badge */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-xs text-primary">
                        NX
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-200">{demoCard.company}</p>
                        <p className="text-[10px] text-slate-500">{demoCard.location}</p>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
                    {demoCard.matchScore}% MATCH
                  </span>
                </div>

                {/* Job Title & Compensation */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-100 tracking-tight leading-snug">
                    {demoCard.title}
                  </h3>
                  <div className="inline-block px-2.5 py-1 rounded-md bg-slate-800 text-xs font-mono text-emerald-400 font-bold">
                    {demoCard.salary}
                  </div>
                </div>

                {/* Skills Required */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Skills Required
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {demoCard.skills.map((s, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Match Signals */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                  <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Algorithmic Alignment</span>
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Verified Go & Kubernetes proficiency aligned to engineering seniority requirements.
                  </p>
                </div>

                {/* Interactive Demo Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <button
                    onClick={() => setDemoSwiped("pass")}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Pass</span>
                  </button>

                  <div className="h-4 w-px bg-slate-800 mx-2" />

                  <button
                    onClick={() => setDemoSwiped("apply")}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>1-Tap Apply</span>
                  </button>
                </div>

                {demoSwiped && (
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-center text-xs text-slate-300 animate-fade-in">
                    {demoSwiped === "apply" ? "✓ Registered genuine application intent" : "✕ Passed role"}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Capabilities Section ── */}
      <section id="capabilities" className="py-20 border-b border-slate-800/60 bg-[#090E16]">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">
              Engineered Capabilities
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-100">
              Built for speed, accuracy, and clarity.
            </h2>
            <p className="text-sm text-slate-400">
              SwipeX eliminates tedious job board filtering and black-box application portals with deterministic intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#0C1119] border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">ATS Resume Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic ATS score meter, keyword density analyzer, and structured skill gap breakdown without hallucinated suggestions.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Section-by-section breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exact keyword gap identification</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#0C1119] border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Gesture-Driven Discovery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant card stack interactions with keyboard arrow shortcuts (← Pass, → Apply, ↑ Save) and smooth touch physics.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant 1-tap submission</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No redundant cover letters</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#0C1119] border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Recruiter Pipeline Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live Kanban pipeline stages (Applied $\rightarrow$ Reviewing $\rightarrow$ Interview $\rightarrow$ Offer) with automatic candidate notification triggers.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PostgreSQL state persistence</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Audit activity trail for moderation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Step-by-Step ── */}
      <section id="workflow" className="py-20 border-b border-slate-800/60 bg-[#070A0F]">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">
              End-to-End Architecture
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-100">
              How SwipeX Works
            </h2>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#0C1119] border border-slate-800 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-mono font-bold flex items-center justify-center text-sm shrink-0">
                1
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-200">Upload & Parse Resume</h4>
                <p className="text-xs text-slate-400">
                  Our deterministic parser extracts verified skills, experiences, and education into your candidate profile, calculating an exact ATS readiness score.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0C1119] border border-slate-800 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-mono font-bold flex items-center justify-center text-sm shrink-0">
                2
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-200">Discover Aligned Opportunities</h4>
                <p className="text-xs text-slate-400">
                  Swipe through curated tech roles matching your seniority, location preferences, and skill profile. Swipe right to submit or left to pass.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0C1119] border border-slate-800 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-mono font-bold flex items-center justify-center text-sm shrink-0">
                3
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-200">Track Applications in Real-Time</h4>
                <p className="text-xs text-slate-400">
                  Receive instant notifications when recruiters review your application, schedule interviews, or extend formal offers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#090E16] py-12">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                SX
              </div>
              <span className="font-bold text-sm text-slate-200">SwipeX</span>
              <span className="text-xs text-slate-500 ml-2">© 2026 SwipeX Inc.</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
              <Link href="/jobs" className="hover:text-slate-200 transition-colors">Jobs</Link>
              <Link href="/companies" className="hover:text-slate-200 transition-colors">Companies</Link>
              <Link href="/login" className="hover:text-slate-200 transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-slate-200 transition-colors">Create Account</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
