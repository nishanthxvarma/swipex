"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Settings, Bell, Shield, User, Monitor, Trash2, CheckCircle2, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("general");
  
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    applicationUpdates: true,
    recruiterMessages: true,
    marketingEmails: false,
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showSalary: true,
    allowRecruiterMessages: true,
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setSaveStatus("Passwords do not match");
      return;
    }
    setSaveStatus("Updating password...");
    setTimeout(() => {
      setSaveStatus("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaveStatus(null), 2500);
    }, 1000);
  };

  const tabs = [
    { id: "general", label: "General", icon: Monitor },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "account", label: "Account & Security", icon: User },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
          <Settings className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-[#66788A] text-sm mt-1">Manage your account preferences, notifications, and privacy controls.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-1 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:glass-1 text-[#66788A] hover:text-[#F5FAFF]"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-1 border rounded-3xl p-6 sm:p-8 shadow-xs">
          {activeTab === "general" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold border-b pb-4">General Settings</h2>
              
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base">Application Theme</h3>
                    <p className="text-[#66788A] text-xs">Choose between light, dark, or system preference.</p>
                  </div>
                  <select
                    value={theme || "dark"}
                    onChange={(e) => setTheme(e.target.value)}
                    className="glass-1 border px-4 py-2.5 rounded-xl outline-none text-xs font-semibold cursor-pointer"
                  >
                    <option value="system">System Default</option>
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base">Language</h3>
                    <p className="text-[#66788A] text-xs">Select your preferred display language.</p>
                  </div>
                  <select className="glass-1 border px-4 py-2.5 rounded-xl outline-none text-xs font-semibold cursor-pointer">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold border-b pb-4">Notification Preferences</h2>
              
              <div className="space-y-6">
                {[
                  { key: "jobAlerts", title: "Job Alerts", desc: "Get notified when new jobs match your ATS profile score." },
                  { key: "applicationUpdates", title: "Application Updates", desc: "Receive real-time notifications on recruiter actions." },
                  { key: "recruiterMessages", title: "Direct Recruiter Messages", desc: "Notifications when talent leads message you." },
                  { key: "marketingEmails", title: "Product Tips & Newsletter", desc: "Weekly career growth tips and platform updates." },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base">{item.title}</h3>
                      <p className="text-[#66788A] text-xs">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notifications as any)[item.key]}
                      onChange={(e) =>
                        setNotifications({ ...notifications, [item.key]: e.target.checked })
                      }
                      className="h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold border-b pb-4">Privacy & Data Controls</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base">Public Profile Visibility</h3>
                    <p className="text-[#66788A] text-xs">Allow verified recruiters on SwipeX to discover your profile.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.publicProfile}
                    onChange={(e) => setPrivacy({ ...privacy, publicProfile: e.target.checked })}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base">Show Expected Salary Range</h3>
                    <p className="text-[#66788A] text-xs">Display your target compensation expectations on job cards.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showSalary}
                    onChange={(e) => setPrivacy({ ...privacy, showSalary: e.target.checked })}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold border-b pb-4">Account & Security</h2>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" /> Change Password
                </h3>
                
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-background border px-4 py-2.5 rounded-xl text-xs font-medium outline-none"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-background border px-4 py-2.5 rounded-xl text-xs font-medium outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border px-4 py-2.5 rounded-xl text-xs font-medium outline-none"
                />

                {saveStatus && (
                  <p className={cn("text-xs font-semibold", saveStatus.includes("successfully") ? "text-emerald-500" : "text-amber-500")}>
                    {saveStatus}
                  </p>
                )}

                <Button type="submit" className="rounded-xl font-bold px-6 text-xs">
                  Update Password
                </Button>
              </form>

              <div className="mt-12 pt-8 border-t border-destructive/20">
                <h3 className="font-bold text-lg text-destructive flex items-center gap-2 mb-2">
                  <Trash2 className="w-5 h-5" /> Danger Zone
                </h3>
                <p className="text-[#66788A] text-xs mb-4">
                  Permanently delete your SwipeX account, application history, and ATS resume data.
                </p>
                <Button variant="destructive" className="rounded-xl font-bold text-xs">
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
