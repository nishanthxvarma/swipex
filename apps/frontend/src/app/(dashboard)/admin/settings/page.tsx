'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Sliders, Shield, Database, Cpu, Lock, Save, CheckCircle2, Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [atsThreshold, setAtsThreshold] = useState(75);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="flex items-center justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Settings & AI Parameters</h1>
          <p className="text-[#66788A] text-sm mt-1">
            Configure global ATS thresholds, AI models, API keys, and maintenance modes.
          </p>
        </div>
        <Button onClick={handleSave} className="rounded-xl font-bold gap-2">
          {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved Successfully' : 'Save Changes'}
        </Button>
      </div>

      {/* AI Scoring Configuration */}
      <div className="p-6 glass-1 rounded-3xl border space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2.5 rounded-xl bg-[#BFE8FF]/10 text-[#7DD3FC]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI & ATS Engine Parameters</h3>
            <p className="text-xs text-[#66788A]">Adjust matching sensitivity and default algorithm weights.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-bold">Minimum ATS Auto-Match Threshold</Label>
              <span className="text-sm font-bold text-primary">{atsThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={atsThreshold}
              onChange={(e) => setAtsThreshold(Number(e.target.value))}
              className="w-full h-2 glass-1 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-xs text-[#66788A]">Candidates scoring above this match score will be highlighted as top recommendations.</p>
          </div>
        </div>
      </div>

      {/* Security & Maintenance */}
      <div className="p-6 glass-1 rounded-3xl border space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Maintenance & Operations</h3>
            <p className="text-xs text-[#66788A]">Toggle platform availability mode.</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm">Platform Maintenance Mode</h4>
            <p className="text-xs text-[#66788A]">Temporarily restrict job seeker applications for system updates.</p>
          </div>
          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              maintenanceMode ? 'bg-rose-500' : 'glass-1'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              maintenanceMode ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}
