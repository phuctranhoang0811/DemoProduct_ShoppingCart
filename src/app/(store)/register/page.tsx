'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Tag, Sparkles, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { toast } from 'sonner';

function formatUSPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  const clean = digits.startsWith('1') && digits.length > 10 ? digits.slice(1) : digits;
  const limited = clean.slice(0, 10);
  
  if (limited.length <= 3) {
    return limited ? `(${limited}` : '';
  }
  if (limited.length <= 6) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  }
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6, 10)}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const register = useCommerceStore((state) => state.register);
  const hellobeeMembers = useCommerceStore((state) => state.hellobeeMembers);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const recognizedSponsor = useMemo(() => {
    if (!referralCode.trim()) return null;
    const clean = referralCode.trim().toUpperCase();
    return hellobeeMembers.find((m) => m.referralCode.toUpperCase() === clean);
  }, [referralCode, hellobeeMembers]);

  const handleQuickFill = (code = 'HB-EMP-101') => {
    setName('Alexander Wright');
    setEmail(`alex.wright.${Math.floor(Math.random() * 900 + 100)}@example.com`);
    setPhone('(555) 349-8201');
    setPassword('Password123');
    setReferralCode(code);
    toast.success('Sample customer credentials filled!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast.error('Please fill in all required fields (*).');
      return;
    }

    const digits = phone.replace(/\D/g, '');
    const cleanDigits = digits.startsWith('1') && digits.length === 11 ? digits.slice(1) : digits;
    if (cleanDigits.length !== 10) {
      toast.error('Please enter a valid 10-digit US phone number, e.g. (555) 349-8201.');
      return;
    }

    const fullUSPhone = `+1 ${phone}`;
    register(name.trim(), email.trim(), fullUSPhone);
    if (recognizedSponsor) {
      toast.success(
        `Welcome ${name}! Linked with specialist ${recognizedSponsor.name} (${recognizedSponsor.referralCode}).`
      );
    } else {
      toast.success(`Account created successfully for ${name}!`);
    }
    router.push('/account');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 animate-fade-up">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] tracking-[0.25em] text-[#777777] font-semibold uppercase">
          Enagic® Kangen Water® & Hellobee Network
        </span>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
          Create Customer Account
        </h1>
        <p className="text-xs text-[#777777] max-w-md mx-auto">
          Create an account to track Enagic medical device installations, scheduled filter maintenance, and official warranty records.
        </p>
      </div>

      {/* Quick Fill Demo Box */}
      <div className="bg-[#FAF9F5] p-4 rounded-lg border border-[#E5E5E5] mb-6 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#477A5A]" />
            <span>Quick Fill Sample Data</span>
          </p>
          <p className="text-[11px] text-[#777777]">
            Autofills mock customer details with referral specialist <code>HB-EMP-101</code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleQuickFill('HB-EMP-101')}
          className="bg-[#111111] text-white px-3.5 py-1.5 rounded-xs text-[11px] font-semibold hover:bg-[#333333] transition-colors flex-shrink-0 btn-tactile"
        >
          Quick Fill
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-[#E5E5E5]">
        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alexander Wright"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs"
          />
        </div>

        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. alex.wright@example.com"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-[#777777] uppercase tracking-wider block">
              US Phone Number *
            </label>
            <span className="text-[10px] text-[#888888]">10 digits • US format</span>
          </div>
          <div className="relative flex rounded-xs border border-[#E5E5E5] focus-within:border-[#111111] transition-colors overflow-hidden">
            <div className="bg-[#FAF9F5] border-r border-[#E5E5E5] px-3 flex items-center gap-1.5 text-xs font-semibold text-[#111111] select-none shrink-0">
              <span className="text-xs">🇺🇸</span>
              <span>+1</span>
            </div>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(formatUSPhoneNumber(e.target.value))}
              placeholder="(555) 349-8201"
              maxLength={14}
              className="w-full px-3.5 py-2.5 text-xs outline-none bg-white font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Password *
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs"
          />
        </div>

        {/* Referral Code Field */}
        <div className="pt-2 border-t border-[#F0F0F0]">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-[#777777] uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#B9A58B]" />
              <span>Sponsor / Specialist Code (Optional)</span>
            </label>
            <span className="text-[10px] text-[#888888]">e.g. HB-EMP-101</span>
          </div>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="HB-EMP-101 or HB-EMP-102"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs font-mono font-semibold uppercase outline-none focus:border-[#111111] transition-colors rounded-xs"
          />

          {recognizedSponsor ? (
            <div className="mt-2 p-2.5 bg-[#EBF3EA] rounded-xs border border-[#2D5A27]/20 flex items-center gap-2 text-xs text-[#2D5A27]">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Assigned Specialist: <strong>{recognizedSponsor.name}</strong> ({recognizedSponsor.referralCode} - {recognizedSponsor.role})
              </span>
            </div>
          ) : referralCode.trim() ? (
            <p className="mt-1.5 text-[11px] text-[#888888]">
              ℹ No specialist matched this code yet. You can still register normally.
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          className="w-full bg-[#111111] text-white py-3.5 text-xs uppercase tracking-[0.15em] font-semibold hover:bg-[#333333] transition-colors rounded-xs flex items-center justify-center gap-2 mt-4 btn-tactile"
        >
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#E5E5E5] text-center space-y-2 text-xs text-[#777777]">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="text-[#111111] underline font-semibold">
            Sign In Now
          </Link>
        </p>
      </div>
    </div>
  );
}
