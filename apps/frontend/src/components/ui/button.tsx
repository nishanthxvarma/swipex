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
        'bg-[#BFE8FF]/10 text-[#BFE8FF] border border-[#BFE8FF]/18 hover:bg-[#BFE8FF]/16 hover:border-[#BFE8FF]/30 hover:shadow-[0_0_20px_rgba(191,232,255,0.10)] active:scale-[0.98]',
      primary:
        'bg-[#BFE8FF] text-[#060B12] font-semibold hover:bg-[#E0F5FF] hover:shadow-[0_0_24px_rgba(191,232,255,0.28)] active:scale-[0.98]',
      ghost:
        'text-[#9BAFC2] hover:bg-white/5 hover:text-[#F5FAFF] active:scale-[0.97]',
      outline:
        'border border-[rgba(190,225,255,0.14)] text-[#9BAFC2] bg-transparent hover:bg-white/5 hover:text-[#F5FAFF] hover:border-[rgba(190,225,255,0.22)] active:scale-[0.98]',
      glass:
        'bg-white/5 backdrop-blur-xl border border-[rgba(190,225,255,0.12)] text-[#F5FAFF] hover:bg-white/8 hover:border-[rgba(190,225,255,0.20)] active:scale-[0.98]',
      secondary:
        'bg-white/5 text-[#9BAFC2] border border-[rgba(190,225,255,0.08)] hover:bg-white/8 hover:text-[#F5FAFF] active:scale-[0.97]',
      destructive:
        'bg-[#FF7A90]/10 text-[#FF7A90] border border-[#FF7A90]/20 hover:bg-[#FF7A90]/18 active:scale-[0.98]',
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
