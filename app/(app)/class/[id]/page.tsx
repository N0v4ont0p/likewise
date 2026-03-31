'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  subscribeToGroupMembers,
  subscribeToUserLikes,
  likeUser,
  unlikeUser,
} from '@/lib/firestore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Group, Membership } from '@/types';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function ClassPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set());
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [pendingLike, setPendingLike] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState<{ username: string } | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handler = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'groups', id as string)).then((snap) => {
      if (snap.exists()) {
        setGroup({ id: snap.id, ...snap.data() } as Group);
      }
      setLoadingGroup(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToGroupMembers(id as string, setMembers);
    return unsub;
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    const unsub = subscribeToUserLikes(user.id, id as string, (ids) => {
      setLikedUserIds(new Set(ids));
    });
    return unsub;
  }, [id, user]);

  const handleLike = useCallback(
    async (member: Membership) => {
      if (!user || pendingLike === member.userId) return;
      setPendingLike(member.userId);
      try {
        setLikeError(null);
        const isLiked = likedUserIds.has(member.userId);
        if (isLiked) {
          await unlikeUser(user.id, member.userId, id as string);
        } else {
          const result = await likeUser(user.id, member.userId, id as string);
          if (result.isMatch) {
            setShowMatch({ username: member.displayUsername || member.username });
            setConfetti(true);
            setTimeout(() => setConfetti(false), 5000);
          }
        }
      } catch {
        setLikeError('Something went wrong. Please try again.');
      } finally {
        setPendingLike(null);
      }
    },
    [user, id, likedUserIds, pendingLike]
  );

  const copyInviteCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadingGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Class not found</p>
      </div>
    );
  }

  const otherMembers = members.filter((m) => m.userId !== user?.id);

  return (
    <div className="min-h-screen p-4">
      {confetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          colors={['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#fff']}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="max-w-lg mx-auto space-y-6 py-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>←</Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{group.name}</h1>
            <p className="text-white/40 text-sm">{members.length} members</p>
          </div>
          <Link href={`/class/${id}/matches`}>
            <Button variant="secondary" size="sm">💝 Matches</Button>
          </Link>
        </div>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 mb-1">Invite code</p>
              <p className="font-mono text-xl font-bold text-pink-400 tracking-widest">{group.inviteCode}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={copyInviteCode}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </Button>
          </div>
        </GlassCard>

        <div>
          <h2 className="text-sm font-medium text-white/50 mb-3">
            Class members ({otherMembers.length})
          </h2>
          {likeError && (
            <p className="text-sm text-red-400 mb-3 text-center">{likeError}</p>
          )}
          {otherMembers.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <div className="text-4xl mb-3">👋</div>
              <p className="text-white/50 text-sm">No other members yet. Share the invite code!</p>
            </GlassCard>
          ) : (
            <div className="grid gap-3">
              {otherMembers.map((member, i) => {
                const isLiked = likedUserIds.has(member.userId);
                const isPending = pendingLike === member.userId;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <GlassCard
                      className={`p-4 transition-all duration-300 ${isLiked ? 'border-pink-500/30 bg-pink-500/5' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-white font-semibold">
                            {(member.displayUsername || member.username)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {member.displayUsername || member.username}
                            </p>
                            <p className="text-xs text-white/30">{member.role}</p>
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleLike(member)}
                          disabled={isPending}
                          className={`relative h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                            isLiked
                              ? 'bg-pink-500/20 border border-pink-500/40'
                              : 'bg-white/5 border border-white/10 hover:border-pink-500/30 hover:bg-pink-500/10'
                          } disabled:opacity-50`}
                          aria-label={isLiked ? 'Unlike' : 'Like'}
                        >
                          <motion.span
                            key={isLiked ? 'liked' : 'unliked'}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            className="text-lg"
                          >
                            {isPending ? '⏳' : isLiked ? '❤️' : '🤍'}
                          </motion.span>
                        </motion.button>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowMatch(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full max-w-sm"
            >
              <GlassCard
                glow
                className="p-8 text-center space-y-4 border-pink-500/40 bg-pink-500/10"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-6xl"
                >
                  💝
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">It&apos;s a Match!</h2>
                  <p className="text-white/70">
                    You and <span className="text-pink-400 font-semibold">{showMatch.username}</span> like each other!
                  </p>
                </div>
                <Link href={`/class/${id}/matches`} onClick={() => setShowMatch(null)}>
                  <Button variant="primary" size="md" className="w-full">
                    See your matches ✨
                  </Button>
                </Link>
                <button onClick={() => setShowMatch(null)} className="text-white/40 text-sm hover:text-white/60 transition-colors">
                  Continue browsing
                </button>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
