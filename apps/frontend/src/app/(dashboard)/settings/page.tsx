"use client";

import React, { useState } from "react";
import { Settings, Bell, Shield, User, Monitor, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Monitor },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "account", label: "Account", icon: User },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and application settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-1 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === tab.id ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card border rounded-3xl p-6 sm:p-8">
          {activeTab === "general" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold border-b pb-4">General Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Theme</h3>
                    <p className="text-muted-foreground text-sm">Select your preferred application theme.</p>
                  </div>
                  <select className="bg-secondary px-4 py-2 rounded-lg border-none outline-none font-medium">
                    <option>System Default</option>
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Language</h3>
                    <p className="text-muted-foreground text-sm">Choose your primary language.</p>
                  </div>
                  <select className="bg-secondary px-4 py-2 rounded-lg border-none outline-none font-medium">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
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
                  { title: "Job Alerts", desc: "Get notified when new jobs match your profile." },
                  { title: "Application Updates", desc: "Receive updates on your application status." },
                  { title: "Messages", desc: "Notifications for messages from recruiters." },
                  { title: "Marketing Emails", desc: "Tips, news, and promotional content." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                    {/* Toggle Switch */}
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" name="toggle" id={`toggle-${i}`} defaultChecked={i < 3} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" style={{ right: i < 3 ? '0' : 'auto', borderColor: i < 3 ? '#3b82f6' : '#e5e7eb' }}/>
                      <label htmlFor={`toggle-${i}`} className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${i < 3 ? 'bg-primary' : ''}`}></label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold border-b pb-4">Account Security</h2>
              
              <div className="space-y-4 max-w-md">
                <h3 className="font-semibold text-lg">Change Password</h3>
                <input type="password" placeholder="Current Password" className="w-full bg-secondary px-4 py-3 rounded-xl border-none" />
                <input type="password" placeholder="New Password" className="w-full bg-secondary px-4 py-3 rounded-xl border-none" />
                <input type="password" placeholder="Confirm New Password" className="w-full bg-secondary px-4 py-3 rounded-xl border-none" />
                <button className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
                  Update Password
                </button>
              </div>

              <div className="mt-12 pt-8 border-t border-red-500/20">
                <h3 className="font-bold text-xl text-red-500 flex items-center gap-2 mb-2"><Trash2 className="w-5 h-5" /> Danger Zone</h3>
                <p className="text-muted-foreground text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="bg-red-500/10 text-red-600 font-bold px-6 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
          
          {activeTab === "privacy" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold border-b pb-4">Privacy</h2>
              <p className="text-muted-foreground">Adjust your profile visibility and data sharing preferences.</p>
              {/* Privacy settings content */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
