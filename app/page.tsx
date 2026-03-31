'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl"
            >
              💝
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            Mutual Match
          </h1>
          <p className="text-white/50 text-lg">
            Private. Safe. Mutual only.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3 text-left"
        >
          {[
            { icon: '🔒', text: 'Zero exposure unless mutual' },
            { icon: '✨', text: 'Matches only when both like each other' },
            { icon: '🎓', text: 'Private class-based groups' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3"
            >
              <span className="text-xl">{feature.icon}</span>
              <span className="text-white/70 text-sm">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="space-y-3"
        >
          <Link href="/signup" className="block">
            <Button variant="primary" size="lg" className="w-full">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="secondary" size="lg" className="w-full">
              Sign In
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-white/20 text-xs"
        >
          Your crushes are always private until mutual 💝
        </motion.p>
      </div>
    </div>
  );
}
