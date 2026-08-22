'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  Edit2,
  Save,
  Check,
  AlertTriangle,
  Loader2,
  Phone,
  Layers,
  Award,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { usersApi, companiesApi, jobsApi } from '@swipex/api';
import { useUserProfile } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/hooks/queries';

export default function RecruiterProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: isProfileLoading } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recruiter fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [title, setTitle] = useState((user as any)?.headline || 'Head of Talent Acquisition');
  const [location, setLocation] = useState((user as any)?.location || 'San Francisco, CA');
  const [bio, setBio] = useState((user as any)?.bio || 'Leading technical recruiting and engineering talent strategy.');
  const [phone, setPhone] = useState((user as any)?.phone || '+1 (555) 019-2834');

  // Company fields
  const [companyName, setCompanyName] = useState('SwipeX Technologies');
  const [companyIndustry, setCompanyIndustry] = useState('Software & Artificial Intelligence');
  const [companySize, setCompanySize] = useState('50-200');
  const [companyWebsite, setCompanyWebsite] = useState('https://swipex.io');
  const [companyDescription, setCompanyDescription] = useState(
    'SwipeX is the next-generation AI-powered career platform connecting top engineering talent with high-growth tech companies.'
  );

  // Live stats
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [totalApplicantsCount, setTotalApplicantsCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const [jobs, pipeline] = await Promise.allSettled([
          jobsApi.getRecruiterJobs(1, 50),
          jobsApi.getRecruiterPipeline(),
        ]);
        if (jobs.status === 'fulfilled' && Array.isArray(jobs.value)) {
          setActiveJobsCount(jobs.value.filter((j) => j.isActive !== false).length);
        }
        if (pipeline.status === 'fulfilled' && Array.isArray(pipeline.value)) {
          setTotalApplicantsCount(pipeline.value.length);
        }
      } catch (err) {
        console.warn('Failed to load profile metrics:', err);
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    if (profileData && !isEditing) {
      if (profileData.fullName || profileData.full_name) {
        setFullName(profileData.fullName || profileData.full_name);
      }
      if (profileData.headline) setTitle(profileData.headline);
      if (profileData.location) setLocation(profileData.location);
      if (profileData.bio) setBio(profileData.bio);
      if (profileData.phone) setPhone(profileData.phone);
    }
  }, [profileData, isEditing]);

  const getUserInitials = (name: string) => {
    if (!name) return 'R';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        fullName,
        headline: title,
        location,
        bio,
        phone,
      };

      const updated = await usersApi.updateProfile(payload);

      if (user) {
        setUser({
          ...user,
          fullName: updated?.fullName || updated?.full_name || fullName,
          headline: updated?.headline || title,
          location: updated?.location || location,
          bio: updated?.bio || bio,
        });
      }

      queryClient.setQueryData(QUERY_KEYS.profile, updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save recruiter profile:', err);
      setError('Failed to update recruiter profile. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-200">
      {/* Header Profile Banner */}
      <div className="glass-2 border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-bold text-3xl text-primary shadow-lg shrink-0">
              {getUserInitials(fullName)}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {fullName || 'Recruiter'}
                </h1>
                <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
                  Verified Employer
                </span>
              </div>
              <p className="text-sm font-semibold text-primary">{title}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" /> {companyName}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> {user?.email || 'recruiter@swipex.io'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving} className="rounded-xl">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving} className="rounded-xl font-bold">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save Changes
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="rounded-xl font-semibold">
                <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
              </Button>
            )}
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-xs font-semibold text-success flex items-center gap-2">
            <Check className="w-4 h-4" /> Recruiter profile updated successfully!
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}
      </div>

      {/* Recruiter Stats & Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-1 border border-border rounded-2xl p-5 space-y-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Active Requisitions</span>
          <p className="text-2xl font-bold text-foreground">{activeJobsCount} Positions</p>
          <p className="text-[11px] text-muted-foreground">Currently published &amp; accepting applicants</p>
        </div>

        <div className="glass-1 border border-border rounded-2xl p-5 space-y-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Applications Sourced</span>
          <p className="text-2xl font-bold text-foreground">{totalApplicantsCount} Candidates</p>
          <p className="text-[11px] text-muted-foreground">Processed through hiring pipeline</p>
        </div>

        <div className="glass-1 border border-border rounded-2xl p-5 space-y-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Hiring Focus</span>
          <p className="text-2xl font-bold text-foreground">Full-Stack &amp; AI</p>
          <p className="text-[11px] text-muted-foreground">Software Engineering &amp; Platform Architecture</p>
        </div>
      </div>

      {/* Details & Company Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recruiter Details Form */}
        <div className="lg:col-span-6 glass-1 border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2 border-b border-border pb-3">
            <User className="w-4 h-4 text-primary" /> Recruiter Professional Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-2 border border-border text-sm text-foreground disabled:opacity-75 focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Position / Title
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-2 border border-border text-sm text-foreground disabled:opacity-75 focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Office Location
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-2 border border-border text-sm text-foreground disabled:opacity-75 focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Professional Bio
              </label>
              <textarea
                rows={3}
                disabled={!isEditing}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-2 border border-border text-sm text-foreground disabled:opacity-75 focus:border-primary focus:outline-hidden resize-none"
              />
            </div>
          </div>
        </div>

        {/* Associated Company Information */}
        <div className="lg:col-span-6 glass-1 border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2 border-b border-border pb-3">
            <Building2 className="w-4 h-4 text-primary" /> Associated Organization
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Company Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-2 border border-border text-sm text-foreground disabled:opacity-75 focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-2 border border-border text-xs text-foreground disabled:opacity-75 focus:border-primary focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Company Size
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-2 border border-border text-xs text-foreground disabled:opacity-75 focus:border-primary focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Company Website
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-2 border border-border text-sm text-foreground disabled:opacity-75 focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Company Overview
              </label>
              <textarea
                rows={3}
                disabled={!isEditing}
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-2 border border-border text-sm text-foreground disabled:opacity-75 focus:border-primary focus:outline-hidden resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
