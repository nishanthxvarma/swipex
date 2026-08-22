'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Code,
  FileText,
  Edit2,
  Save,
  Upload,
  Sparkles,
  X,
  Plus,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useResumeStore } from '@/stores/resume-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usersApi } from '@swipex/api';
import { useUserProfile, useActiveResume } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/hooks/queries';

import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.role?.toUpperCase() === 'RECRUITER') {
      router.replace('/recruiter/profile');
    }
  }, [user, router]);

  const { data: profileData, isLoading: isProfileQueryLoading } = useUserProfile();
  const { data: activeResumeData } = useActiveResume();
  const { uploadResume, isUploading } = useResumeStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State initialized from cached user immediately (0ms perceived load)
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [experiences, setExperiences] = useState<any[]>(user?.experiences || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);

  const [socialLinks, setSocialLinks] = useState(
    user?.socialLinks || [
      { id: 1, name: 'LinkedIn', url: 'https://linkedin.com', handle: 'linkedin.com' },
      { id: 2, name: 'GitHub', url: 'https://github.com', handle: 'github.com' },
    ]
  );

  const [resumeFileName, setResumeFileName] = useState('');
  const [atsScore, setAtsScore] = useState(0);

  // Synchronize when server profile data arrives without wiping user input
  useEffect(() => {
    if (profileData && !isEditing) {
      if (profileData.fullName || profileData.full_name) {
        setFullName(profileData.fullName || profileData.full_name);
      }
      if (profileData.headline) setHeadline(profileData.headline);
      if (profileData.location) setLocation(profileData.location);
      if (profileData.bio) setBio(profileData.bio);
      if (profileData.skills && profileData.skills.length > 0) {
        setSkills(profileData.skills);
      }
      if (profileData.experiences && profileData.experiences.length > 0) {
        setExperiences(profileData.experiences);
      }
      if (profileData.socialLinks && profileData.socialLinks.length > 0) {
        setSocialLinks(profileData.socialLinks);
      } else if (profileData.social_links && profileData.social_links.length > 0) {
        setSocialLinks(profileData.social_links);
      }
    }
  }, [profileData, isEditing]);

  // Synchronize active resume
  useEffect(() => {
    if (activeResumeData) {
      setAtsScore(activeResumeData.atsScore || 0);
      setResumeFileName(activeResumeData.filename || activeResumeData.originalName || 'Resume.pdf');
    }
  }, [activeResumeData]);

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
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
        socialLinks,
      };

      const updated = await usersApi.updateProfile(payload);

      if (user) {
        const updatedUser = {
          ...user,
          fullName: updated?.fullName || updated?.full_name || fullName,
          headline: updated?.headline || headline,
          location: updated?.location || location,
          bio: updated?.bio || bio,
          skills: updated?.skills || skills,
          experiences: updated?.experiences || experiences,
          socialLinks: updated?.socialLinks || updated?.social_links || socialLinks,
        };
        setUser(updatedUser);
      }

      // Invalidate React Query cache
      queryClient.setQueryData(QUERY_KEYS.profile, updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError(err?.message || 'Failed to persist profile changes to backend database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
      setShowAddSkill(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'docx'].includes(ext || '')) {
        setError('Unsupported file format. Please upload a PDF or DOCX file.');
        return;
      }
      setResumeFileName(file.name);
      await uploadResume(file);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeResume });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-8 animate-in fade-in duration-200">
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
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-xl border-4 border-background">
              {getUserInitials(fullName || user?.fullName || 'User')}
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
                <h1 className="text-3xl font-bold tracking-tight">{fullName || user?.fullName || 'Candidate Name'}</h1>
                <p className="text-lg font-semibold text-primary">{headline || user?.headline || 'Software Engineer'}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs font-semibold mt-2">
                  <span className="flex items-center gap-1.5 glass-1 px-3 py-1.5 rounded-full">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {location || user?.location || 'Remote'}
                  </span>
                  <span className="flex items-center gap-1.5 glass-1 px-3 py-1.5 rounded-full">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {user?.email || 'candidate@swipex.ai'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="w-32 h-32 flex flex-col items-center justify-center">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * (atsScore || 85)) / 100}
                  className="text-emerald-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-lg font-bold">
                {atsScore > 0 ? `${atsScore}%` : '85%'}
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
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="w-6 h-6 text-primary" /> About Me
              </h2>
              <button onClick={() => setIsEditing(!isEditing)} className="text-[#66788A] hover:text-primary">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="glass-1 border rounded-2xl p-6 text-[#66788A] leading-relaxed text-sm sm:text-base">
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full h-32 bg-background border p-3 rounded-xl text-foreground text-sm font-medium outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell recruiters about yourself..."
                />
              ) : (
                bio || user?.bio || 'No summary provided. Click edit to add your bio!'
              )}
            </div>
          </section>

          {/* Experience Timeline */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary" /> Experience
              </h2>
            </div>
            <div className="glass-1 border rounded-2xl p-6 space-y-6 shadow-xs">
              {experiences.length === 0 ? (
                <p className="text-xs text-[#66788A] italic">No work experience listed yet.</p>
              ) : (
                experiences.map((exp, index) => (
                  <div
                    key={exp.id || index}
                    className={cn('relative pl-6 border-l-2 border-primary/20', index !== experiences.length - 1 && 'pb-6')}
                  >
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
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" /> Skills ({skills.length})
              </h2>
              <button
                onClick={() => setShowAddSkill(!showAddSkill)}
                className="text-primary hover:scale-110 transition-transform"
              >
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
                  <Button type="submit" size="sm" className="rounded-xl text-xs font-bold px-3">
                    Add
                  </Button>
                </form>
              )}

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 glass-1 text-foreground rounded-xl text-xs font-semibold hover:glass-1/80 transition-colors"
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
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Active Resume
            </h2>
            <div className="glass-1 border rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between p-3 glass-1/50 rounded-xl border border-border">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-8 h-8 text-primary shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-xs truncate">{resumeFileName || 'Candidate_Resume.pdf'}</div>
                    <div className="text-[10px] text-[#66788A]">Parsed &amp; Indexed</div>
                  </div>
                </div>
                <label
                  className="p-2 hover:bg-background rounded-lg cursor-pointer transition-colors text-primary"
                  title="Upload new resume"
                >
                  <Upload className="w-4 h-4" />
                  <input type="file" accept=".pdf,.docx" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (activeResumeData?.parsedData) {
                      const pd = activeResumeData.parsedData;
                      if (pd.personalInfo?.name && (!fullName || fullName === 'Candidate Name')) setFullName(pd.personalInfo.name);
                      if (pd.personalInfo?.headline && !headline) setHeadline(pd.personalInfo.headline);
                      if (pd.personalInfo?.location && !location) setLocation(pd.personalInfo.location);
                      if ((pd.personalInfo?.bio || (pd as any).summary) && !bio) setBio(pd.personalInfo?.bio || (pd as any).summary);
                      
                      const extracted: string[] = [];
                      if (pd.skills) {
                        Object.values(pd.skills).forEach((list: any) => {
                          if (Array.isArray(list)) extracted.push(...list);
                        });
                      }
                      const merged = Array.from(new Set([...skills, ...extracted]));
                      setSkills(merged);

                      if (pd.experience && pd.experience.length > 0 && experiences.length === 0) {
                        setExperiences(pd.experience);
                      }

                      try {
                        await usersApi.updateProfile({
                          fullName: pd.personalInfo?.name || fullName,
                          headline: pd.personalInfo?.headline || headline,
                          location: pd.personalInfo?.location || location,
                          bio: pd.personalInfo?.bio || (pd as any).summary || bio,
                          skills: merged,
                          experiences: pd.experience || experiences,
                        } as any);
                        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 3000);
                      } catch (e) {
                        console.error('Error syncing profile:', e);
                      }
                    }
                  }}
                  className="w-full rounded-xl text-xs font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  Sync Profile with Active Resume
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
