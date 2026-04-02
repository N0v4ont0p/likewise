'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteAccount, logOut } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/useAuth';
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
    <div className="lw-page-top" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-5 pt-10 pb-12 space-y-6">
        <PageHeader title="Settings" back="/dashboard" />

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[var(--radius-xl)] p-5"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <Avatar name={user?.username || '?'} size="lg" />
            <div>
              <p className="font-bold text-white text-[1.0625rem]">{user?.username}</p>
              <p className="text-[0.8125rem] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {user?.createdAt
                  ? `Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                  : 'Member'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[var(--radius-xl)]"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        >
          <div className="px-5 pt-5 pb-3">
            <p className="text-label" style={{ color: 'var(--text-tertiary)' }}>PRIVACY</p>
          </div>
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { icon: '🔒', title: 'Matches are private', desc: 'Only mutual matches are ever revealed to either party' },
              { icon: '🙈', title: 'Zero exposure', desc: "Nobody can see who you've liked" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 px-5 py-4"
                style={{ borderBottom: i === 0 ? '1px solid var(--border-subtle)' : 'none' }}
              >
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-white text-[0.9375rem]">{item.title}</p>
                  <p className="text-[0.8125rem] mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[var(--radius-xl)] p-4"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        >
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => logOut().then(() => router.replace('/'))}
          >
            Sign out
          </Button>
        </motion.div>

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[var(--radius-xl)] p-5 space-y-4"
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <p className="text-label" style={{ color: 'rgba(248,113,113,0.7)' }}>DANGER ZONE</p>
          <AnimatePresence mode="wait">
            {!showDeleteConfirm ? (
              <motion.div key="delete-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button variant="danger" size="md" className="w-full" onClick={() => setShowDeleteConfirm(true)}>
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
                <p className="text-[0.875rem] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
                  <Button type="button" variant="ghost" size="md" className="flex-1"
                    onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setError(''); }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="danger" size="md" loading={deleting} className="flex-1">
                    Delete forever
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}


