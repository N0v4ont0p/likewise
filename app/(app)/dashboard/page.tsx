'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  getUserGroups,
  getUserSchools,
  getSchoolClasses,
  createGroup,
  joinGroupByCode,
} from '@/lib/firestore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Group, School } from '@/types';
import Link from 'next/link';

type Modal = 'create' | 'join' | null;

interface SchoolWithClasses {
  school: School;
  classes: Group[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [schoolsData, setSchoolsData] = useState<SchoolWithClasses[]>([]);
  const [ungroupedClasses, setUngroupedClasses] = useState<{ group: Group; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [schools, allGroups] = await Promise.all([
          getUserSchools(user.id),
          getUserGroups(user.id),
        ]);

        if (schools.length === 0 && allGroups.length === 0) {
          router.replace('/onboarding');
          return;
        }

        const schoolsWithClasses = await Promise.all(
          schools.map(async (school) => {
            const classes = await getSchoolClasses(school.id);
            return { school, classes };
          })
        );

        const schoolGroupIds = new Set(
          schoolsWithClasses.flatMap((s) => s.classes.map((c) => c.id))
        );

        const ungrouped = allGroups.filter((g) => !schoolGroupIds.has(g.group.id));

        setSchoolsData(schoolsWithClasses);
        setUngroupedClasses(ungrouped);
        setExpandedSchools(new Set(schools.map((s) => s.id)));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, router]);

  const toggleSchool = (schoolId: string) => {
    setExpandedSchools((prev) => {
      const next = new Set(prev);
      if (next.has(schoolId)) next.delete(schoolId);
      else next.add(schoolId);
      return next;
    });
  };

