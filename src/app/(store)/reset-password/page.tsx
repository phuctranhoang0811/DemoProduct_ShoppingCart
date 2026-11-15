'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmation) {
      toast.error('The two passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email, password, password_confirmation: confirmation }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setIsSubmitting(false);

    if (!res?.ok) {
      toast.error(data?.message || 'This reset link is invalid or has expired.');
      return;
    }

    setIsDone(true);
    toast.success('Password updated. You can sign in now.');
  };

  const inputClass =
    'w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs bg-[#FAFAFA]';
  const labelClass = 'text-[11px] text-[#555555] uppercase tracking-wider font-semibold block mb-1.5';

  if (!token || !email) {
    return (
      <p className="text-xs text-[#666666] text-center">
        This reset link is incomplete.{' '}
        <Link href="/forgot-password" className="text-[#111111] underline font-semibold">
          Request a new one
        </Link>
        .
      </p>
    );
  }

  if (isDone) {
    return (
      <div className="text-center space-y-4">
        <p className="text-xs text-[#666666]">Your password has been updated.</p>
        <Link
          href="/login"
          className="inline-block bg-[#111111] hover:bg-[#262626] text-white px-8 py-3 text-xs uppercase tracking-[0.12em] font-semibold rounded-xs"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-[#666666]">
        Choose a new password for <strong className="text-[#111111]">{email}</strong>.
      </p>
      <div>
        <label htmlFor="new-password" className={labelClass}>
          New password
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <p className="text-[11px] text-[#888888] mt-1">At least 8 characters, with letters and numbers.</p>
      </div>
      <div>
        <label htmlFor="confirm-password" className={labelClass}>
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#111111] hover:bg-[#262626] disabled:opacity-60 text-white py-3 text-xs uppercase tracking-[0.12em] font-semibold transition-all rounded-xs"
      >
        {isSubmitting ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 animate-fade-up">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">Set a New Password</h1>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E5E5] shadow-xs">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
