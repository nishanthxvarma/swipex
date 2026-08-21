import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg px-3 py-2 text-sm',
          'bg-white/5 border border-[rgba(190,225,255,0.12)]',
          'text-[#F5FAFF] placeholder:text-[#66788A]',
          'backdrop-blur-md',
          'transition-all duration-200',
          'focus-visible:outline-none',
          'focus-visible:border-[rgba(191,232,255,0.35)]',
          'focus-visible:shadow-[0_0_0_3px_rgba(191,232,255,0.08),0_0_12px_rgba(191,232,255,0.06)]',
          'hover:border-[rgba(190,225,255,0.20)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
