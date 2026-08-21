import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'outline' | 'destructive' | 'secondary' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer';

    const variants: Record<string, string> = {
      default:
        'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/18 hover:border-primary/35 hover:shadow-[0_0_20px_var(--glow-color)] active:scale-[0.98]',
      primary:
        'bg-primary text-primary-foreground font-semibold hover:bg-primary-hover hover:shadow-[0_0_24px_var(--glow-color)] active:scale-[0.98]',
      ghost:
        'text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-[0.97]',
      outline:
        'border border-border text-foreground bg-transparent hover:bg-secondary hover:border-primary/40 active:scale-[0.98]',
      glass:
        'glass-2 text-foreground hover:border-primary/40 active:scale-[0.98]',
      secondary:
        'bg-secondary text-secondary-foreground border border-border/40 hover:bg-secondary/80 hover:text-foreground active:scale-[0.97]',
      destructive:
        'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 active:scale-[0.98]',
    };

    const sizes: Record<string, string> = {
      default: 'h-9 rounded-lg px-4 text-sm gap-1.5',
      sm: 'h-8 rounded-lg px-3 text-xs gap-1',
      xs: 'h-6 rounded-md px-2 text-xs gap-1',
      lg: 'h-11 rounded-xl px-6 text-sm gap-2',
      icon: 'h-9 w-9 rounded-lg',
    };

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(base, variants[variant] ?? variants.default, sizes[size] ?? sizes.default, className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
