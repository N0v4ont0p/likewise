'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

const features = [
  { icon: '🔒', title: 'Zero exposure', desc: 'Your likes are always private until mutual' },
  { icon: '✨', title: 'Mutual only', desc: 'Matches only appear when both sides like each other' },
  { icon: '🏫', title: 'School & class spaces', desc: 'Organized by your school and class' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-rose-500/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="w-full max-w-md text-center space-y-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl inline-block"
          >
            💝
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-pink-300 via-pink-400 to-rose-500 bg-clip-text text-transparent">
              Likewise
            </h1>
            <p className="text-white/50 text-lg font-light">
              Private. Mutual. Class-based.
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-2.5"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.09, duration: 0.4 }}
              className="flex items-center gap-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.07] px-4 py-3.5 text-left"
            >
              <span className="text-xl shrink-0">{f.icon}</span>
              <div>
                <p className="text-white text-sm font-medium">{f.title}</p>
                <p className="text-white/40 text-xs mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          className="space-y-3"
        >
          <Link href="/signup" className="block">
            <Button variant="primary" size="lg" className="w-full text-base font-semibold">
              Get started free ✨
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="secondary" size="lg" className="w-full text-base">
              Sign in
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="text-white/20 text-xs"
        >
          Your crushes stay private until it&apos;s mutual 💝
        </motion.p>
      </div>
    </div>
  );
}
