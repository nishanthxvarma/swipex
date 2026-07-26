"use client";

import React from "react";
import { BarChart3, TrendingUp, Target, Activity, Zap } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          Your Career Analytics
        </h1>
        <p className="text-muted-foreground">Insights and data to help you optimize your job search.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Total Applications</div>
          <div className="text-4xl font-black mb-2">124</div>
          <div className="text-sm text-green-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> +12 this week
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Interviews</div>
          <div className="text-4xl font-black mb-2">8</div>
          <div className="text-sm text-green-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> +2 this week
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Response Rate</div>
          <div className="text-4xl font-black mb-2">32%</div>
          <div className="text-sm text-green-500 font-medium flex items-center gap-1">
            Top 15% of users
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-6 hover:shadow-md transition-shadow bg-primary text-primary-foreground border-none">
          <div className="text-sm font-semibold opacity-80 mb-4 uppercase tracking-wider">Offers Received</div>
          <div className="text-4xl font-black mb-2">1</div>
          <div className="text-sm opacity-90 font-medium flex items-center gap-1">
            Keep it up!
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <div className="bg-card border rounded-3xl p-6 sm:p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Application Activity</h3>
          <div className="h-64 flex items-end gap-2 justify-between">
            {[4, 12, 8, 15, 22, 18, 25].map((val, i) => (
              <div key={i} className="w-full relative group flex flex-col items-center">
                <div 
                  className="w-full max-w-[40px] bg-primary/20 group-hover:bg-primary transition-colors rounded-t-lg"
                  style={{ height: `${(val / 25) * 100}%` }}
                ></div>
                <div className="text-xs text-muted-foreground mt-3 font-medium">W{i+1}</div>
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded-md pointer-events-none whitespace-nowrap">
                  {val} Applications
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar / Match */}
        <div className="bg-card border rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-bold mb-2 w-full text-left flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Skill Match Analysis</h3>
          <p className="text-muted-foreground text-sm w-full text-left mb-8">Based on jobs you've applied to.</p>
          
          <div className="relative w-48 h-48 mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              {/* Pentagon background grids */}
              <polygon points="50,5 95,35 78,90 22,90 5,35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
              <polygon points="50,20 80,42 68,80 32,80 20,42" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
              <polygon points="50,35 65,50 58,70 42,70 35,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
              {/* Axes */}
              <line x1="50" y1="50" x2="50" y2="5" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
              <line x1="50" y1="50" x2="95" y2="35" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
              <line x1="50" y1="50" x2="78" y2="90" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
              <line x1="50" y1="50" x2="22" y2="90" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
              <line x1="50" y1="50" x2="5" y2="35" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
              
              {/* Data Polygon */}
              <polygon points="50,15 85,38 70,75 28,60 15,40" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" className="text-primary" />
            </svg>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold">Frontend</div>
            <div className="absolute top-1/4 -right-8 text-xs font-bold">Backend</div>
            <div className="absolute bottom-0 -right-4 text-xs font-bold">System</div>
            <div className="absolute bottom-0 -left-4 text-xs font-bold">DevOps</div>
            <div className="absolute top-1/4 -left-8 text-xs font-bold">Design</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-6 sm:p-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Smart Insights</h3>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0"></div>
            <p className="font-medium">Your resume scores <strong className="text-primary">15% higher</strong> than average for Senior React roles.</p>
          </li>
          <li className="flex gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0"></div>
            <p className="font-medium">You have a high skip rate on jobs requiring "Java". Consider hiding jobs with this skill in your settings.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
