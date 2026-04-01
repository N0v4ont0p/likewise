'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createSchool, getUserSchools, createGroup, joinGroupByCode } from '@/lib/firestore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { School } from '@/types';
import dynamic from 'next/dynamic';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

type OnboardingAction = 'create-school' | 'select-school' | null;
type ClassAction = 'create' | 'join' | null;

const STEPS = [
  { label: 'School', icon: '🏫' },
  { label: 'Class', icon: '🎓' },
  { label: 'Done', icon: '✨' },
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // School step state
  const [schoolAction, setSchoolAction] = useState<OnboardingAction>(null);
  const [schoolName, setSchoolName] = useState('');
  const [existingSchools, setExistingSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schoolError, setSchoolError] = useState('');
  const [submittingSchool, setSubmittingSchool] = useState(false);

  // Class step state
  const [classAction, setClassAction] = useState<ClassAction>(null);
  const [className, setClassName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [classError, setClassError] = useState('');
  const [submittingClass, setSubmittingClass] = useState(false);

  // Done step state
  const [confetti, setConfetti] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);

  const goTo = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const handleSchoolActionSelect = async (action: OnboardingAction) => {
    setSchoolAction(action);
    setSchoolError('');
    if (action === 'select-school' && user) {
      setLoadingSchools(true);
      try {
        const schools = await getUserSchools(user.id);
        setExistingSchools(schools);
      } catch {
        setSchoolError('Failed to load your schools. Please try again.');
      } finally {
        setLoadingSchools(false);
      }
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !schoolName.trim()) return;
    setSchoolError('');
    setSubmittingSchool(true);
    try {
      const school = await createSchool(user.id, schoolName.trim());
      setSelectedSchool(school);
      goTo(1);
    } catch (err: unknown) {
      setSchoolError(err instanceof Error ? err.message : 'Failed to create school');
    } finally {
      setSubmittingSchool(false);
    }
  };

  const handleSelectSchool = (school: School) => {
    setSelectedSchool(school);
    goTo(1);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !className.trim()) return;
    setClassError('');
    setSubmittingClass(true);
    try {
      const group = await createGroup(user.id, user.username, className.trim(), selectedSchool?.id);
      setCreatedGroupId(group.id);
      setConfetti(true);
      goTo(2);
    } catch (err: unknown) {
      setClassError(err instanceof Error ? err.message : 'Failed to create class');
    } finally {
      setSubmittingClass(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode.trim()) return;
    setClassError('');
    setSubmittingClass(true);
    try {
      const group = await joinGroupByCode(user.id, user.username, inviteCode.trim());
      setCreatedGroupId(group.id);
      setConfetti(true);
      goTo(2);
    } catch (err: unknown) {
      setClassError(err instanceof Error ? err.message : 'Invalid invite code');
    } finally {
      setSubmittingClass(false);
    }
  };

  const handleEnterClass = () => {
    if (createdGroupId) {
      router.replace(`/class/${createdGroupId}`);
    } else {
      router.replace('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {confetti && (
        <ReactConfetti
          width={typeof window !== 'undefined' ? window.innerWidth : 400}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
          colors={['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#fff']}
          recycle={false}
          numberOfPieces={220}
        />
      )}

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-60 -right-60 h-[500px] w-[500px] rounded-full bg-pink-500/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/8 blur-3xl" />
        <motion.div
          className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-rose-500/5 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-1"
        >
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {step === 0 ? 'Set up your school' : step === 1 ? 'Join or create a class' : "You're all set 🎉"}
          </h1>
          <p className="text-white/40 text-sm">
            {step === 0
              ? 'Schools group your classes together'
              : step === 1
              ? selectedSchool
                ? `Under ${selectedSchool.name}`
                : 'Enter with an invite code or create new'
              : 'Time to connect with your classmates'}
          </p>
        </motion.div>

        {/* Step indicator */}
        <StepIndicator steps={STEPS} currentStep={step} />

        {/* Step content */}
        <div className="relative overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            {step === 0 && (
              <motion.div
                key="step-school"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <SchoolStep
                  schoolAction={schoolAction}
                  schoolName={schoolName}
                  existingSchools={existingSchools}
                  loadingSchools={loadingSchools}
                  schoolError={schoolError}
                  submitting={submittingSchool}
                  onActionSelect={handleSchoolActionSelect}
                  onSchoolNameChange={setSchoolName}
                  onCreateSchool={handleCreateSchool}
                  onSelectSchool={handleSelectSchool}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-class"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <ClassStep
                  classAction={classAction}
                  className={className}
                  inviteCode={inviteCode}
                  classError={classError}
                  submitting={submittingClass}
                  onActionSelect={setClassAction}
                  onClassNameChange={setClassName}
                  onInviteCodeChange={setInviteCode}
                  onCreateClass={handleCreateClass}
                  onJoinClass={handleJoinClass}
                  onBack={() => goTo(0)}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-done"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <DoneStep
                  schoolName={selectedSchool?.name}
                  className={className || '(via invite)'}
                  onEnter={handleEnterClass}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-step components ────────────────────────────────────────────

function SchoolStep({
  schoolAction,
  schoolName,
  existingSchools,
  loadingSchools,
  schoolError,
  submitting,
  onActionSelect,
  onSchoolNameChange,
  onCreateSchool,
  onSelectSchool,
}: {
  schoolAction: OnboardingAction;
  schoolName: string;
  existingSchools: School[];
  loadingSchools: boolean;
  schoolError: string;
  submitting: boolean;
  onActionSelect: (a: OnboardingAction) => void;
  onSchoolNameChange: (v: string) => void;
  onCreateSchool: (e: React.FormEvent) => void;
  onSelectSchool: (s: School) => void;
}) {
  if (!schoolAction) {
    return (
      <GlassCard className="p-6 space-y-4">
        <div className="text-center space-y-2 pb-2">
          <div className="text-4xl">🏫</div>
          <p className="text-white/60 text-sm">How would you like to get started?</p>
        </div>
        <div className="grid gap-3">
          <ActionCard
            icon="✨"
            title="Create a new school"
            description="Set up a new school and add classes"
            onClick={() => onActionSelect('create-school')}
          />
          <ActionCard
            icon="🔍"
            title="Use an existing school"
            description="You're already part of a school"
            onClick={() => onActionSelect('select-school')}
          />
        </div>
      </GlassCard>
    );
  }

  if (schoolAction === 'create-school') {
    return (
      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onActionSelect(null)}
            className="text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            ← Back
          </button>
          <h2 className="text-lg font-semibold text-white">Create your school</h2>
        </div>
        <form onSubmit={onCreateSchool} className="space-y-4">
          <Input
            label="School name"
            placeholder="e.g. Westview High, MIT, BCA Batch 2025..."
            value={schoolName}
            onChange={(e) => onSchoolNameChange(e.target.value)}
            required
            autoFocus
          />
          {schoolError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">
              {schoolError}
            </motion.p>
          )}
          <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
            Create School →
          </Button>
        </form>
      </GlassCard>
    );
  }

  // select-school
  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onActionSelect(null)}
          className="text-white/40 hover:text-white/70 transition-colors text-sm"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold text-white">Your schools</h2>
      </div>
      {loadingSchools ? (
        <div className="flex justify-center py-6">
          <svg className="animate-spin h-6 w-6 text-pink-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : existingSchools.length === 0 ? (
        <div className="text-center py-6 space-y-2">
          <p className="text-white/40 text-sm">No schools found.</p>
          <button
            className="text-pink-400 text-sm hover:text-pink-300 transition-colors"
            onClick={() => onActionSelect('create-school')}
          >
            Create one instead →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {existingSchools.map((school) => (
            <motion.button
              key={school.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectSchool(school)}
              className="w-full text-left px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏫</span>
                <div>
                  <p className="font-medium text-white text-sm">{school.name}</p>
                  <p className="text-xs text-white/30 mt-0.5">Tap to select</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
      {schoolError && (
        <p className="text-sm text-red-400 text-center">{schoolError}</p>
      )}
    </GlassCard>
  );
}

function ClassStep({
  classAction,
  className,
  inviteCode,
  classError,
  submitting,
  onActionSelect,
  onClassNameChange,
  onInviteCodeChange,
  onCreateClass,
  onJoinClass,
  onBack,
}: {
  classAction: ClassAction;
  className: string;
  inviteCode: string;
  classError: string;
  submitting: boolean;
  onActionSelect: (a: ClassAction) => void;
  onClassNameChange: (v: string) => void;
  onInviteCodeChange: (v: string) => void;
  onCreateClass: (e: React.FormEvent) => void;
  onJoinClass: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  if (!classAction) {
    return (
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-3 pb-1">
          <button
            onClick={onBack}
            className="text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="text-4xl">🎓</div>
        </div>
        <p className="text-white/60 text-sm">What would you like to do with this class?</p>
        <div className="grid gap-3">
          <ActionCard
            icon="✨"
            title="Create a class"
            description="Start a new class and invite people"
            onClick={() => onActionSelect('create')}
          />
          <ActionCard
            icon="🔗"
            title="Join with invite code"
            description="Enter a code shared by a classmate"
            onClick={() => onActionSelect('join')}
          />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onActionSelect(null)}
          className="text-white/40 hover:text-white/70 transition-colors text-sm"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold text-white">
          {classAction === 'create' ? 'Name your class' : 'Enter invite code'}
        </h2>
      </div>
      <form onSubmit={classAction === 'create' ? onCreateClass : onJoinClass} className="space-y-4">
        {classAction === 'create' ? (
          <Input
            label="Class name"
            placeholder="e.g. CS101, Physics A, Math Olympiad..."
            value={className}
            onChange={(e) => onClassNameChange(e.target.value)}
            required
            autoFocus
          />
        ) : (
          <Input
            label="Invite code"
            placeholder="ABC123"
            value={inviteCode}
            onChange={(e) => onInviteCodeChange(e.target.value.toUpperCase())}
            className="font-mono tracking-widest text-center uppercase text-xl"
            maxLength={6}
            required
            autoFocus
          />
        )}
        {classError && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">
            {classError}
          </motion.p>
        )}
        <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
          {classAction === 'create' ? 'Create Class →' : 'Join Class →'}
        </Button>
      </form>
    </GlassCard>
  );
}

function DoneStep({
  schoolName,
  className,
  onEnter,
}: {
  schoolName?: string;
  className: string;
  onEnter: () => void;
}) {
  return (
    <GlassCard glow className="p-8 text-center space-y-6 border-pink-500/30 bg-pink-500/5">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
        className="text-6xl"
      >
        🎉
      </motion.div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">You&apos;re in!</h2>
        {schoolName && (
          <p className="text-white/50 text-sm">
            <span className="text-white/80">{schoolName}</span> · <span className="text-pink-400">{className}</span>
          </p>
        )}
        <p className="text-white/40 text-sm">Start connecting with your classmates 💝</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button variant="primary" size="lg" onClick={onEnter} className="w-full">
          Enter class ✨
        </Button>
      </motion.div>
    </GlassCard>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="w-full text-left px-4 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/30 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-xl group-hover:bg-pink-500/20 transition-colors">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{title}</p>
          <p className="text-xs text-white/40 mt-0.5">{description}</p>
        </div>
        <span className="ml-auto text-white/20 group-hover:text-white/50 transition-colors">→</span>
      </div>
    </motion.button>
  );
}
