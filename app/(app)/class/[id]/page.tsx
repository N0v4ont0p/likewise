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
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Group, Membership, School } from '@/types';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function ClassPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [school, setSchool] = useState<School | null>(null);
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
    getDoc(doc(db, 'groups', id as string)).then(async (snap) => {
      if (snap.exists()) {
        const groupData = { id: snap.id, ...snap.data() } as Group;
        setGroup(groupData);
        if (groupData.schoolId) {
          const schoolSnap = await getDoc(doc(db, 'schools', groupData.schoolId));
          if (schoolSnap.exists()) {
            setSchool({ id: schoolSnap.id, ...schoolSnap.data() } as School);
          }
        }
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
      <div className="min-h-screen flex items-center justify-center p-5">
        <GlassCard className="max-w-sm w-full overflow-hidden">
          <EmptyState
            icon="🔍"
            title="Class not found"
            description="This class may have been removed or the link is invalid."
            action={
              <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard')}>
                Back to home
              </Button>
            }
          />
        </GlassCard>
      </div>
    );
  }

  const otherMembers = members.filter((m) => m.userId !== user?.id);
  const likedCount = otherMembers.filter((m) => likedUserIds.has(m.userId)).length;

  return (
    <div className="min-h-screen">
      {confetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          colors={['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#fff']}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="max-w-lg mx-auto px-5 py-8 space-y-6">
        {/* Header */}
        <PageHeader
          title={group.name}
          subtitle={`${members.length} member${members.length !== 1 ? 's' : ''}`}
          back="/dashboard"
          breadcrumb={school ? [{ label: school.name }] : undefined}
          actions={
            <Link href={`/class/${id}/matches`}>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <span>💝</span>
                Matches
              </Button>
            </Link>
          }
        />

        {/* Invite code */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.7rem] text-white/30 uppercase tracking-widest font-medium mb-1.5">
                  Invite code
                </p>
                <p className="font-mono text-[1.6rem] font-bold text-pink-400 tracking-[0.2em] leading-none">
                  {group.inviteCode}
                </p>
              </div>
              <Button
                variant={copied ? 'outline' : 'secondary'}
                size="sm"
                onClick={copyInviteCode}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 6.5l3.5 3.5L11 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                    Copy
                  </>
                )}
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats row */}
        {otherMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="flex-1 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] p-3 text-center">
              <p className="text-[1.1875rem] font-bold text-white">{otherMembers.length}</p>
              <p className="text-[0.7rem] text-white/35 mt-0.5">Classmates</p>
            </div>
            <div className="flex-1 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] p-3 text-center">
              <p className="text-[1.1875rem] font-bold text-pink-400">{likedCount}</p>
              <p className="text-[0.7rem] text-white/35 mt-0.5">Liked</p>
            </div>
          </motion.div>
        )}

        {/* Members */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.7rem] font-medium text-white/28 uppercase tracking-widest">
              Classmates
            </p>
            {likeError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400"
              >
                {likeError}
              </motion.p>
            )}
          </div>

          {otherMembers.length === 0 ? (
            <GlassCard className="overflow-hidden">
              <EmptyState
                icon="👋"
                title="No classmates yet"
                description="Share the invite code to get people into this class"
              />
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {otherMembers.map((member, i) => {
                const isLiked = likedUserIds.has(member.userId);
                const isPending = pendingLike === member.userId;
                const displayName = member.displayUsername || member.username;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.04,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <GlassCard
                      className={`p-4 transition-colors duration-200 ${
                        isLiked
                          ? 'border-pink-500/25 bg-pink-500/[0.04]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar name={displayName} size="md" showRing={isLiked} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white text-[0.9375rem] truncate">
                              {displayName}
                            </p>
                            {member.role === 'owner' && (
                              <Badge variant="pink" size="sm">Owner</Badge>
                            )}
                          </div>
                          {isLiked && (
                            <motion.p
                              initial={{ opacity: 0, y: 2 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-[0.7rem] text-pink-400/70 mt-0.5"
                            >
                              You liked this person
                            </motion.p>
                          )}
                        </div>
                        {/* Like button */}
                        <motion.button
                          whileTap={{ scale: 0.82 }}
                          whileHover={{ scale: isPending ? 1 : 1.1 }}
                          onClick={() => handleLike(member)}
                          disabled={isPending}
                          aria-label={isLiked ? 'Unlike' : 'Like'}
                          className={`relative h-11 w-11 rounded-full flex items-center justify-center transition-colors duration-200 shrink-0 ${
                            isLiked
                              ? 'bg-pink-500/20 border border-pink-500/40'
                              : 'bg-white/[0.05] border border-white/[0.09] hover:border-pink-500/30 hover:bg-pink-500/[0.08]'
                          } disabled:opacity-50`}
                        >
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={isPending ? 'pending' : isLiked ? 'liked' : 'unliked'}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                              className="text-[1.1rem] select-none"
                            >
                              {isPending ? '⏳' : isLiked ? '❤️' : '🤍'}
                            </motion.span>
                          </AnimatePresence>
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

      {/* Match modal */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-md"
            onClick={() => setShowMatch(null)}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="w-full max-w-[340px]"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard glow className="p-8 text-center space-y-5">
                <motion.div
                  animate={{ scale: [1, 1.2, 0.95, 1.1, 1], rotate: [0, -10, 10, -5, 0] }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-[4.5rem] leading-none"
                >
                  💝
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-[1.75rem] font-extrabold text-white tracking-tight">
                    It&apos;s a match!
                  </h2>
                  <p className="text-white/60 text-[0.9375rem] leading-relaxed">
                    You and{' '}
                    <span className="text-pink-400 font-semibold">{showMatch.username}</span>{' '}
                    like each other
                  </p>
                </div>
                <div className="space-y-2.5 pt-1">
                  <Link href={`/class/${id}/matches`} onClick={() => setShowMatch(null)}>
                    <Button variant="primary" size="md" className="w-full">
                      See your matches
                    </Button>
                  </Link>
                  <button
                    onClick={() => setShowMatch(null)}
                    className="w-full text-white/35 text-sm hover:text-white/55 transition-colors py-1"
                  >
                    Continue browsing
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

