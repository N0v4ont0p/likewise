'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserGroups, getUserSchools, getSchoolClasses, createGroup, joinGroupByCode } from '@/lib/firestore';
import { logOut } from '@/lib/auth';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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

        // Load classes per school
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupName.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      const group = await createGroup(user.id, user.username, groupName.trim());
      setUngroupedClasses((prev) => [...prev, { group, role: 'owner' }]);
      setModal(null);
      setGroupName('');
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
      setInviteCode('');
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
    <div className="min-h-screen p-4">
      {/* Background accents */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-pink-500/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-500/8 blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto space-y-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">
              Hey, <span className="text-pink-400">{user?.username}</span> 👋
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              {totalClasses === 0 ? 'No classes yet' : `${totalClasses} class${totalClasses !== 1 ? 'es' : ''}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="sm">⚙️</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => logOut().then(() => router.replace('/'))}>
              Sign out
            </Button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-2"
        >
          <Button variant="primary" size="md" onClick={() => router.push('/onboarding')} className="col-span-1">
            + School
          </Button>
          <Button variant="secondary" size="md" onClick={() => { setModal('create'); setError(''); }} className="col-span-1">
            + Class
          </Button>
          <Button variant="secondary" size="md" onClick={() => { setModal('join'); setError(''); }} className="col-span-1">
            Join
          </Button>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : totalClasses === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard className="p-10 text-center space-y-3">
              <div className="text-5xl">🎓</div>
              <h3 className="text-lg font-semibold text-white">No classes yet</h3>
              <p className="text-white/40 text-sm">Create a school and class to get started</p>
              <Button variant="primary" size="md" onClick={() => router.push('/onboarding')} className="mt-2">
                Get started →
              </Button>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Schools with classes */}
            {schoolsData.map(({ school, classes }, si) => (
              <motion.div
                key={school.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.06 }}
              >
                <GlassCard className="overflow-hidden">
                  {/* School header */}
                  <button
                    onClick={() => toggleSchool(school.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-base">
                      🏫
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white text-sm">{school.name}</p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {classes.length} class{classes.length !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <motion.span
                      animate={{ rotate: expandedSchools.has(school.id) ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-white/30 text-sm"
                    >
                      →
                    </motion.span>
                  </button>

                  {/* Classes list */}
                  <AnimatePresence>
                    {expandedSchools.has(school.id) && classes.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/5 divide-y divide-white/5">
                          {classes.map((cls) => (
                            <Link key={cls.id} href={`/class/${cls.id}`}>
                              <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ml-3">
                                <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs">
                                  🎓
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-white font-medium">{cls.name}</p>
                                  <p className="text-xs text-white/30 font-mono">{cls.inviteCode}</p>
                                </div>
                                <span className="text-white/20 text-xs">→</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    {expandedSchools.has(school.id) && classes.length === 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/5 px-4 py-4 ml-3">
                          <p className="text-xs text-white/30">No classes yet — create one!</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}

            {/* Ungrouped classes */}
            {ungroupedClasses.length > 0 && (
              <div className="space-y-2">
                {schoolsData.length > 0 && (
                  <p className="text-xs font-medium text-white/30 uppercase tracking-wider px-1">Other classes</p>
                )}
                {ungroupedClasses.map(({ group, role }, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (schoolsData.length + i) * 0.06 }}
                  >
                    <Link href={`/class/${group.id}`}>
                      <GlassCard
                        className="p-4 hover:bg-white/10 transition-all cursor-pointer"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-base">
                              🎓
                            </div>
                            <div>
                              <h3 className="font-semibold text-white text-sm">{group.name}</h3>
                              <p className="text-xs text-white/40 mt-0.5">
                                {role === 'owner' ? '👑 Owner' : '👤 Member'} ·{' '}
                                <span className="font-mono text-pink-400">{group.inviteCode}</span>
                              </p>
                            </div>
                          </div>
                          <span className="text-white/30">→</span>
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

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 6 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="w-full max-w-sm"
            >
              <GlassCard className="p-6 space-y-5">
                <h2 className="text-xl font-bold text-white">
                  {modal === 'create' ? '🎓 Create a class' : '🔗 Join a class'}
                </h2>
                <form onSubmit={modal === 'create' ? handleCreate : handleJoin} className="space-y-4">
                  {modal === 'create' ? (
                    <Input
                      label="Class name"
                      placeholder="e.g. CS101, History 2025..."
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
                      className="font-mono tracking-widest text-center uppercase"
                      maxLength={6}
                      required
                      autoFocus
                    />
                  )}
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">
                      {error}
                    </motion.p>
                  )}
                  <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={() => setModal(null)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={submitting} className="flex-1">
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
