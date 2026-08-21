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
          'bg-input border border-border',
          'text-foreground placeholder:text-muted-foreground',
          'backdrop-blur-md',
          'transition-all duration-200',
          'focus-visible:outline-none',
          'focus-visible:border-primary/50',
          'focus-visible:ring-2 focus-visible:ring-ring/40',
          'hover:border-primary/30',
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
