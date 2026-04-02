'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

const steps = [
  {
    number: '01',
    title: 'Join your class',
    description: 'Join with an invite code or create a class for your friends and classmates.',
  },
  {
    number: '02',
    title: 'Like privately',
    description: 'Browse classmates and like who you\'re interested in, completely anonymously.',
  },
  {
    number: '03',
    title: 'See your matches',
    description: 'When someone likes you back, you\'ll both find out — not before.',
  },
];

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
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
      <div className="lw-page">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="lw-body dot-grid">
      {/* Radial glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 60%)' }}
        aria-hidden="true"
      />

      {/* Top accent line */}
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 h-px z-50"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), rgba(6,182,212,0.5), transparent)' }}
        aria-hidden="true"
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--blue)', boxShadow: 'var(--blue-glow-sm)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </div>
          <span className="font-bold text-[1.125rem] tracking-tight" style={{ color: 'var(--text-primary)' }}>Likewise</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={fadeUp}>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{
                background: 'var(--blue-dim)',
                border: '1px solid var(--border-accent)',
                color: 'var(--blue-light)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Private mutual matching
            </div>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-display text-balance">
            <span style={{ color: 'var(--text-primary)' }}>Connect with</span>
            <br />
            <span className="gradient-text">your class</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Private mutual matching within your school.{' '}
            <span style={{ color: 'var(--text-primary)' }}>Your crush stays secret</span>{' '}
            until they like you back.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="min-w-[180px]">
                Get started free →
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg" className="min-w-[140px]">
                Sign in
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center mb-12"
        >
          <p className="text-label mb-3" style={{ color: 'var(--text-tertiary)' }}>HOW IT WORKS</p>
          <h2 className="text-heading" style={{ color: 'var(--text-primary)' }}>Simple. Private. Safe.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: EASE_OUT }}
              className="rounded-[var(--radius-xl)] p-6 space-y-4"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-black text-[0.75rem] tracking-widest"
                  style={{ color: 'var(--blue-light)' }}
                >
                  {step.number}
                </span>
                <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
              </div>
              <div>
                <h3 className="font-bold text-[1.0625rem] mb-2" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t py-8 px-6" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-md flex items-center justify-center"
              style={{ background: 'var(--blue)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Likewise</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} Likewise. Private by design.
          </p>
        </div>
      </footer>
    </div>
  );
}
