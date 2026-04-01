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
      <div className="max-w-lg mx-auto px-5 py-8 space-y-7">
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
            {/* Header count */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <p className="text-[0.7rem] font-medium text-[var(--text-tertiary)] uppercase tracking-widest">
                {matches.length} mutual match{matches.length !== 1 ? 'es' : ''}
              </p>
              <p className="text-[0.7rem] text-[var(--text-tertiary)]">Private 🔒</p>
            </motion.div>

            {matches.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.07,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <GlassCard glow className="p-5">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                    >
                      <Avatar name={match.otherUsername} size="lg" showRing />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-[1.0625rem] truncate">
                        {match.otherUsername}
                      </p>
                      <p className="text-[0.8125rem] text-pink-400/80 mt-0.5 flex items-center gap-1">
                        <span>✨</span> Mutual match
                      </p>
                    </div>
                    <div className="text-[1.75rem] shrink-0 select-none">💝</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-[var(--text-muted)] text-[0.7rem] pt-2"
            >
              Only mutual matches are shown 🔒
            </motion.p>
          </div>
        )}
      </div>
    </div>
  );
}
