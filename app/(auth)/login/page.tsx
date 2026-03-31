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
    if (errorLike?.code === 'auth/invalid-credential' || errorLike?.code === 'auth/wrong-password') {
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(236,72,153,0.12),transparent),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.08),transparent)] blur-3xl" />
      </motion.div>
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="p-8 space-y-6 shadow-[0_20px_80px_rgba(236,72,153,0.12)]">
            <div className="text-center space-y-2">
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, 6, -6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="text-4xl"
              >
                💝
              </motion.div>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-white/50 text-sm">Sign in to your account</p>
            </div>

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
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-red-400 text-center"
                  >
                    {error}
                  </motion.p>
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
                Sign In
              </Button>
            </form>

            <p className="text-center text-sm text-white/40">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-pink-400 hover:text-pink-300 transition-colors">
                Sign up
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
