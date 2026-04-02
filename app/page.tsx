'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

const features = [
  {
    icon: '🔒',
    color: '#f7365e',
    colorDim: 'rgba(247,54,94,0.1)',
    title: 'Completely private',
    desc: 'Your likes are invisible until both sides match — zero risk.',
  },
  {
    icon: '💝',
    color: '#7c5cfc',
    colorDim: 'rgba(124,92,252,0.1)',
    title: 'Mutual only',
    desc: 'A connection only reveals when feelings go both ways.',
  },
  {
    icon: '🏫',
    color: '#10b981',
    colorDim: 'rgba(16,185,129,0.1)',
    title: 'Class-based',
    desc: 'Organised by your school and specific classes you attend.',
  },
];

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.55 } },
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const titleY = useTransform(scrollY, [0, 300], [0, -40]);
  const titleOpacity = useTransform(scrollY, [0, 200], [1, 0]);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="lw-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="lw-page-top dot-grid" style={{ background: 'var(--bg)' }}>
      {/* Top gradient fade */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(247,54,94,0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ── HERO ─────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center z-10"
      >
        {/* Floating logo mark */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-8 max-w-2xl mx-auto w-full"
        >
          {/* Logo icon */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <motion.div
              className="relative"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="h-24 w-24 rounded-[32px] flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #f7365e, #c026d3)',
                  boxShadow: '0 0 60px rgba(247,54,94,0.4), 0 8px 32px rgba(247,54,94,0.3)',
                }}
              >
                {/* Shine overlay */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)' }}
                />
                <svg width="44" height="44" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              {/* Glow ring */}
              <div
                className="absolute inset-0 rounded-[32px] ring-pulse"
                style={{ boxShadow: '0 0 0 0 rgba(247,54,94,0.6)' }}
              />
            </motion.div>
          </motion.div>

          {/* Display title */}
          <motion.div variants={fadeUp} className="space-y-3">
            <h1 className="text-display gradient-text-animated select-none">
              Likewise
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px flex-1 max-w-16" style={{ background: 'var(--border)' }} />
              <span className="text-label tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>
                PRIVATE · MUTUAL · CLASS-BASED
              </span>
              <div className="h-px flex-1 max-w-16" style={{ background: 'var(--border)' }} />
            </div>
          </motion.div>

          {/* Sub-headline */}
          <motion.p
            variants={fadeUp}
            className="text-[1.125rem] font-light leading-relaxed text-balance"
            style={{ color: 'var(--text-secondary)' }}
          >
            Discover who likes you back — completely anonymously — until the moment you both match.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="min-w-[180px] text-[1rem] font-bold">
                Get started free →
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg" className="min-w-[180px] text-[0.9375rem]">
                Sign in
              </Button>
            </Link>
          </motion.div>

          {/* Trust badge */}
          <motion.p variants={fadeIn} className="text-[0.75rem]" style={{ color: 'var(--text-muted)' }}>
            No spam. No ads. Crushes stay private until it&apos;s mutual 💝
          </motion.p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-[0.6875rem] text-label">SCROLL</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ──────────────────────────────── */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-10"
          >
            <span className="text-label" style={{ color: 'var(--text-tertiary)' }}>HOW IT WORKS</span>
          </motion.div>

          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: EASE_OUT }}
            >
              <div
                className="group relative flex items-center gap-5 rounded-[var(--radius-lg)] px-5 py-5 overflow-hidden card-interactive"
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Left accent stripe */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ background: `linear-gradient(180deg, ${f.color}, ${f.color}60)` }}
                />
                {/* Icon */}
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: f.colorDim, border: `1px solid ${f.color}33` }}
                >
                  {f.icon}
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[1rem] text-white leading-snug">{f.title}</p>
                  <p className="text-[0.8125rem] mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                    {f.desc}
                  </p>
                </div>
                {/* Arrow */}
                <svg
                  className="shrink-0 opacity-30 group-hover:opacity-60 transition-opacity"
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                >
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.div>
          ))}

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5, ease: EASE_OUT }}
            className="pt-6"
          >
            <Link href="/signup" className="block">
              <Button variant="primary" size="lg" className="w-full text-[1rem] font-bold">
                Start for free — it only takes 30 seconds →
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

