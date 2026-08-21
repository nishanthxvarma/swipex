'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Mail, MapPin, Briefcase, Code, FileText, 
  Link as LinkIcon, Edit2, Download, ExternalLink, Plus, Check, Save, 
  Upload, Sparkles, X, Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useResumeStore } from '@/stores/resume-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { usersApi } from '@swipex/api';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  
  const { activeResume, uploadResume, isUploading, fetchActiveResume } = useResumeStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [showAddSkill, setShowAddSkill] = useState(false);
  
  const [socialLinks, setSocialLinks] = useState(user?.socialLinks || [
    { id: 1, name: "LinkedIn", url: "https://linkedin.com", handle: "linkedin.com", colorClass: "bg-blue-500/10 text-blue-500" },
    { id: 2, name: "GitHub", url: "https://github.com", handle: "github.com", colorClass: "bg-foreground/10 text-foreground" },
  ]);

  const [profileCompletion, setProfileCompletion] = useState("80%");

  const fetchProfileFromDb = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const p = await usersApi.getProfile();
      if (p) {
        setFullName(p.fullName || p.full_name || user?.fullName || "");
        setHeadline(p.headline || user?.headline || "");
        setLocation(p.location || user?.location || "");
        setBio(p.bio || user?.bio || "");
        setSkills(p.skills && p.skills.length > 0 ? p.skills : (user?.skills || []));
        setExperiences(p.experiences && p.experiences.length > 0 ? p.experiences : (user?.experiences || []));
        if (p.profile_completion || p.profileCompletion) {
          setProfileCompletion(p.profile_completion || p.profileCompletion);
        }
        if (p.socialLinks && p.socialLinks.length > 0) {
          setSocialLinks(p.socialLinks);
        } else if (p.social_links && p.social_links.length > 0) {
          setSocialLinks(p.social_links);
        }

        if (user) {
          setUser({
            ...user,
            fullName: p.fullName || p.full_name || user.fullName,
            headline: p.headline || user.headline,
            location: p.location || user.location,
            bio: p.bio || user.bio,
            skills: p.skills || user.skills,
            experiences: p.experiences || user.experiences,
            socialLinks: p.socialLinks || p.social_links || user.socialLinks
          });
        }
      }
    } catch (err) {
      console.error("Error loading profile from DB:", err);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user, setUser]);

  useEffect(() => {
    fetchActiveResume();
    fetchProfileFromDb();
  }, [fetchActiveResume, fetchProfileFromDb]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const payload = {
        fullName,
        headline,
        location,
        bio,
        skills,
        experiences,
        socialLinks
      };

      const updated = await usersApi.updateProfile(payload);
      if (updated) {
        if (user) {
          setUser({
            ...user,
            fullName: updated.fullName || updated.full_name || fullName,
            headline: updated.headline || headline,
            location: updated.location || location,
            bio: updated.bio || bio,
            skills: updated.skills || skills,
            experiences: updated.experiences || experiences,
          });
        }
        if (updated.profile_completion || updated.profileCompletion) {
          setProfileCompletion(updated.profile_completion || updated.profileCompletion);
        }
      }
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError("Failed to persist changes to the database. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput("");
      setShowAddSkill(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'NV';

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Candidate Profile</h1>
          <p className="text-xs text-slate-400">Authoritative career details used for deterministic ATS matching.</p>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile changes successfully persisted to PostgreSQL database.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Summary Card */}
      <div className="p-6 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xl text-primary shrink-0 shadow-sm">
            {initials}
          </div>

          <div className="space-y-1 flex-1">
            {isEditing ? (
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="text-lg font-bold bg-slate-900 border-slate-700 text-slate-100 h-9 rounded-xl max-w-sm"
              />
            ) : (
              <h2 className="text-xl font-bold text-slate-100">{fullName || 'Engineering Candidate'}</h2>
            )}

            {isEditing ? (
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Professional Headline"
                className="text-xs bg-slate-900 border-slate-700 text-slate-300 h-8 rounded-xl max-w-md mt-1"
              />
            ) : (
              <p className="text-sm font-medium text-slate-300">{headline || 'Software Engineer'}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {isEditing ? (
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location (e.g. San Francisco, CA)"
                    className="text-xs bg-slate-900 border-slate-700 text-slate-300 h-7 rounded-lg w-48"
                  />
                ) : (
                  location || 'Remote'
                )}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {user?.email || 'candidate@swipex.io'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1 shrink-0 w-full sm:w-auto">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Profile Strength</span>
            <p className="text-lg font-mono font-bold text-emerald-400">{profileCompletion}</p>
          </div>
        </div>

        {/* Bio / About */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <Label className="text-xs font-semibold text-slate-300">About / Professional Summary</Label>
          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Summarize your engineering background, core domain expertise, and career focus..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none focus:border-primary resize-none"
            />
          ) : (
            <p className="text-xs text-slate-400 leading-relaxed">
              {bio || 'No summary provided yet. Click "Edit Profile" to add an overview of your engineering accomplishments.'}
            </p>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="p-6 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Technical Skills & Competencies</h3>
            <p className="text-xs text-slate-400">Used for automated role matching and ATS query scoring.</p>
          </div>
          {isEditing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddSkill(true)}
              className="h-8 text-xs font-semibold rounded-lg border-slate-700 bg-slate-800 text-slate-300"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Skill
            </Button>
          )}
        </div>

        {showAddSkill && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 animate-fade-in">
            <Input
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="e.g. Docker, Python, Kubernetes"
              className="h-8 text-xs bg-slate-800 border-slate-700"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
            />
            <Button size="sm" onClick={handleAddSkill} className="h-8 text-xs bg-primary">
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAddSkill(false)} className="h-8 text-xs">
              Cancel
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {skills.length === 0 ? (
            <p className="text-xs text-slate-500">No skills added yet.</p>
          ) : (
            skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-200"
              >
                <span>{skill}</span>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
