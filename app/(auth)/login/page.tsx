'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const canSubmit = username.trim().length >= 3 && password.length > 0 && !loading;

  const getErrorMessage = (err: unknown) => {
    const errorLike = err as { code?: string; message?: string };
    if (
      errorLike?.code === 'auth/invalid-credential' ||
      errorLike?.code === 'auth/wrong-password'
    ) {
      return 'Invalid username or password';
    }
    if (errorLike?.code === 'auth/too-many-requests') {
      return 'Too many attempts. Please try again later.';
    }
    if (errorLike?.message) return errorLike.message;
    if (err instanceof Error) return err.message;
    return 'Failed to sign in';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(username.trim(), password);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lw-page px-5">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px] space-y-8 relative z-10"
      >
        {/* Wordmark */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold gradient-text">Likewise</h1>
          <div>
            <p className="text-[1.25rem] font-bold" style={{ color: 'var(--text-primary)' }}>Sign in to Likewise</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Enter your credentials to continue</p>
          </div>
        </div>

        {/* Form card */}
        <div
          className="rounded-[var(--radius-xl)] p-7 space-y-5"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-4 py-3 text-sm"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#f87171',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!canSubmit}
              className="w-full font-semibold mt-1"
            >
              Sign in →
            </Button>
          </form>
        </div>

        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          New here?{' '}
          <Link
            href="/signup"
            className="font-semibold transition-colors"
            style={{ color: 'var(--blue-light)' }}
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
