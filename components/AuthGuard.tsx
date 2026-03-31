'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="space-y-4 text-center max-w-sm">
          <p className="text-white/80 text-lg font-semibold">We&apos;re having trouble verifying your session.</p>
          <p className="text-white/50 text-sm">Please try again. If the issue persists, sign back in.</p>
          <button
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
            onClick={() => router.replace('/login')}
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
