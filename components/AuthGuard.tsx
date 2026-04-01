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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl">💝</div>
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="space-y-5 text-center max-w-xs">
          <div className="text-4xl">⚠️</div>
          <div className="space-y-2">
            <p className="text-white text-[1.0625rem] font-semibold">
              Session error
            </p>
            <p className="text-white/45 text-sm leading-relaxed">
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
