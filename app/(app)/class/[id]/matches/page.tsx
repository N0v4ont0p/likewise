'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { subscribeToMatches } from '@/lib/firestore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
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
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-5 py-8 space-y-6">
        <PageHeader
          title="Matches"
          subtitle={group?.name}
          back={`/class/${id}`}
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : matches.length === 0 ? (
          <GlassCard className="overflow-hidden">
            <EmptyState
              icon="🤍"
              title="No matches yet"
              description="Keep liking classmates — when it's mutual, they'll appear here"
              action={
                <Button variant="secondary" size="sm" onClick={() => router.back()}>
                  Back to class
                </Button>
              }
            />
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32 }}
              className="flex items-center justify-between"
            >
              <p className="text-[0.65rem] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.12em]">
                {matches.length} mutual match{matches.length !== 1 ? 'es' : ''}
              </p>
              <span className="text-[0.65rem] text-[var(--text-tertiary)] font-medium flex items-center gap-1">
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
                <div className="rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[rgba(247,54,94,0.28)] shadow-[0_4px_20px_rgba(247,54,94,0.1)] overflow-hidden">
                  {/* Top gradient accent */}
                  <div className="h-[2px] bg-gradient-to-r from-[#f7365e] via-[#c026d3] to-[#7c5cfc]" />
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
                      >
                        <Avatar name={match.otherUsername} size="lg" showRing pulse />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-[1.0625rem] truncate tracking-tight">
                          {match.otherUsername}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <HeartIcon className="h-3.5 w-3.5 text-[var(--pink)]" />
                          <p className="text-[0.8125rem] text-[var(--pink-light)] font-semibold">
                            Mutual match
                          </p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.12, 1], rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.5 + 0.5, ease: 'easeInOut' }}
                        className="shrink-0"
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#f7365e] to-[#f06233] flex items-center justify-center shadow-[var(--shadow-pink)]">
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
              className="text-center text-[var(--text-muted)] text-[0.7rem] pt-2 flex items-center justify-center gap-1.5"
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
