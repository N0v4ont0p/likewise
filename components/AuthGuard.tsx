'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="md" />
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5" style={{ background: 'var(--bg)' }}>
        <div className="space-y-5 text-center max-w-xs">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="space-y-2">
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Session error</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We couldn&apos;t verify your session. Please sign in again.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => router.replace('/login')}>
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
