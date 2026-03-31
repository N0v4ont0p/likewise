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
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto space-y-6 py-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>←</Button>
          <div>
            <h1 className="text-xl font-bold text-white">Your Matches 💝</h1>
            <p className="text-white/40 text-sm">{group?.name}</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : matches.length === 0 ? (
          <GlassCard className="p-10 text-center space-y-3">
            <div className="text-5xl">🤍</div>
            <h3 className="text-lg font-semibold text-white">No matches yet</h3>
            <p className="text-white/40 text-sm">Keep liking members — they might like you back!</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {matches.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <GlassCard
                  glow
                  className="p-5 border-pink-500/20 bg-pink-500/5"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-500/40 to-purple-500/40 border border-pink-500/30 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-pink-500/20"
                    >
                      {match.otherUsername[0].toUpperCase()}
                    </motion.div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-lg">{match.otherUsername}</p>
                      <p className="text-xs text-pink-400 mt-0.5">Mutual match ✨</p>
                    </div>
                    <div className="text-2xl">💝</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && matches.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-white/20 text-xs"
          >
            Only mutual matches are shown 🔒
          </motion.p>
        )}
      </div>
    </div>
  );
}
