'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { deleteAccount, logOut } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
    try {
      await deleteAccount(deletePassword);
      router.replace('/');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password');
      } else {
        setError(err.message || 'Failed to delete account');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto space-y-6 py-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>←</Button>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>

        <GlassCard className="p-5 space-y-2">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Account</p>
          <div className="flex items-center gap-3 pt-1">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-white font-semibold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">{user?.username}</p>
              <p className="text-xs text-white/30">Member since account creation</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Privacy</p>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-lg mt-0.5">🔒</span>
              <div>
                <p className="text-sm font-medium text-white">Matches are private</p>
                <p className="text-xs text-white/40 mt-0.5">Only mutual matches are ever revealed to either party</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-lg mt-0.5">🙈</span>
              <div>
                <p className="text-sm font-medium text-white">Zero exposure</p>
                <p className="text-xs text-white/40 mt-0.5">Nobody can see who you&apos;ve liked</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => logOut().then(() => router.replace('/'))}
          >
            Sign out
          </Button>
        </GlassCard>

        <GlassCard className="p-5 space-y-4 border-red-500/20">
          <p className="text-xs text-red-400 uppercase tracking-wider font-medium">Danger Zone</p>
          {!showDeleteConfirm ? (
            <Button
              variant="danger"
              size="md"
              className="w-full"
              onClick={() => setShowDeleteConfirm(true)}
            >
              🗑️ Delete account
            </Button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleDeleteAccount}
              className="space-y-4"
            >
              <p className="text-sm text-white/60">
                This will permanently delete your account and all your likes. This cannot be undone.
              </p>
              <Input
                label="Confirm with your password"
                type="password"
                placeholder="••••••••"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setError(''); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger" loading={deleting} className="flex-1">
                  Delete forever
                </Button>
              </div>
            </motion.form>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
