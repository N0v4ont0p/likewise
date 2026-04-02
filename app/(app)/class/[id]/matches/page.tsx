'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { subscribeToMatches } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Avatar } from '@/components/ui/Avatar';
import { PageHeader } from '@/components/ui/PageHeader';
import { Group, Match } from '@/types';

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function MatchesPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [matches, setMatches] = useState<(Match & { otherUsername: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'groups', id as string)).then((snap) => {
      if (snap.exists()) setGroup({ id: snap.id, ...snap.data() } as Group);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    const unsub = subscribeToMatches(user.id, id as string, async (rawMatches) => {
      const enriched = await Promise.all(
        rawMatches.map(async (match) => {
          const otherId = match.userAId === user.id ? match.userBId : match.userAId;
          const userDoc = await getDoc(doc(db, 'users', otherId));
          const otherUsername = userDoc.exists()
            ? userDoc.data().displayUsername || userDoc.data().username
            : 'Unknown';
          return { ...match, otherUsername };
        })
      );
      setMatches(enriched);
      setLoading(false);
    });
    return unsub;
  }, [id, user]);

  return (
    <div className="lw-page-top" style={{ background: 'var(--bg)' }}>
      {/* Top accent line */}
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 h-px z-50"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), rgba(6,182,212,0.5), transparent)' }}
        aria-hidden="true"
      />

      <div className="max-w-lg mx-auto px-5 pt-10 pb-12 space-y-6">
        <PageHeader title="Matches" subtitle={group?.name} back={`/class/${id}`} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading matches\u2026</p>
          </div>
        ) : matches.length === 0 ? (
          <div
            className="rounded-[var(--radius-xl)] p-10 text-center space-y-5"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'var(--blue-dim)', border: '1px solid var(--border-accent)' }}
            >
              <span style={{ color: 'var(--blue-light)' }}><HeartIcon className="h-7 w-7" /></span>
            </div>
            <div>
              <h3 className="text-title" style={{ color: 'var(--text-primary)' }}>No matches yet</h3>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Keep liking classmates \u2014 when it&apos;s mutual, they&apos;ll appear here
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => router.back()}>
              Back to class
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32 }}
              className="flex items-center justify-between"
            >
              <p className="text-label" style={{ color: 'var(--text-tertiary)' }}>
                {matches.length} MUTUAL MATCH{matches.length !== 1 ? 'ES' : ''}
              </p>
              <span
                className="text-[0.65rem] font-medium flex items-center gap-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Private
              </span>
            </motion.div>

            {matches.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.07, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="overflow-hidden rounded-[var(--radius-lg)]"
                  style={{
                    background: 'var(--surface-1)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.08)',
                  }}
                >
                  <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }} />
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
                      >
                        <Avatar name={match.otherUsername} size="lg" showRing pulse />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[1.0625rem] truncate tracking-tight" style={{ color: 'var(--text-primary)' }}>
                          {match.otherUsername}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span style={{ color: 'var(--blue-light)' }}><HeartIcon className="h-3.5 w-3.5" /></span>
                          <p className="text-[0.8125rem] font-semibold" style={{ color: 'var(--blue-light)' }}>
                            Mutual match
                          </p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.5 + 0.5, ease: 'easeInOut' }}
                        className="shrink-0"
                      >
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: 'var(--shadow-blue)' }}
                        >
                          <HeartIcon className="h-5 w-5 text-white" />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-[0.7rem] pt-2 flex items-center justify-center gap-1.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Only mutual matches are shown
            </motion.p>
          </div>
        )}
      </div>
    </div>
  );
}
