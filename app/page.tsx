'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

const features = [
  {
    icon: '🔒',
    title: 'Completely private',
    desc: 'Your likes are invisible until both sides match',
  },
  {
    icon: '💝',
    title: 'Mutual only',
    desc: 'Connections only reveal when it goes both ways',
  },
  {
    icon: '🏫',
    title: 'Class-based',
    desc: 'Organised by your school and specific classes',
  },
];

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
  },
};

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
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-[420px]">
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {/* Hero */}
          <motion.div variants={stagger.item} className="text-center space-y-5">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[72px] leading-none select-none"
            >
              💝
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-[3.25rem] font-black tracking-tight gradient-text leading-none">
                Likewise
              </h1>
              <p className="text-[var(--text-secondary)] text-lg font-light tracking-wide">
                Private. Mutual. Class-based.
              </p>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div variants={stagger.item} className="space-y-2">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-4 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] px-4 py-3.5 shadow-[var(--shadow-sm)]"
              >
                <div className="h-10 w-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-xl shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-[0.9375rem] font-semibold text-white">{f.title}</p>
                  <p className="text-[0.8125rem] text-[var(--text-secondary)] mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={stagger.item} className="space-y-2.5">
            <Link href="/signup" className="block">
              <Button variant="primary" size="lg" className="w-full text-[1.0625rem] font-semibold">
                Get started free
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button variant="secondary" size="lg" className="w-full text-[0.9375rem]">
                Sign in
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={stagger.item}
            className="text-center text-[var(--text-tertiary)] text-[0.75rem]"
          >
            Crushes stay private until it&apos;s mutual 💝
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
