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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { School } from '@/types';
import dynamic from 'next/dynamic';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

type OnboardingAction = 'create-school' | 'select-school' | null;
type ClassAction = 'create' | 'join' | null;

// Step -1 is the welcome screen (not counted in StepIndicator)
const STEPS = [
  { label: 'School', icon: '🏫' },
  { label: 'Class', icon: '🎓' },
  { label: 'Done', icon: '✨' },
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 30 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  // step -1 = welcome, 0 = school, 1 = class, 2 = done
  const [step, setStep] = useState(-1);
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
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
      {confetti && (
        <ReactConfetti
          width={typeof window !== 'undefined' ? window.innerWidth : 400}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
          colors={['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#fff']}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* No background glow — solid layout */}

      <div className="w-full max-w-md space-y-7">
        {/* Header row */}
        <AnimatePresence mode="wait">
          {step === -1 ? (
            <motion.div
              key="welcome-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <h1 className="text-2xl font-bold text-white">Welcome to Likewise</h1>
              <p className="text-[var(--text-secondary)] text-sm mt-1">Here&apos;s how it works</p>
            </motion.div>
          ) : step < 2 ? (
            <motion.div
              key="step-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {step === 0 ? 'Set up your school' : 'Join or create a class'}
                </h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                  {step === 0
                    ? 'Schools group your classes together'
                    : selectedSchool
                    ? `Under ${selectedSchool.name}`
                    : 'Enter a code or start a new one'}
                </p>
              </div>
              <StepIndicator steps={STEPS} currentStep={step} />
            </motion.div>
          ) : (
            <motion.div
              key="done-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">You&apos;re all set! 🎉</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">Time to meet your classmates</p>
              </div>
              <StepIndicator steps={STEPS} currentStep={step} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step content */}
        <div className="relative overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            {step === -1 && (
              <motion.div
                key="welcome"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <WelcomeStep onContinue={() => goTo(0)} />
              </motion.div>
            )}

            {step === 0 && (
              <motion.div
                key="step-school"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
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

// ─── Welcome Step ────────────────────────────────────────────────────────────

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="p-7 space-y-6">
        <div className="space-y-4">
          {[
            { icon: '🏫', title: 'Join a school', desc: 'Your school groups everything under one roof' },
            { icon: '🎓', title: 'Enter a class', desc: 'Classes let you connect with specific classmates' },
            { icon: '💝', title: 'Like privately', desc: 'Only mutual likes ever become visible — to both sides' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-4"
            >
              <div className="h-11 w-11 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-xl shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div>
                <p className="font-semibold text-white text-[0.9375rem]">{item.title}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-1">
          <Button variant="primary" size="lg" className="w-full" onClick={onContinue}>
            Let&apos;s get started
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

// ─── School Step ─────────────────────────────────────────────────────────────

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
        <p className="text-[var(--text-secondary)] text-sm">How would you like to get started?</p>
        <div className="space-y-2.5">
          <OptionCard
            icon="✨"
            title="Create a new school"
            description="Set up a school and add classes to it"
            onClick={() => onActionSelect('create-school')}
          />
          <OptionCard
            icon="🔍"
            title="Use an existing school"
            description="You&apos;re already part of a school"
            onClick={() => onActionSelect('select-school')}
          />
        </div>
      </GlassCard>
    );
  }

  if (schoolAction === 'create-school') {
    return (
      <GlassCard className="p-6 space-y-5">
        <BackButton onClick={() => onActionSelect(null)} label="Choose option" />
        <form onSubmit={onCreateSchool} className="space-y-4">
          <Input
            label="School name"
            placeholder="e.g. Westview High, MIT, BCA Batch 2025…"
            value={schoolName}
            onChange={(e) => onSchoolNameChange(e.target.value)}
            required
            autoFocus
          />
          {schoolError && (
            <ErrorNote>{schoolError}</ErrorNote>
          )}
          <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
            Create school
          </Button>
        </form>
      </GlassCard>
    );
  }

  // select-school
  return (
    <GlassCard className="p-6 space-y-4">
      <BackButton onClick={() => onActionSelect(null)} label="Choose option" />
      {loadingSchools ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : existingSchools.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <p className="text-4xl">🏫</p>
          <p className="text-[var(--text-secondary)] text-sm">No schools found.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onActionSelect('create-school')}
          >
            Create one instead
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {existingSchools.map((school) => (
            <motion.button
              key={school.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectSchool(school)}
              className="w-full text-left px-4 py-3.5 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-3)] hover:border-[var(--border-accent)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-lg shrink-0">🏫</div>
                <div>
                  <p className="font-semibold text-white text-[0.9375rem]">{school.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Tap to select</p>
                </div>
                <svg className="ml-auto text-[var(--text-tertiary)]" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      )}
      {schoolError && <ErrorNote>{schoolError}</ErrorNote>}
    </GlassCard>
  );
}

// ─── Class Step ───────────────────────────────────────────────────────────────

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
        <BackButton onClick={onBack} label="School" />
        <p className="text-[var(--text-secondary)] text-sm">What would you like to do?</p>
        <div className="space-y-2.5">
          <OptionCard
            icon="✨"
            title="Create a class"
            description="Start a new class and invite people"
            onClick={() => onActionSelect('create')}
          />
          <OptionCard
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
      <BackButton onClick={() => onActionSelect(null)} label="Choose option" />
      <form onSubmit={classAction === 'create' ? onCreateClass : onJoinClass} className="space-y-4">
        {classAction === 'create' ? (
          <Input
            label="Class name"
            placeholder="e.g. CS101, Physics A, Math Olympiad…"
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
            className="font-mono tracking-[0.25em] text-center text-xl uppercase"
            maxLength={6}
            required
            autoFocus
          />
        )}
        {classError && <ErrorNote>{classError}</ErrorNote>}
        <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
          {classAction === 'create' ? 'Create class' : 'Join class'}
        </Button>
      </form>
    </GlassCard>
  );
}

// ─── Done Step ────────────────────────────────────────────────────────────────

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
    <GlassCard glow className="p-8 text-center space-y-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.08 }}
        className="text-6xl"
      >
        🎉
      </motion.div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">You&apos;re in!</h2>
        {schoolName && (
          <p className="text-[var(--text-secondary)] text-sm">
            <span className="text-white font-medium">{schoolName}</span>
            <span className="mx-1.5 text-[var(--text-tertiary)]">·</span>
            <span className="text-pink-400 font-medium">{className}</span>
          </p>
        )}
        <p className="text-[var(--text-secondary)] text-sm">Start connecting with your classmates</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Button variant="primary" size="lg" onClick={onEnter} className="w-full">
          Enter class
        </Button>
      </motion.div>
    </GlassCard>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function OptionCard({
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
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full text-left px-4 py-4 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-3)] hover:border-[var(--border-accent)] transition-colors group"
    >
      <div className="flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-xl shrink-0 group-hover:border-[var(--pink)] transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-[0.9375rem] leading-tight">{title}</p>
          <p className="text-[0.8125rem] text-[var(--text-secondary)] mt-0.5">{description}</p>
        </div>
        <svg className="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.button>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-[0.8125rem] text-[var(--text-secondary)] hover:text-white/65 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 10.5L5.5 7 9 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label}
    </button>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#2a1520] border border-[#4a1a28] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm text-red-300"
    >
      {children}
    </motion.div>
  );
}
