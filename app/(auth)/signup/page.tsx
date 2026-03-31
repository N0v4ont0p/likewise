'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signUp } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';

const passwordRequirements = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = passwordRequirements.filter((r) => r.test(password)).length;
  const isPasswordValid = passwordStrength === passwordRequirements.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signUp(username.trim(), password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="text-4xl">💝</div>
              <h1 className="text-2xl font-bold text-white">Create account</h1>
              <p className="text-white/50 text-sm">Join Mutual Match</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  label="Username"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  required
                />
                <p className="mt-1 text-xs text-white/30">3-20 chars, letters, numbers, underscores</p>
              </div>

              <div className="space-y-2">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                {password && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength
                              ? passwordStrength <= 1
                                ? 'bg-red-500'
                                : passwordStrength <= 2
                                ? 'bg-yellow-500'
                                : passwordStrength <= 3
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-1">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div
                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                              req.test(password) ? 'bg-green-400' : 'bg-white/20'
                            }`}
                          />
                          <span
                            className={`text-xs transition-colors ${
                              req.test(password) ? 'text-green-400' : 'text-white/30'
                            }`}
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
                required
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2"
              >
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-white/40">
              Already have an account?{' '}
              <Link href="/login" className="text-pink-400 hover:text-pink-300 transition-colors">
                Sign in
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
