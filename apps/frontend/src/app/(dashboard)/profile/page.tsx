'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, MapPin, Briefcase, Code, FileText, Link as LinkIcon, Edit2, Download, ExternalLink, Plus, Check, Save, Upload, Sparkles, X, Loader2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useResumeStore } from '@/stores/resume-store';
import { Button } from '@/components/ui/button';
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
    { id: 2, name: "GitHub", url: "https://github.com", handle: "github.com", colorClass: "bg-foreground/10 text-[#F5FAFF]" },
  ]);

  const [resumeFileName, setResumeFileName] = useState("");
  const [atsScore, setAtsScore] = useState(0);

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

  useEffect(() => {
    if (activeResume?.parsedData && skills.length === 0) {
      const p = activeResume.parsedData;
      if (!fullName) setFullName(p.personalInfo?.name || "");
      if (!headline) setHeadline(p.personalInfo?.headline || "");
      if (!location) setLocation(p.personalInfo?.location || "");
      if (!bio) setBio((p.personalInfo as any)?.summary || p.personalInfo?.headline || "");
      
      const extractedSkills = p.skills ? (Object.values(p.skills).flat() as string[]) : [];
      if (extractedSkills.length > 0 && skills.length === 0) {
        setSkills(extractedSkills);
      }
      
      if (experiences.length === 0 && p.experience) {
        const extractedExp = p.experience.map((exp: any, idx: number) => ({
          id: exp.id || idx,
          title: exp.role || "",
          company: exp.company || "",
          date: exp.duration || "",
          description: exp.description || "",
        }));
        setExperiences(extractedExp);
      }
      setAtsScore(activeResume.atsScore || 0);
      setResumeFileName(activeResume.filename || "Resume.pdf");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeResume]);

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

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

      if (user) {
        setUser({
          ...user,
          fullName: updated?.fullName || updated?.full_name || fullName,
          headline: updated?.headline || headline,
          location: updated?.location || location,
          bio: updated?.bio || bio,
          skills: updated?.skills || skills,
          experiences: updated?.experiences || experiences,
          socialLinks: updated?.socialLinks || updated?.social_links || socialLinks
        });
      }

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError(err?.message || "Failed to persist profile changes to backend database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput("");
      setShowAddSkill(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
      await uploadResume(file);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-[#66788A] animate-pulse">Loading candidate profile from database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-8">
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <Check className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Profile changes successfully persisted to backend database!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-2xl text-destructive font-semibold text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="glass-1 border rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start relative z-10">
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-background">
              {getUserInitials(fullName)}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-110 transition-transform"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-3">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-2xl font-bold bg-background border px-3 py-1.5 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Full Name"
                />
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full text-sm font-semibold bg-background border px-3 py-1.5 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Professional Headline"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs font-medium bg-background border px-3 py-1.5 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Location"
                />
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={handleSaveProfile} disabled={isSaving} className="rounded-xl font-bold">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1.5" /> Save Changes
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving} className="rounded-xl font-bold">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight">{fullName || "Candidate Name"}</h1>
                <p className="text-lg font-semibold text-primary">{headline || "Software Engineer"}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs font-semibold mt-2">
                  <span className="flex items-center gap-1.5 glass-1 px-3 py-1.5 rounded-full"><MapPin className="w-3.5 h-3.5 text-primary" /> {location || "Remote"}</span>
                  <span className="flex items-center gap-1.5 glass-1 px-3 py-1.5 rounded-full"><Mail className="w-3.5 h-3.5 text-primary" /> {user?.email || "candidate@swipex.ai"}</span>
                </div>
              </>
            )}
          </div>
          
          <div className="w-32 h-32 flex flex-col items-center justify-center">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset={226 - (226 * (atsScore || 85)) / 100} className="text-emerald-500 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-lg font-bold">
                {atsScore || 85}%
              </div>
            </div>
            <span className="text-xs text-[#66788A] mt-2 font-semibold">ATS Match Score</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-8">
          {/* About */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6 text-primary" /> About Me</h2>
              <button onClick={() => setIsEditing(!isEditing)} className="text-[#66788A] hover:text-primary"><Edit2 className="w-4 h-4" /></button>
            </div>
            <div className="glass-1 border rounded-2xl p-6 text-[#66788A] leading-relaxed text-sm sm:text-base">
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full h-32 bg-background border p-3 rounded-xl text-[#F5FAFF] text-sm font-medium outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell recruiters about yourself..."
                />
              ) : (
                bio || "No summary provided. Click edit to add your bio!"
              )}
            </div>
          </section>

          {/* Experience Timeline */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="w-6 h-6 text-primary" /> Experience</h2>
            </div>
            <div className="glass-1 border rounded-2xl p-6 space-y-6 shadow-xs">
              {experiences.length === 0 ? (
                <p className="text-xs text-[#66788A] italic">No work experience listed yet.</p>
              ) : (
                experiences.map((exp, index) => (
                  <div key={exp.id || index} className={cn("relative pl-6 border-l-2 border-primary/20", index !== experiences.length - 1 && "pb-6")}>
                    <div className="absolute w-3.5 h-3.5 bg-primary rounded-full -left-[8px] top-1.5 border-2 border-background" />
                    <h3 className="font-bold text-lg">{exp.title}</h3>
                    <div className="text-primary font-semibold text-sm mb-1">{exp.company}</div>
                    <div className="text-xs text-[#66788A] mb-3 font-medium">{exp.date}</div>
                    <p className="text-xs text-[#66788A] leading-relaxed">{exp.description}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Skills Tag Cloud */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2"><Code className="w-5 h-5 text-primary" /> Skills ({skills.length})</h2>
              <button onClick={() => setShowAddSkill(!showAddSkill)} className="text-primary hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="glass-1 border rounded-2xl p-6 space-y-4 shadow-xs">
              {showAddSkill && (
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="e.g. React, Python"
                    className="flex-1 px-3 py-1.5 bg-background border rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button type="submit" size="sm" className="rounded-xl text-xs font-bold px-3">Add</Button>
                </form>
              )}

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 glass-1 text-secondary-foreground rounded-xl text-xs font-semibold hover:glass-1/80 transition-colors"
                  >
                    {skill}
                    {isEditing && (
                      <button onClick={() => handleRemoveSkill(skill)} className="hover:text-destructive text-[#66788A]">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Resume Upload */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Active Resume</h2>
            <div className="glass-1 border rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between p-3 glass-1/50 rounded-xl border border-border">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-8 h-8 text-primary shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-xs truncate">{resumeFileName || "Candidate_Resume.pdf"}</div>
                    <div className="text-[10px] text-[#66788A]">Parsed & Indexed</div>
                  </div>
                </div>
                <label className="p-2 hover:bg-background rounded-lg cursor-pointer transition-colors text-primary" title="Upload new resume">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
              {isUploading && (
                <div className="flex items-center gap-2 text-xs font-semibold text-primary animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Parsing resume with AI...
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
