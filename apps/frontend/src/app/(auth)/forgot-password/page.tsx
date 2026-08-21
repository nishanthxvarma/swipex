'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle2, Loader2, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@swipex/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await authApi.forgotPassword({ email: data.email });
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setErrorMsg(error.message || 'Unable to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Link
          href="/login"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">Reset password</h2>
        <p className="text-xs text-slate-400">
          Enter the email address associated with your SwipeX account.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {isSubmitted ? (
        <div className="p-6 rounded-2xl bg-[#0C1119] border border-emerald-500/30 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">Check your inbox</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              If an account exists with that email, we have sent a secure password reset link.
            </p>
          </div>
          <Button
            asChild
            className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            <Link href="/login">Return to Sign In</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Account Email</Label>
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

          <Button
            type="submit"
            className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Send Reset Link
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
