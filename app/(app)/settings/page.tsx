'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteAccount, logOut } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDeleting(true);
    const formatError = (err: unknown) => {
      const errorLike = err as { code?: string; message?: string };
      if (
        errorLike?.code === 'auth/wrong-password' ||
        errorLike?.code === 'auth/invalid-credential'
      ) {
        return 'Incorrect password';
      }
      if (errorLike?.message) return errorLike.message;
      if (err instanceof Error) return err.message;
      return 'Failed to delete account';
    };
    try {
      await deleteAccount(deletePassword);
      router.replace('/');
    } catch (err: unknown) {
      setError(formatError(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-5 py-8 space-y-6">
        <PageHeader title="Settings" back="/dashboard" />

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard className="p-5">
            <div className="flex items-center gap-4">
              <Avatar name={user?.username || '?'} size="lg" />
              <div>
                <p className="font-bold text-white text-[1.0625rem]">{user?.username}</p>
                <p className="text-[0.8125rem] text-[var(--text-secondary)] mt-0.5">
                  {user?.createdAt
                    ? `Joined ${new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}`
                    : 'Member'}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard className="overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <p className="text-[0.7rem] font-medium text-[var(--text-tertiary)] uppercase tracking-widest">
                Privacy
              </p>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {[
                {
                  icon: '🔒',
                  title: 'Matches are private',
                  desc: 'Only mutual matches are ever revealed to either party',
                },
                {
                  icon: '🙈',
                  title: 'Zero exposure',
                  desc: "Nobody can see who you've liked",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3.5 px-5 py-3.5">
                  <div className="h-9 w-9 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-base shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[0.9375rem] font-medium text-white">{item.title}</p>
                    <p className="text-[0.8125rem] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard className="p-4">
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => logOut().then(() => router.replace('/'))}
            >
              Sign out
            </Button>
          </GlassCard>
        </motion.div>

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard className="p-5 space-y-4 border-[#4a1a28]">
            <p className="text-[0.7rem] font-medium text-red-400/70 uppercase tracking-widest">
              Danger zone
            </p>
            <AnimatePresence mode="wait">
              {!showDeleteConfirm ? (
                <motion.div
                  key="delete-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    variant="danger"
                    size="md"
                    className="w-full"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete account
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="delete-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleDeleteAccount}
                  className="space-y-4 overflow-hidden"
                >
                  <p className="text-[0.875rem] text-[var(--text-secondary)] leading-relaxed">
                    This permanently deletes your account and all your likes. This cannot be undone.
                  </p>
                  <Input
                    label="Confirm with your password"
                    type="password"
                    placeholder="••••••••"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                  />
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#2a1520] border border-[#4a1a28] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm text-red-300">
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
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword('');
                        setError('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="danger"
                      size="md"
                      loading={deleting}
                      className="flex-1"
                    >
                      Delete forever
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
