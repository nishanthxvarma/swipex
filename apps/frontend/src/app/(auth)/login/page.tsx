'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Building2, User, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/auth-store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['JOB_SEEKER', 'RECRUITER']),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const isRecruiter = data.role === 'RECRUITER';
      loginStore(
        {
          id: isRecruiter ? 'rec_' + Date.now() : 'usr_' + Date.now(),
          email: data.email,
          fullName: data.email.split('@')[0] || (isRecruiter ? 'Recruiter' : 'Candidate'),
          role: data.role,
        },
        {
          accessToken: 'mock_jwt_access_token',
          refreshToken: 'mock_jwt_refresh_token',
        }
      );

      if (isRecruiter) {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: 'JOB_SEEKER' | 'RECRUITER') => {
    setIsLoading(true);
    setTimeout(() => {
      const isRecruiter = role === 'RECRUITER';
      loginStore(
        {
          id: isRecruiter ? 'rec_demo_101' : 'usr_demo_101',
          email: isRecruiter ? 'recruiter@techcorp.com' : 'candidate@swipex.io',
          fullName: isRecruiter ? 'Sarah Jenkins (Recruiter)' : 'Nishanth Varma',
          role: role,
        },
        {
          accessToken: 'mock_jwt_access_token',
          refreshToken: 'mock_jwt_refresh_token',
        }
      );
      if (isRecruiter) {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/dashboard');
      }
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Log in to access your individual candidate or employer workspace.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-muted rounded-2xl border">
        <button
          type="button"
          onClick={() => setValue('role', 'JOB_SEEKER')}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all',
            selectedRole === 'JOB_SEEKER'
              ? 'bg-card text-foreground shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <User className="w-4 h-4 text-primary" />
          Job Seeker Login
        </button>
        <button
          type="button"
          onClick={() => setValue('role', 'RECRUITER')}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all',
            selectedRole === 'RECRUITER'
              ? 'bg-card text-foreground shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Building2 className="w-4 h-4 text-primary" />
          Recruiter Portal
        </button>
      </div>

      {/* Quick Demo Login Triggers */}
      <div className="p-3 bg-secondary/50 rounded-2xl border space-y-2">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
          Instant Demo One-Tap Login
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickDemoLogin('JOB_SEEKER')}
            disabled={isLoading}
            className="rounded-xl text-xs font-semibold"
          >
            Candidate Demo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickDemoLogin('RECRUITER')}
            disabled={isLoading}
            className="rounded-xl text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
          >
            Recruiter Demo
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            {selectedRole === 'RECRUITER' ? 'Work Email' : 'Email Address'}
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder={selectedRole === 'RECRUITER' ? 'hr@company.com' : 'name@example.com'}
              {...register('email')}
              className={cn('h-11 pl-10 rounded-xl', errors.email && 'border-destructive')}
            />
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          </div>
          {errors.email && (
            <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={cn('h-11 pl-10 pr-10 rounded-xl', errors.password && 'border-destructive')}
            />
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-semibold text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
            />
            <label htmlFor="remember" className="text-xs font-semibold text-muted-foreground cursor-pointer">
              Remember me
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 rounded-xl font-bold shadow-md" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loggin in...
            </>
          ) : (
            <>
              Sign In as {selectedRole === 'RECRUITER' ? 'Recruiter' : 'Candidate'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-bold text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </motion.div>
  );
}
