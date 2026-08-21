'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Eye, EyeOff, Loader2, Mail, Shield, User, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@swipex/api';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['JOB_SEEKER', 'RECRUITER', 'ADMIN']),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms of service',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

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

export default function SignupPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'JOB_SEEKER',
      terms: false,
    },
  });

  const selectedRole = watch('role');
  const termsValue = watch('terms');

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setSignupError(null);
    try {
      const roleMap: Record<string, string> = {
        JOB_SEEKER: 'job_seeker',
        RECRUITER: 'recruiter',
        ADMIN: 'admin'
      };

      const res: any = await authApi.register({
        fullName: data.fullName,
        email: data.email,
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
      const userFullName = res.user?.fullName || res.user?.full_name || data.fullName;

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
      console.error('Signup error:', error);
      setSignupError(error.message || 'An error occurred during registration. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">Create your account</h2>
        <p className="text-xs text-slate-400">
          Get started with SwipeX to discover jobs or recruit talent.
        </p>
      </div>

      {signupError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {signupError}
        </div>
      )}

      {/* Role Selector */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-slate-300">Account Type</Label>
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
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-semibold text-slate-300">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              id="fullName"
              placeholder="Nishanth Varma"
              className={cn(
                "pl-9 bg-[#0C1119] border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-primary rounded-xl",
                errors.fullName && "border-rose-500"
              )}
              {...register('fullName')}
            />
          </div>
          {errors.fullName && (
            <p className="text-[11px] text-rose-400">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Email Address</Label>
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
          <Label htmlFor="password" className="text-xs font-semibold text-slate-300">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters, 1 uppercase, 1 number"
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-300">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              className={cn(
                "pl-9 bg-[#0C1119] border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-primary rounded-xl",
                errors.confirmPassword && "border-rose-500"
              )}
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms checkbox */}
        <div className="flex items-center space-x-2 pt-1">
          <Checkbox
            id="terms"
            checked={termsValue}
            onCheckedChange={(checked) => setValue('terms', checked as boolean)}
            className="border-slate-700 data-[state=checked]:bg-primary"
          />
          <Label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer">
            I agree to the Terms of Service and Privacy Policy
          </Label>
        </div>
        {errors.terms && (
          <p className="text-[11px] text-rose-400">{errors.terms.message}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create Account
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline font-semibold">
          Sign in
        </Link>
      </div>
    </div>
  );
}
