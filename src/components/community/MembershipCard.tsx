'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useIsMember } from './useIsMember';

export function MembershipCard() {
  const { user, isMember } = useIsMember();
  const redeem = useCommunityStore((s) => s.redeemCode);
  const hellobeeMembers = useCommerceStore((s) => s.hellobeeMembers);
  const registerHellobeeMember = useCommerceStore((s) => s.registerHellobeeMember);
  const [code, setCode] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !user) return null;

  if (isMember) {
    return (
      <section className="bg-white border border-[#E5E5E5] rounded-xl p-6 flex items-center gap-4">
        <BadgeCheck className="w-8 h-8 text-emerald-600 shrink-0" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider">Membership active</h2>
          <p className="text-xs text-[#666666] mt-1">Hellobee Network, meetings, posts and chat are unlocked.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/hellobee" className="text-xs font-semibold underline">
            Hellobee Network
          </Link>
          <Link href="/events#community" className="text-xs font-semibold underline">
            Open community
          </Link>
        </div>
      </section>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = redeem({ email: user.email, name: user.name }, code);
    if (result.ok) {
      const existsInNetwork = hellobeeMembers.some(
        (m) => m.email && m.email.toLowerCase() === user.email.toLowerCase()
      );
      if (!existsInNetwork) {
        registerHellobeeMember({
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: 'EMPLOYEE',
          sponsorCode: user.referralCode || undefined,
        });
      }
      toast.success(result.message);
      setCode('');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <section className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound className="w-4 h-4" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">Membership</h2>
      </div>
      <p className="text-xs text-[#666666] leading-relaxed">
        Customers can shop right away. To join the membership, buy a Hellobee system, or enter a one-time code from an
        admin. A code is valid for 10 minutes.
      </p>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter membership code"
          maxLength={8}
          className="flex-1 border border-[#E5E5E5] rounded-xs px-3 py-2 text-sm font-mono tracking-widest uppercase"
        />
        <button
          type="submit"
          disabled={code.length < 8}
          className="bg-[#111111] text-white px-5 text-xs uppercase font-semibold tracking-wider rounded-xs disabled:opacity-40 btn-tactile"
        >
          Join
        </button>
      </form>
    </section>
  );
}
