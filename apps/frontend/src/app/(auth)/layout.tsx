import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, Shield, Layers, FileSearch } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#070A0F] text-slate-100 selection:bg-primary/30">
      {/* Left Sidebar (Dark Editorial Product Story) */}
      <div className="relative hidden w-full flex-col justify-between bg-[#090E16] border-r border-slate-800 md:flex md:w-5/12 lg:w-5/12 p-10 lg:p-12 overflow-hidden bg-editorial-grid">
        <div className="relative z-10 flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm tracking-wider shadow-sm">
              SX
            </div>
            <span>SwipeX</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
              AI v2
            </span>
          </Link>
        </div>

        <div className="relative z-10 my-auto space-y-6 max-w-md py-12">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
            DETERMINISTIC MATCHING ENGINE
          </span>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-slate-100">
            Precision recruitment infrastructure for software engineers.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Deterministic ATS resume scoring, one-tap gesture discovery, and real-time recruiter pipeline synchronization.
          </p>

          <div className="pt-2 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-hallucination ATS keyword & section extraction</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-role access: Candidate, Recruiter & Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PostgreSQL authoritative database persistence</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-mono">
          © 2026 SwipeX Inc. Secure Authentication
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-[#070A0F]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-center gap-2 font-bold text-xl mb-8 text-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
            SX
          </div>
          SwipeX
        </div>
        <div className="mx-auto w-full max-w-md space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
