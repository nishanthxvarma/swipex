import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        background: '#060B12',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient top glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(37,99,235,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Subtle mid glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(191,232,255,0.018) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Auth card — glass L3 */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-8"
        style={{
          background: 'rgba(220,240,255,0.055)',
          backdropFilter: 'blur(36px)',
          WebkitBackdropFilter: 'blur(36px)',
          border: '1px solid rgba(190,225,255,0.16)',
          boxShadow: '0 0 0 1px rgba(190,225,255,0.08) inset, 0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Inner ambient glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: 'radial-gradient(ellipse at top, rgba(191,232,255,0.03) 0%, transparent 60%)' }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 mb-7">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.058)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(190,225,255,0.13)',
            }}
          >
            <Sparkles className="h-4 w-4" style={{ color: '#BFE8FF' }} />
          </div>
          <span className="text-[20px] font-bold tracking-tight" style={{ color: '#F5FAFF' }}>
            SwipeX
          </span>
        </div>

        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}
