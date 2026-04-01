'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { signUp } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';

const passwordRequirements = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
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
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-[380px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {/* Logo */}
          <div className="text-center space-y-1 pb-2">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl"
            >
              💝
            </motion.div>
            <h1 className="text-2xl font-bold text-white mt-3">Create account</h1>
            <p className="text-[var(--text-secondary)] text-sm">Join Likewise for free</p>
          </div>

          <GlassCard className="p-7">
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
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                                i < passwordStrength
                                  ? strengthColors[passwordStrength - 1]
                                  : 'bg-[var(--border)]'
                              }`}
                            />
                          ))}
                        </div>
                        {passwordStrength > 0 && (
                          <p className="text-[0.7rem] text-[var(--text-tertiary)]">
                            {strengthLabels[passwordStrength - 1]}
                          </p>
                        )}
                      </div>
                      {/* Requirements */}
                      <div className="grid grid-cols-2 gap-1">
                        {passwordRequirements.map((req, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <div
                              className={`h-1.5 w-1.5 rounded-full flex-shrink-0 transition-colors ${
                                req.test(password) ? 'bg-emerald-400' : 'bg-[var(--surface-3)]'
                              }`}
                            />
                            <span
                              className={`text-[0.7rem] transition-colors ${
                                req.test(password) ? 'text-emerald-400' : 'text-[var(--text-muted)]'
                              }`}
                            >
                              {req.label}
                            </span>
                          </div>
                        ))}
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
                      <div className="bg-[#2a1520] border border-[#4a1a28] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm text-red-400">
                        {error}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)] text-center">{statusHint}</p>
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
                className="w-full mt-1"
              >
                Create account
              </Button>
            </form>
          </GlassCard>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[var(--pink-light)] hover:text-white transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
