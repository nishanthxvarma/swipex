'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, Building2, Briefcase, Activity, DollarSign, Award
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Platform-Wide Performance Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track platform growth, candidate application conversion, recruiter engagement, and placement metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Monthly Active Users</p>
          <h3 className="text-3xl font-black mt-2">42,850</h3>
          <span className="text-xs font-bold text-emerald-500 mt-1 inline-block">+18.2% vs last month</span>
        </div>
        <div className="p-5 rounded-3xl bg-card border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Successful Placements</p>
          <h3 className="text-3xl font-black mt-2 text-purple-600">3,410</h3>
          <span className="text-xs font-bold text-purple-500 mt-1 inline-block">+24.5% vs last month</span>
        </div>
        <div className="p-5 rounded-3xl bg-card border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Average ATS Score</p>
          <h3 className="text-3xl font-black mt-2 text-emerald-600">78.4 / 100</h3>
          <span className="text-xs font-bold text-emerald-500 mt-1 inline-block">+4.2 pts overall improvement</span>
        </div>
        <div className="p-5 rounded-3xl bg-card border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Total Swipes Processed</p>
          <h3 className="text-3xl font-black mt-2 text-amber-600">1.84M</h3>
          <span className="text-xs font-bold text-amber-500 mt-1 inline-block">+31.0% engagement velocity</span>
        </div>
      </div>

      {/* Visual Charts & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-card border space-y-4">
          <h3 className="font-bold text-lg">Candidate Swipes vs Matches (Last 30 Days)</h3>
          <div className="h-64 bg-muted/20 rounded-2xl border flex items-end justify-between p-6 gap-2">
            {[45, 62, 58, 74, 90, 85, 95, 110, 105, 120, 135, 140].map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-primary to-purple-500 rounded-t-lg transition-all"
                  style={{ height: `${h * 1.5}px` }}
                />
                <span className="text-[10px] text-muted-foreground">W{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border space-y-4">
          <h3 className="font-bold text-lg">Top Hiring Categories</h3>
          <div className="space-y-3">
            {[
              { role: 'Frontend & Full Stack Development', count: '4,290 applications', pct: 85 },
              { role: 'AI / Machine Learning Engineering', count: '3,120 applications', pct: 72 },
              { role: 'Product Management & Design', count: '2,450 applications', pct: 58 },
              { role: 'DevOps & Cloud Infrastructure', count: '1,890 applications', pct: 45 },
            ].map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>{c.role}</span>
                  <span className="text-muted-foreground">{c.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
