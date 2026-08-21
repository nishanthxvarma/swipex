'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Mail, Building2, User, Shield, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@swipex/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['JOB_SEEKER', 'RECRUITER', 'ADMIN']),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const roles = [
  {
    id: 'JOB_SEEKER',
    title: 'Candidate',
    icon: User,
  },
  {
    id: 'RECRUITER',
    title: 'Recruiter',
    icon: Building2,
  },
  {
    id: 'ADMIN',
    title: 'Admin',
    icon: Shield,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'JOB_SEEKER',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');
  const selectedRole = watch('role');

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const roleMap: Record<string, string> = {
        JOB_SEEKER: 'job_seeker',
        RECRUITER: 'recruiter',
        ADMIN: 'admin'
      };

      const res: any = await authApi.login({
        email: data.email,
        username: data.email,
        password: data.password,
        role: (roleMap[selectedRole] || 'job_seeker'),
      } as any);

      const backendRoleMap: Record<string, string> = {
        job_seeker: 'JOB_SEEKER',
        recruiter: 'RECRUITER',
        admin: 'ADMIN'
      };

      const rawRole = res.user?.role || res.role || roleMap[selectedRole] || 'JOB_SEEKER';
      const userId = res.user?.id ? String(res.user.id) : (res.user_id ? String(res.user_id) : '1');
      const userEmail = res.user?.email || res.username || data.email;
      const userFullName = res.user?.fullName || res.user?.full_name || userEmail.split('@')[0];

      const mappedUser = {
        id: userId,
        email: userEmail,
        fullName: userFullName,
        role: (backendRoleMap[rawRole] || rawRole) as any,
      };

      const mappedTokens = {
        accessToken: res.access_token || '',
        refreshToken: res.refresh_token || res.access_token || '',
      };

      loginStore(mappedUser, mappedTokens);

      if (mappedUser.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (mappedUser.role === 'RECRUITER') {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">Welcome back</h2>
        <p className="text-xs text-slate-400">
          Enter your credentials to access your SwipeX workspace.
        </p>
      </div>

      {loginError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {loginError}
        </div>
      )}

      {/* Role Selection Segmented Control */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-slate-300">Select Workspace</Label>
        <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#0C1119] border border-slate-800">
          {roles.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setValue('role', r.id as any)}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <r.icon className="w-3.5 h-3.5" />
                <span>{r.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Work / Personal Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={cn(
                "pl-9 bg-[#0C1119] border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-primary rounded-xl",
                errors.email && "border-rose-500"
              )}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-300">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={cn(
                "pl-9 pr-9 bg-[#0C1119] border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-primary rounded-xl",
                errors.password && "border-rose-500"
              )}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-400">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center space-x-2 pt-1">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
            className="border-slate-700 data-[state=checked]:bg-primary"
          />
          <Label htmlFor="rememberMe" className="text-xs text-slate-400 cursor-pointer">
            Remember this device
          </Label>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In to Workspace
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary hover:underline font-semibold">
          Create an account
        </Link>
      </div>
    </div>
  );
}
