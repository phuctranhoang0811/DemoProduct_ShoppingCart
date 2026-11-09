'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const register = useCommerceStore((state) => state.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    register(name.trim(), email.trim(), phone.trim());
    toast.success(`Account created for ${name}! Welcome to COS.`);
    router.push('/account');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
          Create Account
        </h1>
        <p className="text-xs text-[#777777]">
          Join COS to manage your wardrobe, track orders and enjoy simplified checkouts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Elena Rostova"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
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
            placeholder="e.g. elena@example.com"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
          />
        </div>

        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+84 901 234 567"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
          />
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
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#111111] text-white py-3.5 text-xs uppercase tracking-[0.15em] font-semibold hover:bg-[#333333] transition-colors"
        >
          Register Account
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#E5E5E5] text-center">
        <p className="text-xs text-[#777777]">
          Already registered?{' '}
          <Link href="/login" className="text-[#111111] underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
