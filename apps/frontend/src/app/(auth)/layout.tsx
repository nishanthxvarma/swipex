import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Sparkles, Star } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Left Sidebar (Marketing Panel) */}
      <div className="relative hidden w-full flex-col justify-between bg-card border-r border-border md:flex md:w-5/12 lg:w-5/12 p-10 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2.5 font-extrabold text-2xl tracking-tight text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-700 to-indigo-700 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          SwipeX
        </div>

        <div className="relative z-10 my-auto space-y-6 max-w-md py-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
            INTELLIGENT MATCHING ENGINE
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-foreground">
            Discover your next opportunity with a single swipe.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Real-time skill alignment, automated ATS analysis, and instant matching across candidate, recruiter, and enterprise workspaces.
          </p>

          <div className="pt-4 flex items-center gap-4 text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 10,000+ Active Roles</span>
            <span>•</span>
            <span>96% Avg Match Score</span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground font-medium">
          © 2026 SwipeX. All rights reserved.
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-center gap-2 font-bold text-2xl mb-8 text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          SwipeX
        </div>
        <div className="mx-auto w-full max-w-md sm:max-w-lg space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
