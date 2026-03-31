'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createGroup, joinGroupByCode, getUserGroups } from '@/lib/firestore';
import { logOut } from '@/lib/auth';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Group } from '@/types';
import Link from 'next/link';

type Modal = 'create' | 'join' | null;

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<{ group: Group; role: string }[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [modal, setModal] = useState<Modal>(null);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getUserGroups(user.id).then((g) => {
      setGroups(g);
      setLoadingGroups(false);
    });
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupName.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      const group = await createGroup(user.id, user.username, groupName.trim());
      setGroups((prev) => [...prev, { group, role: 'owner' }]);
      setModal(null);
      setGroupName('');
      router.push(`/class/${group.id}`);
    } catch (err: any) {
      setError(err.message);
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
      setGroups((prev) => {
        const exists = prev.find((g) => g.group.id === group.id);
        if (exists) return prev;
        return [...prev, { group, role: 'member' }];
      });
      setModal(null);
      setInviteCode('');
      router.push(`/class/${group.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto space-y-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Hey, <span className="text-pink-400">{user?.username}</span> 👋
            </h1>
            <p className="text-white/40 text-sm mt-0.5">Your classes</p>
          </div>
          <div className="flex gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="sm">⚙️</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => logOut().then(() => router.replace('/'))}>
              Sign out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="primary" size="md" onClick={() => { setModal('create'); setError(''); }}>
            + Create class
          </Button>
          <Button variant="secondary" size="md" onClick={() => { setModal('join'); setError(''); }}>
            Join class
          </Button>
        </div>

        {loadingGroups ? (
          <LoadingSpinner />
        ) : groups.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <div className="text-4xl mb-3">🎓</div>
            <p className="text-white/50">No classes yet. Create or join one!</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {groups.map(({ group, role }, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/class/${group.id}`}>
                  <GlassCard className="p-4 hover:bg-white/10 transition-all cursor-pointer" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{group.name}</h3>
                        <p className="text-xs text-white/40 mt-0.5">
                          {role === 'owner' ? '👑 Owner' : '👤 Member'} · Code: <span className="font-mono text-pink-400">{group.inviteCode}</span>
                        </p>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-sm"
            >
              <GlassCard className="p-6 space-y-4">
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
                      placeholder="e.g. ABC123"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="font-mono tracking-widest text-center uppercase"
                      maxLength={6}
                      required
                      autoFocus
                    />
                  )}
                  {error && <p className="text-sm text-red-400">{error}</p>}
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
