'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, CheckCircle2, Trash2, Filter, Settings, Sparkles, Calendar, Briefcase, Award, ShieldAlert, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification-store';
import { NotificationType } from '@swipex/types';

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

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'applications' | 'interviews' | 'jobs'>('all');
  const [showPreferences, setShowPreferences] = useState(false);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'job_matched':
      case 'job_recommendation':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'interview_scheduled':
      case 'interview_reminder':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'application_submitted':
      case 'application_status_changed':
      case 'application_viewed':
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'ats_analysis_completed':
        return <Award className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'applications') return n.type.includes('application');
    if (activeTab === 'interviews') return n.type.includes('interview');
    if (activeTab === 'jobs') return n.type.includes('job');
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Bell className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Stay updated on application responses, interview schedules, ATS analyses, and job matches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="rounded-xl font-bold text-xs gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mark All Read
          </Button>
          <Button
            variant={showPreferences ? 'secondary' : 'outline'}
            onClick={() => setShowPreferences(!showPreferences)}
            className="rounded-xl font-bold text-xs gap-1.5"
          >
            <Settings className="w-4 h-4" /> Preferences
          </Button>
        </div>
      </div>

      {/* Notification Preferences Drawer / Card */}
      {showPreferences && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-6 rounded-3xl bg-card border shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" /> Notification Delivery Preferences
            </h3>
            <span className="text-xs text-muted-foreground font-medium">Persisted to account</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold">
            {[
              { key: 'jobRecommendations', label: 'Job Recommendations & Matches' },
              { key: 'applications', label: 'Application Status Updates' },
              { key: 'interviews', label: 'Interview Schedules & Reminders' },
              { key: 'recruiterActivity', label: 'Recruiter Profile Views' },
              { key: 'analytics', label: 'ATS Analysis & Analytics Reports' },
              { key: 'systemNotifications', label: 'System & Security Alerts' },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border">
                <span>{pref.label}</span>
                <input
                  type="checkbox"
                  checked={(preferences as any)[pref.key]}
                  onChange={(e) => updatePreferences({ [pref.key]: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-muted rounded-2xl border text-xs font-bold">
          {[
            { id: 'all', label: 'All Notifications' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'applications', label: 'Applications' },
            { id: 'interviews', label: 'Interviews' },
            { id: 'jobs', label: 'Job Matches' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-card border rounded-3xl space-y-3">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <h3 className="font-bold text-base">No notifications found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You are all caught up! New job matches, application views, and interview alerts will appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 ${
                notif.isRead ? 'bg-card' : 'bg-primary/5 border-primary/20 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-background border shadow-xs shrink-0 mt-0.5">
                  {getIconForType(notif.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-foreground">{notif.title}</h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-muted-foreground font-mono pt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!notif.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead(notif.id)}
                    title="Mark as read"
                    className="rounded-xl text-xs font-semibold text-primary hover:bg-primary/10"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissNotification(notif.id)}
                  title="Dismiss"
                  className="rounded-xl text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
