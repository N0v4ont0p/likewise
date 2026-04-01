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
    color: '#f7365e',
    title: 'Completely private',
    desc: 'Your likes are invisible until both sides match',
  },
  {
    icon: '💝',
    color: '#7c5cfc',
    title: 'Mutual only',
    desc: 'Connections only reveal when it goes both ways',
  },
  {
    icon: '🏫',
    color: '#10b981',
    title: 'Class-based',
    desc: 'Organised by your school and specific classes',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 dot-grid relative">
      {/* Subtle top/bottom gradient fade over dot grid */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[var(--bg)] via-transparent to-[var(--bg)]" aria-hidden="true" />

      <div className="w-full max-w-[420px] relative">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* ── Hero ── */}
          <motion.div variants={item} className="text-center space-y-4">
            {/* Animated heart logo */}
            <motion.div
              className="inline-flex items-center justify-center"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                className="h-20 w-20 rounded-[28px] bg-gradient-to-br from-[#f7365e] to-[#f06233] flex items-center justify-center shadow-[var(--shadow-pink)]"
                animate={{ rotate: [0, -2, 2, -1, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </motion.div>
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-[3.5rem] font-black tracking-tight leading-none gradient-text-animated">
                Likewise
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-[var(--text-secondary)] text-lg font-light tracking-wide"
              >
                Private. Mutual. Class-based.
              </motion.p>
            </div>
          </motion.div>

          {/* ── Features ── */}
          <motion.div variants={item} className="space-y-2">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.32 + i * 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="group flex items-center gap-4 rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[var(--border)] px-4 py-4 shadow-[var(--shadow-sm)] overflow-hidden relative"
              >
                {/* Left accent line */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
                  style={{ background: f.color }}
                />
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm"
                  style={{ background: `${f.color}1a`, border: `1px solid ${f.color}33` }}
                >
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.9375rem] font-semibold text-white">{f.title}</p>
                  <p className="text-[0.8125rem] text-[var(--text-secondary)] mt-0.5 leading-snug">{f.desc}</p>
                </div>
                <svg className="text-[var(--text-muted)] shrink-0 group-hover:text-[var(--text-tertiary)] transition-colors" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2.5l4.5 4.5L5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            ))}
          </motion.div>

          {/* ── CTAs ── */}
          <motion.div variants={item} className="space-y-2.5">
            <Link href="/signup" className="block">
              <Button variant="primary" size="lg" className="w-full text-[1.0625rem] font-bold tracking-tight">
                Get started free →
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button variant="secondary" size="lg" className="w-full text-[0.9375rem]">
                I already have an account
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={item}
            className="text-center text-[var(--text-muted)] text-[0.75rem]"
          >
            Crushes stay private until it&apos;s mutual 💝
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
