'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    }).catch(() => null);
    setIsSubmitting(false);

    // 501 = no backend configured: the demo build only simulates the email.
    if (!res || (!res.ok && res.status !== 501)) {
      const data = await res?.json().catch(() => null);
      toast.error(data?.message || 'Could not send the reset email. Please try again.');
      return;
    }

    setIsSubmitted(true);
    toast.success('Password reset instructions sent!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 animate-fade-up">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
          Reset Password
        </h1>
        <p className="text-xs text-[#777777] max-w-sm mx-auto">
          Enter your registered email address to receive password recovery instructions
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E5E5] shadow-xs space-y-5">
        {isSubmitted ? (
          <div className="text-center space-y-4 py-4 animate-scale-in">
            <div className="w-12 h-12 bg-[#EBF3EA] rounded-full flex items-center justify-center mx-auto text-[#2D5A27]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[#111111]">Check Your Email</h2>
              <p className="text-xs text-[#666666] leading-relaxed">
                If an account exists for <strong className="text-[#111111]">{email}</strong>, password
                reset instructions are on their way.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-[#777777] hover:text-[#111111] underline"
              >
                Did not receive the email? Try again
              </button>
              <Link
                href="/login"
                className="mt-2 w-full bg-[#111111] hover:bg-[#262626] text-white py-2.5 text-xs uppercase tracking-wider font-semibold rounded-xs btn-tactile inline-flex items-center justify-center gap-1.5"
              >
                <span>Back to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] text-[#555555] uppercase tracking-wider font-semibold block mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-[#E5E5E5] pl-3.5 pr-10 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs bg-[#FAFAF9] focus:bg-white"
                />
                <Mail className="w-4 h-4 text-[#888888] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F5] border border-[#EAEAEA] rounded-xs text-[11px] text-[#666666] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#477A5A] flex-shrink-0 mt-0.5" />
              <span>
                For your security, password recovery links expire 60 minutes after issuance.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#111111] hover:bg-[#262626] text-white py-3 text-xs uppercase tracking-[0.12em] font-semibold transition-all rounded-xs shadow-xs hover:shadow-md btn-tactile mt-2"
            >
              {isSubmitting ? 'Sending Instructions...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>

      {/* Back to Login Footer */}
      <div className="mt-6 text-center text-xs text-[#777777]">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[#111111] hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
