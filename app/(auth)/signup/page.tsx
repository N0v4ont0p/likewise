'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { signUp } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

const passwordRequirements = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

const strengthColors = ['#ef4444', '#f97316', '#eab308', '#10b981'];
const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusHint, setStatusHint] = useState('');

  const passwordStrength = passwordRequirements.filter((r) => r.test(password)).length;
  const isPasswordValid = passwordStrength === passwordRequirements.length;
  const canSubmit =
    username.trim().length >= 3 &&
    isPasswordValid &&
    password === confirmPassword &&
    !loading;

  const getErrorMessage = (err: unknown) => {
    if (
      err &&
      typeof err === 'object' &&
      'message' in err &&
      typeof (err as { message?: string }).message === 'string'
    ) {
      return (err as { message: string }).message;
    }
    return 'Failed to create account. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setStatusHint('Creating your account…');

    try {
      await signUp(username.trim(), password);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setStatusHint('');
    }
  };

  return (
    <div className="lw-page px-5 py-10">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,92,252,0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px] space-y-8 relative z-10"
      >
        {/* Logo */}
        <div className="text-center space-y-4">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex"
          >
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7c5cfc, #c026d3)',
                boxShadow: '0 0 32px rgba(124,92,252,0.4)',
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </motion.div>
          <div>
            <h1 className="text-heading text-white">Create account</h1>
            <p className="text-[0.9rem] mt-2" style={{ color: 'var(--text-secondary)' }}>
              Join Likewise for free
            </p>
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
              hint="3–20 characters: letters, numbers, underscores"
              required
            />

            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <AnimatePresence>
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    {/* Strength bar */}
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-[3px] flex-1 rounded-full transition-all duration-300"
                            style={{
                              background: i < passwordStrength
                                ? strengthColors[passwordStrength - 1]
                                : 'var(--border)',
                            }}
                          />
                        ))}
                      </div>
                      {passwordStrength > 0 && (
                        <p
                          className="text-[0.6875rem] font-medium"
                          style={{ color: strengthColors[passwordStrength - 1] }}
                        >
                          {strengthLabels[passwordStrength - 1]}
                        </p>
                      )}
                    </div>
                    {/* Requirements */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {passwordRequirements.map((req, i) => {
                        const met = req.test(password);
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full shrink-0 transition-colors duration-300"
                              style={{ background: met ? '#10b981' : 'var(--surface-3)' }}
                            />
                            <span
                              className="text-[0.6875rem] transition-colors duration-300"
                              style={{ color: met ? '#10b981' : 'var(--text-muted)' }}
                            >
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              error={
                confirmPassword && password !== confirmPassword
                  ? 'Passwords do not match'
                  : undefined
              }
              required
            />

            <AnimatePresence>
              {(error || statusHint) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {error ? (
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
                  ) : (
                    <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                      {statusHint}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!canSubmit}
              className="w-full font-bold text-[1rem] mt-1"
            >
              Create account →
            </Button>
          </form>
        </div>

        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold transition-colors"
            style={{ color: 'var(--pink-light)' }}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}


