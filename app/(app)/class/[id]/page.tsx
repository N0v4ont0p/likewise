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

/* SVG Heart icon */
function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

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
  const [justLiked, setJustLiked] = useState<string | null>(null);
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
          setJustLiked(member.userId);
          setTimeout(() => setJustLiked(null), 600);
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
          colors={['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#fbbf24', '#fff']}
          recycle={false}
          numberOfPieces={280}
          gravity={0.18}
        />
      )}

      <div className="max-w-lg mx-auto px-5 py-8 space-y-5">
        {/* Header */}
        <PageHeader
          title={group.name}
          subtitle={`${members.length} member${members.length !== 1 ? 's' : ''}`}
          back="/dashboard"
          breadcrumb={school ? [{ label: school.name }] : undefined}
          actions={
            <Link href={`/class/${id}/matches`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <HeartIcon filled className="h-3.5 w-3.5" />
                Matches
              </Button>
            </Link>
          }
        />

        {/* Invite code */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.65rem] text-[var(--text-tertiary)] uppercase tracking-[0.12em] font-semibold mb-1.5">
                  Invite code
                </p>
                <p className="font-mono text-[1.7rem] font-black text-[var(--pink)] tracking-[0.22em] leading-none">
                  {group.inviteCode}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={copyInviteCode}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-md)] text-sm font-semibold border transition-all duration-150 ${
                  copied
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-3)]'
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={copied ? 'check' : 'copy'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-1.5"
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
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats row */}
        {otherMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.11, duration: 0.32 }}
            className="grid grid-cols-2 gap-2.5"
          >
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] p-3.5 text-center shadow-[var(--shadow-sm)]">
              <p className="text-[1.375rem] font-black text-white tabular-nums">{otherMembers.length}</p>
              <p className="text-[0.7rem] text-[var(--text-secondary)] mt-0.5 font-medium">Classmates</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[rgba(247,54,94,0.25)] p-3.5 text-center shadow-[var(--shadow-sm)]">
              <p className="text-[1.375rem] font-black text-[var(--pink)] tabular-nums">{likedCount}</p>
              <p className="text-[0.7rem] text-[var(--text-secondary)] mt-0.5 font-medium">You liked</p>
            </div>
          </motion.div>
        )}

        {/* Members list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.65rem] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.12em]">
              Classmates
            </p>
            <AnimatePresence>
              {likeError && (
                <motion.p
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-400 font-medium"
                >
                  {likeError}
                </motion.p>
              )}
            </AnimatePresence>
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
                const isJustLiked = justLiked === member.userId;
                const displayName = member.displayUsername || member.username;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.045, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <GlassCard
                      className={`p-4 transition-all duration-200 ${
                        isLiked ? 'border-[rgba(247,54,94,0.35)] bg-[#180e14]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar name={displayName} size="md" showRing={isLiked} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-white text-[0.9375rem] truncate">
                              {displayName}
                            </p>
                            {member.role === 'owner' && (
                              <Badge variant="pink" size="sm">Owner</Badge>
                            )}
                          </div>
                          <AnimatePresence>
                            {isLiked && (
                              <motion.p
                                initial={{ opacity: 0, y: 3 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -3 }}
                                className="text-[0.7rem] text-[var(--pink-light)] mt-0.5 font-medium"
                              >
                                ✦ You liked them
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* SVG Heart like button */}
                        <motion.button
                          whileTap={{ scale: isPending ? 1 : 0.78 }}
                          whileHover={{ scale: isPending ? 1 : 1.12 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 16 }}
                          onClick={() => handleLike(member)}
                          disabled={isPending}
                          aria-label={isLiked ? 'Unlike' : 'Like'}
                          className={`relative h-11 w-11 rounded-full flex items-center justify-center transition-colors duration-200 shrink-0 ${
                            isLiked
                              ? 'bg-[#2a0f1a] border border-[rgba(247,54,94,0.55)] text-[var(--pink)]'
                              : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-tertiary)] hover:border-[rgba(247,54,94,0.4)] hover:text-[var(--pink)] hover:bg-[#200d16]'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <AnimatePresence mode="wait">
                            {isPending ? (
                              <motion.span
                                key="pending"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute"
                              >
                                <LoadingSpinner size="xs" />
                              </motion.span>
                            ) : (
                              <motion.span
                                key={isLiked ? 'liked' : 'unliked'}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{
                                  scale: isJustLiked ? [1, 1.45, 0.88, 1.18, 1] : 1,
                                  opacity: 1,
                                }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={
                                  isJustLiked
                                    ? { duration: 0.55, times: [0, 0.15, 0.3, 0.5, 1] }
                                    : { type: 'spring', stiffness: 500, damping: 18 }
                                }
                                className="flex items-center justify-center"
                              >
                                <HeartIcon filled={isLiked} className="h-5 w-5" />
                              </motion.span>
                            )}
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

      {/* ── Match modal ── */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-[rgba(0,0,0,0.88)]"
            onClick={() => setShowMatch(null)}
          >
            <motion.div
              initial={{ scale: 0.55, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-full max-w-[340px]"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard glow className="overflow-hidden">
                {/* Top gradient bar */}
                <div className="h-1.5 bg-gradient-to-r from-[#f7365e] via-[#c026d3] to-[#7c5cfc]" />

                <div className="p-8 text-center space-y-5">
                  {/* Animated hearts */}
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 15 }}
                      className="h-20 w-20 rounded-full bg-gradient-to-br from-[#f7365e] to-[#f06233] flex items-center justify-center shadow-[var(--shadow-pink)]"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.15, 1, 1.08, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                      >
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </motion.div>
                    </motion.div>
                  </div>

                  <div className="space-y-1.5">
                    <motion.h2
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.4 }}
                      className="text-[1.875rem] font-extrabold text-white tracking-tight"
                    >
                      It&apos;s a match!
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.26, duration: 0.38 }}
                      className="text-[var(--text-secondary)] text-[0.9375rem] leading-relaxed"
                    >
                      You and{' '}
                      <span className="text-[var(--pink-light)] font-bold">{showMatch.username}</span>{' '}
                      like each other 💝
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.34, duration: 0.38 }}
                    className="space-y-2.5 pt-1"
                  >
                    <Link href={`/class/${id}/matches`} onClick={() => setShowMatch(null)}>
                      <Button variant="primary" size="md" className="w-full">
                        See your matches
                      </Button>
                    </Link>
                    <button
                      onClick={() => setShowMatch(null)}
                      className="w-full text-[var(--text-secondary)] text-sm hover:text-white transition-colors py-1 font-medium"
                    >
                      Continue browsing
                    </button>
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
