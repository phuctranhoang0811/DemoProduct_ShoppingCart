'use client';

import { useEffect, useState } from 'react';
import { Copy, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useCommunityStore, type MembershipCode } from '@/stores/useCommunityStore';

function remaining(code: MembershipCode, now: number): string {
  const ms = code.expiresAt - now;
  if (code.usedBy) return `Used by ${code.usedBy}`;
  if (ms <= 0) return 'Expired';
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} left`;
}

export default function AdminMembershipPage() {
  const admin = useCommerceStore((s) => s.currentUser);
  const codes = useCommunityStore((s) => s.codes);
  const members = useCommunityStore((s) => s.members);
  const createCode = useCommunityStore((s) => s.createCode);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (now === null) return null;

  const copy = (code: string) => {
    void navigator.clipboard.writeText(code);
    toast.success('Code copied.');
  };

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#E5E5E5]">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">Membership Codes</h1>
        <p className="text-sm text-[#666666] mt-1">
          A customer who has not bought a system can join the membership with a one-time code. Each code works for 10
          minutes. Codes are stored in this browser for now.
        </p>
      </div>

      <button
        type="button"
        onClick={() => createCode(admin?.name ?? 'Admin')}
        className="inline-flex items-center gap-2 bg-[#111111] text-white px-5 py-2.5 text-xs uppercase font-semibold tracking-wider rounded-xs btn-tactile"
      >
        <KeyRound className="w-4 h-4" /> Generate code
      </button>

      <div className="bg-white border border-[#E5E5E5] rounded-lg divide-y divide-[#F0F0F0]">
        {codes.length === 0 && <p className="p-5 text-sm text-[#777777]">No codes yet.</p>}
        {codes.map((c) => {
          const live = !c.usedBy && c.expiresAt > now;
          return (
            <div key={c.code} className="flex items-center gap-4 p-4">
              <span className={`font-mono text-lg tracking-widest ${live ? 'text-[#111111]' : 'text-[#AAAAAA] line-through'}`}>
                {c.code}
              </span>
              <span className="text-xs text-[#666666] flex-1">{remaining(c, now)}</span>
              {live && (
                <button type="button" onClick={() => copy(c.code)} className="p-2 hover:bg-[#F5F5F5] rounded" aria-label="Copy code">
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <section>
        <h2 className="text-xs uppercase tracking-wider font-bold mb-3">Joined with a code ({Object.keys(members).length})</h2>
        <ul className="text-sm text-[#444444] space-y-1">
          {Object.entries(members).map(([email, m]) => (
            <li key={email}>
              {m.name} <span className="text-[#888888]">({email})</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
