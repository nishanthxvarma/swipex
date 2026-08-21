'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, CheckCircle2, Trash2, Filter, Settings, Sparkles, Calendar, Briefcase, Award, Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification-store';

export default function NotificationCenterPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    preferences,
    updatePreferences,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'applications' | 'interviews'>('all');
  const [showPreferences, setShowPreferences] = useState(false);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'job_matched':
      case 'job_recommendation':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'interview_scheduled':
      case 'interview_reminder':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'application_submitted':
      case 'application_status_changed':
      case 'application_viewed':
        return <Briefcase className="w-4 h-4 text-primary" />;
      case 'ats_analysis_completed':
        return <Award className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'applications') return n.type.includes('application');
    if (activeTab === 'interviews') return n.type.includes('interview');
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Application updates, recruiter reviews, and interview schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="rounded-xl font-semibold text-xs h-9 bg-[#0C1119] border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Mark All Read
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreferences(!showPreferences)}
            className="rounded-xl font-semibold text-xs h-9 bg-[#0C1119] border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            <Settings className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Preferences
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
        {(['all', 'unread', 'applications', 'interviews'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-slate-800 text-slate-100 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="p-12 text-center bg-[#0C1119] rounded-2xl border border-slate-800 max-w-md mx-auto space-y-2 my-6">
          <div className="w-10 h-10 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">No notifications</h3>
          <p className="text-xs text-slate-500">You are all caught up.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                n.isRead
                  ? 'bg-[#0C1119]/60 border-slate-800/60 opacity-75'
                  : 'bg-[#0C1119] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {getIconForType(n.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-100">{n.title}</p>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(n.id);
                }}
                className="text-slate-600 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                title="Dismiss"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
