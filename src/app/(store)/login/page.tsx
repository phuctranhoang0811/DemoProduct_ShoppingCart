'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginWithEmail = useCommerceStore((state) => state.loginWithEmail);
  const loginAsDemo = useCommerceStore((state) => state.loginAsDemo);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email.');
      return;
    }

    const success = loginWithEmail(email);
    if (success) {
      toast.success('Signed in successfully.');
      router.push('/account');
    } else {
      toast.error('Email not found. Try the demo account or register.');
    }
  };

  const handleQuickDemoLogin = () => {
    loginAsDemo();
    toast.success('Signed in as demo customer: Elena Rostova');
    router.push('/account');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
          Sign In
        </h1>
        <p className="text-xs text-[#777777]">
          Access your personal wardrobe curation and order history.
        </p>
      </div>

      {/* Quick Demo Credentials Box */}
      <div className="bg-[#F5F4F0] p-4 border border-[#E5E5E5] mb-8 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#111111] uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#477A5A]" /> Demo Credentials
          </span>
          <span className="text-[10px] bg-[#E5E5E5] px-2 py-0.5 rounded text-[#555]">Pre-filled</span>
        </div>
        <p className="text-[11px] text-[#666666] leading-relaxed">
          Email: <code className="font-mono text-[#111111]">customer@example.com</code><br />
          Password: <code className="font-mono text-[#111111]">customer123</code>
        </p>
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          className="w-full bg-[#111111] text-white py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#333333] transition-colors"
        >
          Instant One-Click Demo Sign In
        </button>
      </div>

      {/* Standard Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. customer@example.com"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
          />
        </div>

        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#111111] text-white py-3.5 text-xs uppercase tracking-[0.15em] font-semibold hover:bg-[#333333] transition-colors"
        >
          Sign In
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#E5E5E5] text-center space-y-4">
        <p className="text-xs text-[#777777]">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="text-[#111111] underline font-medium">
            Create account
          </Link>
        </p>
        <p className="text-[11px] text-[#999999]">
          Frontend demo simulation: Authentication is browser-local only.
        </p>
      </div>
    </div>
  );
}
