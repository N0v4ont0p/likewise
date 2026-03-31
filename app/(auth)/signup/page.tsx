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
  const canSubmit = username.trim().length >= 3 && isPasswordValid && password === confirmPassword && !loading;

  const getErrorMessage = (err: unknown) => {
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: string }).message === 'string') {
      return (err as { message: string }).message;
    }
    return 'Failed to create account. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusHint('Checking your details...');

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setStatusHint('Creating your private space...');

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: 1.02 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.12),transparent),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.08),transparent)] blur-3xl" />
        <motion.div
          className="absolute -bottom-10 right-5 h-48 w-48 rounded-full bg-pink-500/20 blur-[120px]"
          animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="p-8 space-y-6 shadow-[0_20px_80px_rgba(236,72,153,0.15)]">
            <div className="text-center space-y-2">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="text-4xl"
              >
                💝
              </motion.div>
              <h1 className="text-2xl font-bold text-white">Create account</h1>
              <p className="text-white/50 text-sm">Join Mutual Match</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  label="Username"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  required
                />
                <p className="mt-1 text-xs text-white/30">3-20 chars, letters, numbers, underscores</p>
              </div>

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
                {password && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength
                              ? passwordStrength <= 1
                                ? 'bg-red-500'
                                : passwordStrength <= 2
                                ? 'bg-yellow-500'
                                : passwordStrength <= 3
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-1">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div
                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                              req.test(password) ? 'bg-green-400' : 'bg-white/20'
                            }`}
                          />
                          <span
                            className={`text-xs transition-colors ${
                              req.test(password) ? 'text-green-400' : 'text-white/30'
                            }`}
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
                required
                />

              <AnimatePresence>
                {(error || statusHint) && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-sm text-center min-h-[20px]"
                  >
                    {error ? (
                      <span className="text-red-400">{error}</span>
                    ) : (
                      <span className="text-white/60">{statusHint}</span>
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
                className="w-full mt-2"
              >
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-white/40">
              Already have an account?{' '}
              <Link href="/login" className="text-pink-400 hover:text-pink-300 transition-colors">
                Sign in
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
