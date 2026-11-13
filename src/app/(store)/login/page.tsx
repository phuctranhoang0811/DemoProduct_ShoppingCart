'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, UserCheck, Shield } from 'lucide-react';
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
    if (!email.trim()) {
      toast.error('Please enter an email address.');
      return;
    }

    const clean = email.trim().toLowerCase();
    const success = loginWithEmail(clean);

    if (success) {
      toast.success('Signed in successfully!');
      if (clean.includes('admin') || clean.includes('owner')) {
        router.push('/admin');
      } else if (clean.includes('employee') || clean.includes('staff')) {
        router.push('/employee');
      } else {
        router.push('/account');
      }
    } else {
      toast.error('Account not recognized. Please pick one of the demo role accounts.');
    }
  };

  const handleQuickLogin = (role: 'customer' | 'employee' | 'admin', name: string) => {
    loginAsDemo(role);
    toast.success(`Signed in as: ${name}`);
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'employee') {
      router.push('/employee');
    } else {
      router.push('/account');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 animate-fade-up">
      {/* Clean Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
          Sign In
        </h1>
        <p className="text-xs text-[#777777]">
          Sign in to access your Enagic® Kangen Water® account
        </p>
      </div>

      {/* Main Login Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E5E5] shadow-xs space-y-5">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] text-[#555555] uppercase tracking-wider font-semibold block mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs bg-[#FAFAF9] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#555555] uppercase tracking-wider font-semibold block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs bg-[#FAFAF9] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#111111] hover:bg-[#262626] text-white py-3 text-xs uppercase tracking-[0.12em] font-semibold transition-all rounded-xs shadow-xs hover:shadow-md btn-tactile mt-2"
          >
            Sign In
          </button>
        </form>

        {/* Quick Demo Logins - Minimalist 3-Pill Grid */}
        <div className="pt-5 border-t border-[#F0F0F0]">
          <p className="text-[10px] uppercase tracking-wider text-[#888888] font-semibold text-center mb-3">
            Quick Demo Access
          </p>
          <div className="grid grid-cols-3 gap-2">
            {/* Admin */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'Admin')}
              className="p-2.5 rounded-lg border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#F9F9F8] transition-all text-center btn-tactile group"
              title="owner@hellobee.com"
            >
              <span className="block text-[9px] uppercase font-bold tracking-wider text-white bg-[#111111] px-1.5 py-0.5 rounded-xs w-max mx-auto mb-1">
                Admin
              </span>
              <span className="block text-xs font-semibold text-[#111111] truncate">Johnathan</span>
            </button>

            {/* Staff */}
            <button
              type="button"
              onClick={() => handleQuickLogin('employee', 'Staff')}
              className="p-2.5 rounded-lg border border-[#E5E5E5] hover:border-[#2D5A27] hover:bg-[#F5F9F4] transition-all text-center btn-tactile group"
              title="employee@hellobee.com"
            >
              <span className="block text-[9px] uppercase font-bold tracking-wider text-[#2D5A27] bg-[#EBF3EA] px-1.5 py-0.5 rounded-xs w-max mx-auto mb-1">
                Staff
              </span>
              <span className="block text-xs font-semibold text-[#111111] truncate">David</span>
            </button>

            {/* Customer */}
            <button
              type="button"
              onClick={() => handleQuickLogin('customer', 'Customer')}
              className="p-2.5 rounded-lg border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#F9F9F8] transition-all text-center btn-tactile group"
              title="customer@example.com"
            >
              <span className="block text-[9px] uppercase font-bold tracking-wider text-[#555555] bg-[#F5F4F0] px-1.5 py-0.5 rounded-xs w-max mx-auto mb-1">
                User
              </span>
              <span className="block text-xs font-semibold text-[#111111] truncate">Elena</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-6 text-center text-xs text-[#777777]">
        <p>
          New to Enagic?{' '}
          <Link href="/register" className="text-[#111111] underline font-semibold hover:text-black">
            Create an account &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
