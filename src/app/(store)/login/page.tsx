'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  UserCheck,
  Briefcase,
  Building,
  KeyRound,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  User,
  Lock,
} from 'lucide-react';
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
      toast.error('Account not recognized. Please pick one of the demo role accounts below.');
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

  const autofill = (sampleEmail: string, samplePass: string) => {
    setEmail(sampleEmail);
    setPassword(samplePass);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] tracking-[0.25em] text-[#777777] font-semibold uppercase">
          Enagic® Kangen Water® &bull; Role-Based Access Control
        </span>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
          Sign In to Portal
        </h1>
        <p className="text-xs text-[#777777] max-w-md mx-auto">
          Sign in with your credentials to access your designated workspace according to your role
          permissions (Admin, Employee, or Customer).
        </p>
      </div>

      {/* 1-Click Role-Based Quick Sign In */}
      <div className="bg-[#FAF9F5] p-5 sm:p-6 rounded-xl border border-[#E5E5E5] mb-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#477A5A]" />
            <h2 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              1-Click Role Logins (Instant RBAC Demo)
            </h2>
          </div>
          <span className="text-[10px] font-semibold bg-[#EAE8E1] px-2 py-0.5 rounded text-[#555]">
            Instant Switch
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Role 1: Admin */}
          <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] flex flex-col justify-between hover:border-[#111111] transition-all group shadow-2xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#111111] text-white font-bold rounded-xs">
                  ADMIN
                </span>
                <span className="text-[10px] font-mono font-bold text-[#8C5E1E]">FULL ACCESS</span>
              </div>
              <p className="text-xs font-bold text-[#111111] pt-1">Johnathan Bee</p>
              <p className="text-[11px] text-[#777777] font-mono truncate">owner@hellobee.com</p>
              <p className="text-[10px] text-[#555555] pt-0.5 leading-relaxed">
                Full portal access: Catalog, inventory, all orders, customers & settings.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#F0F0F0] flex gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'Johnathan Bee (Administrator)')}
                className="flex-1 bg-[#111111] text-white py-1.5 rounded-xs text-[10px] uppercase tracking-wider font-semibold hover:bg-[#333333] transition-colors"
              >
                Log In &rarr;
              </button>
              <button
                type="button"
                onClick={() => autofill('owner@hellobee.com', 'admin123')}
                className="px-2 py-1.5 border border-[#DDDDDD] text-[10px] text-[#555555] hover:bg-[#F9F9F9] rounded-xs"
                title="Fill Form"
              >
                Fill
              </button>
            </div>
          </div>

          {/* Role 2: Employee */}
          <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] flex flex-col justify-between hover:border-[#2D5A27] transition-all group shadow-2xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#EBF3EA] text-[#2D5A27] font-bold rounded-xs">
                  EMPLOYEE
                </span>
                <span className="text-[10px] font-mono font-bold text-[#2D5A27]">HB-EMP-101</span>
              </div>
              <p className="text-xs font-bold text-[#111111] pt-1">David Nguyen</p>
              <p className="text-[11px] text-[#777777] font-mono truncate">employee@hellobee.com</p>
              <p className="text-[10px] text-[#2D5A27] pt-0.5 leading-relaxed font-medium">
                Staff workspace: Assigned orders, stock status, leads & 10% commission.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#F0F0F0] flex gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('employee', 'David Nguyen (Sales Consultant)')}
                className="flex-1 bg-[#2D5A27] text-white py-1.5 rounded-xs text-[10px] uppercase tracking-wider font-semibold hover:bg-[#23471f] transition-colors"
              >
                Log In &rarr;
              </button>
              <button
                type="button"
                onClick={() => autofill('employee@hellobee.com', 'emp123')}
                className="px-2 py-1.5 border border-[#DDDDDD] text-[10px] text-[#555555] hover:bg-[#F9F9F9] rounded-xs"
                title="Fill Form"
              >
                Fill
              </button>
            </div>
          </div>

          {/* Role 3: Customer */}
          <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] flex flex-col justify-between hover:border-[#111111] transition-all group shadow-2xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#F5F4F0] text-[#555] font-semibold rounded-xs">
                  CUSTOMER
                </span>
                <span className="text-[10px] font-bold text-[#888888]">BUYER</span>
              </div>
              <p className="text-xs font-bold text-[#111111] pt-1">Elena Rostova</p>
              <p className="text-[11px] text-[#777777] font-mono truncate">customer@example.com</p>
              <p className="text-[10px] text-[#555555] pt-0.5 leading-relaxed">
                Customer account: Order tracking, warranty, and delivery address management.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#F0F0F0] flex gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer', 'Elena Rostova (Customer)')}
                className="flex-1 bg-[#111111] text-white py-1.5 rounded-xs text-[10px] uppercase tracking-wider font-semibold hover:bg-[#333333] transition-colors"
              >
                Log In &rarr;
              </button>
              <button
                type="button"
                onClick={() => autofill('customer@example.com', 'customer123')}
                className="px-2 py-1.5 border border-[#DDDDDD] text-[10px] text-[#555555] hover:bg-[#F9F9F9] rounded-xs"
                title="Fill Form"
              >
                Fill
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Email Login Form */}
      <form onSubmit={handleLogin} className="space-y-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-xs">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-[#111111] pb-2 border-b border-[#F0F0F0]">
          Sign In with Email Credentials
        </h2>

        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. employee@hellobee.com or owner@hellobee.com"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs"
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
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#111111] text-white py-3 text-xs uppercase tracking-[0.15em] font-semibold hover:bg-[#333333] transition-colors rounded-xs"
        >
          Sign In &bull; Redirect to Role Workspace
        </button>
      </form>

      {/* Navigation Footer */}
      <div className="mt-8 pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#777777] gap-3">
        <p>
          New to Enagic?{' '}
          <Link href="/register" className="text-[#111111] underline font-semibold">
            Create an account &rarr;
          </Link>
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/employee"
            className="inline-flex items-center gap-1 text-[#2D5A27] hover:underline font-semibold"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Employee Portal</span>
          </Link>
          <span className="text-[#CCCCCC]">&bull;</span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-[#555555] hover:text-[#111111] font-semibold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
