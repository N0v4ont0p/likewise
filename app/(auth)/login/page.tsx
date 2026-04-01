'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
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
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
      {/* Glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-pink-500/[0.06] blur-[120px]" />
      </div>

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
            <h1 className="text-2xl font-bold text-white mt-3">Welcome back</h1>
            <p className="text-white/38 text-sm">Sign in to continue</p>
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
                    <div className="bg-red-500/[0.1] border border-red-500/[0.2] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm text-red-300">
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
                className="w-full mt-1"
              >
                Sign in
              </Button>
            </form>
          </GlassCard>

          <p className="text-center text-sm text-white/35">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-pink-400 hover:text-pink-300 transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