  const openModal = (type: Modal) => {
    setModal(type);
    setError('');
    setGroupName('');
    setInviteCode('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupName.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      const group = await createGroup(user.id, user.username, groupName.trim());
      setUngroupedClasses((prev) => [...prev, { group, role: 'owner' }]);
      setModal(null);
      router.push(`/class/${group.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      const group = await joinGroupByCode(user.id, user.username, inviteCode.trim());
      setUngroupedClasses((prev) => {
        const exists = prev.find((g) => g.group.id === group.id);
        if (exists) return prev;
        return [...prev, { group, role: 'member' }];
      });
      setModal(null);
      router.push(`/class/${group.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const totalClasses =
    schoolsData.reduce((sum, s) => sum + s.classes.length, 0) + ungroupedClasses.length;

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-5 py-8 space-y-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💝</span>
              <h1 className="text-[1.4375rem] font-bold text-white">
                {user?.username}
              </h1>
            </div>
            <p className="text-white/35 text-sm mt-0.5 ml-0.5">
              {loading
                ? 'Loading…'
                : totalClasses === 0
                ? 'No classes yet'
                : `${totalClasses} class${totalClasses !== 1 ? 'es' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full" aria-label="Settings">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8.5" cy="8.5" r="2.125"/>
                  <path d="M13.725 10.625a1.171 1.171 0 00.234 1.295l.042.042a1.417 1.417 0 01-2.004 2.004l-.042-.042a1.171 1.171 0 00-1.295-.234 1.171 1.171 0 00-.708 1.071V15a1.417 1.417 0 01-2.834 0v-.064a1.171 1.171 0 00-.767-1.071 1.171 1.171 0 00-1.295.234l-.042.042a1.417 1.417 0 01-2.004-2.004l.042-.042a1.171 1.171 0 00.234-1.295 1.171 1.171 0 00-1.071-.708H2a1.417 1.417 0 010-2.834h.064a1.171 1.171 0 001.071-.767 1.171 1.171 0 00-.234-1.295l-.042-.042A1.417 1.417 0 014.863 3.15l.042.042a1.171 1.171 0 001.295.234h.057a1.171 1.171 0 00.708-1.071V2a1.417 1.417 0 012.834 0v.064a1.171 1.171 0 00.708 1.071 1.171 1.171 0 001.295-.234l.042-.042a1.417 1.417 0 012.004 2.004l-.042.042a1.171 1.171 0 00-.234 1.295v.057a1.171 1.171 0 001.071.708H15a1.417 1.417 0 010 2.834h-.064a1.171 1.171 0 00-1.071.708z"/>
                </svg>
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-3 gap-2.5"
        >
          <Button
            variant="primary"
            size="sm"
            className="w-full text-[0.8125rem]"
            onClick={() => router.push('/onboarding')}
          >
            + School
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full text-[0.8125rem]"
            onClick={() => openModal('create')}
          >
            + Class
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full text-[0.8125rem]"
            onClick={() => openModal('join')}
          >
            Join
          </Button>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : totalClasses === 0 ? (
          <GlassCard className="overflow-hidden">
            <EmptyState
              icon="🎓"
              title="No classes yet"
              description="Create or join a class to start connecting with your classmates"
              action={
                <Button variant="primary" size="sm" onClick={() => router.push('/onboarding')}>
                  Get started
                </Button>
              }
            />
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {/* Schools with classes */}
            {schoolsData.map(({ school, classes }, si) => (
              <motion.div
                key={school.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard className="overflow-hidden">
                  {/* School header */}
                  <button
                    onClick={() => toggleSchool(school.id)}
                    className="w-full flex items-center gap-3.5 p-4 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-white/[0.09] flex items-center justify-center text-base shrink-0">
                      🏫
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-white text-[0.9375rem] truncate">
                        {school.name}
                      </p>
                      <p className="text-[0.75rem] text-white/35 mt-0.5">
                        {classes.length} class{classes.length !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <motion.svg
                      animate={{ rotate: expandedSchools.has(school.id) ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="text-white/30 shrink-0"
                    >
                      <path
                        d="M5.5 3.5L9 7l-3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  </button>

                  {/* Classes list */}
                  <AnimatePresence>
                    {expandedSchools.has(school.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/[0.06]">
                          {classes.length === 0 ? (
                            <div className="px-4 py-4 pl-[3.875rem]">
                              <p className="text-[0.75rem] text-white/28">No classes yet</p>
                            </div>
                          ) : (
                            classes.map((cls) => (
                              <Link key={cls.id} href={`/class/${cls.id}`}>
                                <div className="flex items-center gap-3 px-4 py-3 pl-[3.875rem] hover:bg-white/[0.04] transition-colors border-b border-white/[0.05] last:border-0">
                                  <div className="h-7 w-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xs shrink-0">
                                    🎓
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[0.875rem] text-white font-medium truncate">
                                      {cls.name}
                                    </p>
                                    <p className="text-[0.7rem] text-white/25 font-mono mt-0.5 tracking-wide">
                                      {cls.inviteCode}
                                    </p>
                                  </div>
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    className="text-white/18 shrink-0"
                                  >
                                    <path
                                      d="M4.5 2.5L8 6l-3.5 3.5"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                              </Link>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}

            {/* Ungrouped classes */}
            {ungroupedClasses.length > 0 && (
              <div className="space-y-2.5">
                {schoolsData.length > 0 && (
                  <p className="text-[0.7rem] font-medium text-white/28 uppercase tracking-widest px-0.5">
                    Other classes
                  </p>
                )}
                {ungroupedClasses.map(({ group, role }, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: (schoolsData.length + i) * 0.06,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link href={`/class/${group.id}`}>
                      <GlassCard interactive className="p-4">
                        <div className="flex items-center gap-3.5">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/15 to-violet-500/15 border border-white/[0.09] flex items-center justify-center text-base shrink-0">
                            🎓
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white text-[0.9375rem] truncate">
                                {group.name}
                              </h3>
                              <Badge variant={role === 'owner' ? 'pink' : 'muted'}>
                                {role === 'owner' ? 'Owner' : 'Member'}
                              </Badge>
                            </div>
                            <p className="text-[0.75rem] text-white/30 font-mono tracking-wide mt-0.5">
                              {group.inviteCode}
                            </p>
                          </div>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            className="text-white/25 shrink-0"
                          >
                            <path
                              d="M5.5 3.5L9 7l-3.5 3.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </GlassCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Join modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModal(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-sm"
            >
              <GlassCard className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[1.0625rem] font-bold text-white">
                    {modal === 'create' ? 'Create a class' : 'Join a class'}
                  </h2>
                  <button
                    onClick={() => setModal(null)}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white/35 hover:text-white/65 hover:bg-white/[0.07] transition-colors"
                    aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 2l10 10M12 2L2 12"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <form
                  onSubmit={modal === 'create' ? handleCreate : handleJoin}
                  className="space-y-4"
                >
                  {modal === 'create' ? (
                    <Input
                      label="Class name"
                      placeholder="e.g. CS101, History 2025…"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                      autoFocus
                    />
                  ) : (
                    <Input
                      label="Invite code"
                      placeholder="ABC123"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="font-mono tracking-[0.25em] text-center text-xl uppercase"
                      maxLength={6}
                      required
                      autoFocus
                    />
                  )}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-red-500/[0.1] border border-red-500/[0.2] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm text-red-300">
                          {error}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex gap-2.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => setModal(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={submitting}
                      className="flex-1"
                    >
                      {modal === 'create' ? 'Create' : 'Join'}
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
