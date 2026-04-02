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
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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
    <div className="lw-page-top" style={{ background: 'var(--bg)' }}>
      {/* Top accent glow */}
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 h-px z-50"
        style={{ background: 'linear-gradient(90deg, transparent, #f7365e, transparent)' }}
        aria-hidden="true"
      />

      <div className="max-w-lg mx-auto px-5 pt-10 pb-12 space-y-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f7365e, #c026d3)', boxShadow: '0 4px 16px rgba(247,54,94,0.35)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h1 className="text-title text-white">{user?.username}</h1>
            </div>
            <p className="text-[0.8125rem] pl-0.5" style={{ color: 'var(--text-secondary)' }}>
              {loading
                ? 'Loading…'
                : totalClasses === 0
                ? 'No classes yet'
                : `${totalClasses} class${totalClasses !== 1 ? 'es' : ''}`}
            </p>
          </div>
          <Link href="/settings">
            <button
              className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
              aria-label="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8.5" cy="8.5" r="2.125"/>
                <path d="M13.725 10.625a1.171 1.171 0 00.234 1.295l.042.042a1.417 1.417 0 01-2.004 2.004l-.042-.042a1.171 1.171 0 00-1.295-.234 1.171 1.171 0 00-.708 1.071V15a1.417 1.417 0 01-2.834 0v-.064a1.171 1.171 0 00-.767-1.071 1.171 1.171 0 00-1.295.234l-.042.042a1.417 1.417 0 01-2.004-2.004l.042-.042a1.171 1.171 0 00.234-1.295 1.171 1.171 0 00-1.071-.708H2a1.417 1.417 0 010-2.834h.064a1.171 1.171 0 001.071-.767 1.171 1.171 0 00-.234-1.295l-.042-.042A1.417 1.417 0 014.863 3.15l.042.042a1.171 1.171 0 001.295.234h.057a1.171 1.171 0 00.708-1.071V2a1.417 1.417 0 012.834 0v.064a1.171 1.171 0 00.708 1.071 1.171 1.171 0 001.295-.234l.042-.042a1.417 1.417 0 012.004 2.004l-.042.042a1.171 1.171 0 00-.234 1.295v.057a1.171 1.171 0 001.071.708H15a1.417 1.417 0 010 2.834h-.064a1.171 1.171 0 00-1.071.708z"/>
              </svg>
            </button>
          </Link>
        </motion.div>

        {/* ── Quick actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-3 gap-2.5"
        >
          {[
            { label: '+ School', action: () => router.push('/onboarding'), variant: 'primary' as const },
            { label: '+ Class', action: () => openModal('create'), variant: 'secondary' as const },
            { label: 'Join', action: () => openModal('join'), variant: 'secondary' as const },
          ].map((btn) => (
            <Button key={btn.label} variant={btn.variant} size="sm" className="w-full text-[0.8125rem] font-semibold" onClick={btn.action}>
              {btn.label}
            </Button>
          ))}
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading your classes…</p>
          </div>
        ) : totalClasses === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[var(--radius-xl)] p-10 text-center space-y-5"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            <div className="text-5xl">🎓</div>
            <div>
              <h3 className="text-title text-white">No classes yet</h3>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Create or join a class to start connecting with your classmates
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => router.push('/onboarding')}>
              Get started →
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Schools with classes */}
            {schoolsData.map(({ school, classes }, si) => (
              <motion.div
                key={school.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="overflow-hidden rounded-[var(--radius-lg)]"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                >
                  {/* School header */}
                  <button
                    onClick={() => toggleSchool(school.id)}
                    className="hover-row w-full flex items-center gap-3.5 p-4"
                    style={{ background: 'transparent' }}
                  >
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-base shrink-0"
                      style={{ background: 'rgba(247,54,94,0.08)', border: '1px solid rgba(247,54,94,0.15)' }}
                    >
                      🏫
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-white text-[0.9375rem] truncate">{school.name}</p>
                      <p className="text-[0.75rem] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {classes.length} class{classes.length !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <motion.svg
                      animate={{ rotate: expandedSchools.has(school.id) ? 90 : 0 }}
                      transition={{ duration: 0.22 }}
                      width="14" height="14" viewBox="0 0 14 14" fill="none"
                      style={{ color: 'var(--text-tertiary)' }}
                      className="shrink-0"
                    >
                      <path d="M5.5 3.5L9 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  </button>

                  <AnimatePresence>
                    {expandedSchools.has(school.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div style={{ borderTop: '1px solid var(--border)' }}>
                          {classes.length === 0 ? (
                            <div className="px-4 py-4 pl-[3.875rem]">
                              <p className="text-[0.75rem]" style={{ color: 'var(--text-tertiary)' }}>No classes yet</p>
                            </div>
                          ) : (
                            classes.map((cls) => (
                              <Link key={cls.id} href={`/class/${cls.id}`}>
                                <div
                                  className="hover-row flex items-center gap-3 px-4 py-3 pl-[3.875rem]"
                                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                                >
                                  <div
                                    className="h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                                  >
                                    🎓
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[0.875rem] text-white font-medium truncate">{cls.name}</p>
                                    <p className="text-[0.7rem] font-mono tracking-wide mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                      {cls.inviteCode}
                                    </p>
                                  </div>
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--text-muted)' }} className="shrink-0">
                                    <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </Link>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}

            {/* Ungrouped classes */}
            {ungroupedClasses.length > 0 && (
              <div className="space-y-2.5">
                {schoolsData.length > 0 && (
                  <p className="text-label px-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    OTHER CLASSES
                  </p>
                )}
                {ungroupedClasses.map(({ group, role }, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (schoolsData.length + i) * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={`/class/${group.id}`}>
                      <div
                        className="rounded-[var(--radius-lg)] p-4 flex items-center gap-3.5 card-interactive"
                        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                      >
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-base shrink-0"
                          style={{ background: 'rgba(124,92,252,0.08)', border: '1px solid rgba(124,92,252,0.15)' }}
                        >
                          🎓
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white text-[0.9375rem] truncate">{group.name}</h3>
                            <Badge variant={role === 'owner' ? 'pink' : 'muted'}>
                              {role === 'owner' ? 'Owner' : 'Member'}
                            </Badge>
                          </div>
                          <p className="text-[0.75rem] font-mono tracking-wide mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                            {group.inviteCode}
                          </p>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--text-tertiary)' }} className="shrink-0">
                          <path d="M5.5 3.5L9 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              className="w-full max-w-sm"
            >
              <div
                className="rounded-[var(--radius-xl)] p-6 space-y-5"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-xl)' }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-title text-white">
                    {modal === 'create' ? 'Create a class' : 'Join a class'}
                  </h2>
                  <button
                    onClick={() => setModal(null)}
                    className="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
                    aria-label="Close"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M1.5 1.5l10 10M11.5 1.5l-10 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={modal === 'create' ? handleCreate : handleJoin} className="space-y-4">
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
                        <div
                          className="rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
                        >
                          {error}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex gap-2.5">
                    <Button type="button" variant="ghost" size="md" onClick={() => setModal(null)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="md" loading={submitting} className="flex-1">
                      {modal === 'create' ? 'Create' : 'Join'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


