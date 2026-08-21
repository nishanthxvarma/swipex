'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Building2, Eye, EyeOff, Loader2, Mail, Shield, User, UserCheck } from 'lucide-react';
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
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const roles = [
  {
    id: 'JOB_SEEKER',
    title: 'Job Seeker',
    description: 'Looking for a new role',
    icon: User,
  },
  {
    id: 'RECRUITER',
    title: 'Recruiter',
    description: 'Hiring top talent',
    icon: Building2,
  },
  {
    id: 'ADMIN',
    title: 'Admin',
    description: 'Platform management',
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

  const passwordValue = watch('password');
  const selectedRole = watch('role');
  const termsValue = watch('terms');

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 4);
  };

  const strength = getPasswordStrength(passwordValue);

  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-muted';
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setSignupError(null);
    try {
      const roleMap: Record<string, string> = {
        JOB_SEEKER: 'job_seeker',
        RECRUITER: 'recruiter',
        ADMIN: 'admin'
      };

      const res = await authApi.register({
        email: data.email,
        password: data.password,
        role: (roleMap[data.role] || 'job_seeker') as any,
        fullName: data.fullName,
      });

      const backendRoleMap: Record<string, string> = {
        job_seeker: 'JOB_SEEKER',
        recruiter: 'RECRUITER',
        admin: 'ADMIN'
      };

      const mappedUser = {
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.fullName || data.fullName,
        role: (backendRoleMap[res.user.role] || res.user.role) as any,
      };

      const mappedTokens = {
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
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
      console.error(error);
      setSignupError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground">
          Join SwipeX to find your next opportunity
        </p>
      </div>

{signupError && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold animate-pulse">
          {signupError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role selection */}
        <div className="space-y-2">
          <Label>I am a...</Label>
          <div className="grid grid-cols-3 gap-3">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setValue('role', role.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground/50 text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-semibold">{role.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullName"
              placeholder="Nishanth Varma"
              className={cn("pl-9", errors.fullName && "border-destructive")}
              {...register('fullName')}
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="nishvarma2007@gmail.com"
              className={cn("pl-9", errors.email && "border-destructive")}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={cn(errors.password && "border-destructive")}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Password strength indicator */}
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 w-full rounded-full transition-colors",
                  strength >= level ? getStrengthColor(strength) : "bg-muted"
                )}
              />
            ))}
          </div>

          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={cn(errors.confirmPassword && "border-destructive")}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="terms"
            checked={termsValue}
            onChange={(e) => setValue('terms', e.target.checked, { shouldValidate: true })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
          />
          <Label
            htmlFor="terms"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            I agree to the Terms of Service and Privacy Policy
          </Label>
        </div>
        {errors.terms && (
          <p className="text-sm text-destructive">{errors.terms.message}</p>
        )}

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </motion.div>
  );
}
