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
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Group, Membership, School } from '@/types';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

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
      <div className="lw-page" style={{ background: 'var(--bg)' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="lw-page px-5" style={{ background: 'var(--bg)' }}>
        <div
          className="max-w-sm w-full rounded-[var(--radius-xl)] overflow-hidden text-center p-10 space-y-5"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        >
          <div className="text-5xl">🔍</div>
          <div>
            <h3 className="text-title" style={{ color: 'var(--text-primary)' }}>Class not found</h3>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              This class may have been removed or the link is invalid.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard')}>
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  const otherMembers = members.filter((m) => m.userId !== user?.id);
  const likedCount = otherMembers.filter((m) => likedUserIds.has(m.userId)).length;

  return (
    <div className="lw-page-top" style={{ background: 'var(--bg)' }}>
      {confetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          colors={['#3b82f6', '#60a5fa', '#06b6d4', '#818cf8', '#fff']}
          recycle={false}
          numberOfPieces={280}
          gravity={0.18}
        />
      )}

      {/* Top accent line */}
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 h-px z-50"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), rgba(6,182,212,0.5), transparent)' }}
        aria-hidden="true"
      />

      <div className="max-w-lg mx-auto px-5 pt-10 pb-12 space-y-5">
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
          className="rounded-[var(--radius-xl)] p-5"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-label mb-2" style={{ color: 'var(--text-tertiary)' }}>INVITE CODE</p>
              <p
                className="font-mono text-[2rem] font-black tracking-[0.22em] leading-none"
                style={{ color: 'var(--blue-light)' }}
              >
                {group.inviteCode}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={copyInviteCode}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-md)] text-sm font-semibold border transition-all duration-150"
              style={copied
                ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }
                : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }
              }
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
                      Copied!
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
        </motion.div>

        {/* Stats row */}
        {otherMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.11, duration: 0.32 }}
            className="grid grid-cols-2 gap-2.5"
          >
            <div
              className="rounded-[var(--radius-md)] p-4 text-center"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <p className="text-[1.5rem] font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>{otherMembers.length}</p>
              <p className="text-[0.7rem] font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>Classmates</p>
            </div>
            <div
              className="rounded-[var(--radius-md)] p-4 text-center"
              style={{ background: 'var(--blue-dim)', border: '1px solid var(--border-accent)' }}
            >
              <p className="text-[1.5rem] font-black tabular-nums" style={{ color: 'var(--blue-light)' }}>{likedCount}</p>
              <p className="text-[0.7rem] font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>You liked</p>
            </div>
          </motion.div>
        )}

        {/* Members */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-label" style={{ color: 'var(--text-tertiary)' }}>CLASSMATES</p>
            <AnimatePresence>
              {likeError && (
                <motion.p
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-medium"
                  style={{ color: '#f87171' }}
                >
                  {likeError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {otherMembers.length === 0 ? (
            <div
              className="rounded-[var(--radius-xl)] p-10 text-center space-y-4"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <div className="text-4xl">👋</div>
              <div>
                <h3 className="text-title" style={{ color: 'var(--text-primary)' }}>No classmates yet</h3>
                <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Share the invite code to get people into this class
                </p>
              </div>
            </div>
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
                    <div
                      className="rounded-[var(--radius-lg)] p-4 transition-all duration-200"
                      style={{
                        background: isLiked ? 'var(--blue-dim)' : 'var(--surface-1)',
                        border: isLiked ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                      }}
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar name={displayName} size="md" showRing={isLiked} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-[0.9375rem] truncate" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
                            {member.role === 'owner' && <Badge variant="blue" size="sm">Owner</Badge>}
                          </div>
                          <AnimatePresence>
                            {isLiked && (
                              <motion.p
                                initial={{ opacity: 0, y: 3 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -3 }}
                                className="text-[0.7rem] mt-0.5 font-medium"
                                style={{ color: 'var(--blue-light)' }}
                              >
                                \u2713 You liked them
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Heart button */}
                        <motion.button
                          whileTap={{ scale: isPending ? 1 : 0.78 }}
                          whileHover={{ scale: isPending ? 1 : 1.1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 16 }}
                          onClick={() => handleLike(member)}
                          disabled={isPending}
                          aria-label={isLiked ? 'Unlike' : 'Like'}
                          className="relative h-11 w-11 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={isLiked
                            ? { background: 'var(--blue-dim)', border: '1px solid var(--border-accent)', color: 'var(--blue-light)' }
                            : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-tertiary)' }
                          }
                        >
                          <AnimatePresence mode="wait">
                            {isPending ? (
                              <motion.span key="pending" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute">
                                <LoadingSpinner size="xs" />
                              </motion.span>
                            ) : (
                              <motion.span
                                key={isLiked ? 'liked' : 'unliked'}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: isJustLiked ? [1, 1.45, 0.88, 1.18, 1] : 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={isJustLiked
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
                    </div>
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
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
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
              <div
                className="overflow-hidden rounded-[var(--radius-xl)]"
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid rgba(59,130,246,0.4)',
                  boxShadow: '0 0 60px rgba(59,130,246,0.2), var(--shadow-xl)',
                }}
              >
                {/* Gradient bar */}
                <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }} />

                <div className="p-8 text-center space-y-5">
                  <div className="flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 15 }}
                      className="h-20 w-20 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: 'var(--shadow-blue)' }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.15, 1, 1.08, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                      >
                        <HeartIcon filled className="h-8 w-8 text-white" />
                      </motion.div>
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-heading" style={{ color: 'var(--text-primary)' }}>It&apos;s a match!</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      You and <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{showMatch.username}</span> liked each other
                    </p>
                  </div>

                  <div className="flex gap-2.5">
                    <Button variant="ghost" size="md" className="flex-1" onClick={() => setShowMatch(null)}>
                      Later
                    </Button>
                    <Link href={`/class/${id}/matches`} className="flex-1" onClick={() => setShowMatch(null)}>
                      <Button variant="primary" size="md" className="w-full">
                        View matches
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
