'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { LADDER_NAMES, RankLevel } from '@/types/hellobee';

const COLORS = ['#F6C94C', '#E0A82E', '#FFFFFF', '#FF8A3D', '#5A2E0E', '#FBE9A6'];

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  drift: number;
  rotate: number;
  round: boolean;
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 0.9,
    duration: 2.6 + Math.random() * 2,
    size: 7 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    drift: (Math.random() - 0.5) * 240,
    rotate: 360 + Math.random() * 720,
    round: Math.random() > 0.6,
  }));
}

function ConfettiBurst({ message, onDone }: { message: string; onDone: () => void }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    setPieces(makePieces(140));
    const timer = setTimeout(onDone, 5500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden" role="status" aria-live="polite">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 0.5,
              backgroundColor: p.color,
              borderRadius: p.round ? '50%' : 2,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--drift': `${p.drift}px`,
              '--rot': `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="levelup-banner flex items-center gap-4 rounded-2xl border-2 border-[#E0A82E] bg-[#3A1B0A]/95 px-6 py-4 shadow-2xl">
          <Image src="/images/logo.png" alt="" width={640} height={612} className="h-16 w-auto" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F6C94C]">Level Up!</p>
            <p className="text-lg font-extrabold text-white">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  memberId?: string;
  ladderLevel: number;
  rank: RankLevel;
}

// Celebrates when LV ladder level or 1A-5A rank rises above the last level this member was shown.
// The first view only records a baseline, so mock data never fires on load.
export function LevelUpCelebration({ memberId, ladderLevel, rank }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const rankNum = parseInt(rank, 10) || 1;
  const score = ladderLevel * 10 + rankNum;
  const dismiss = useCallback(() => setMessage(null), []);

  useEffect(() => {
    if (!memberId) return;
    const key = `hellobee_celebrated_${memberId}`;
    let prev: number | null = null;
    try {
      const raw = localStorage.getItem(key);
      prev = raw === null ? null : Number(raw);
    } catch {}

    if (prev !== null && score > prev) {
      const label =
        ladderLevel > Math.floor(prev / 10)
          ? `LV${ladderLevel} – ${LADDER_NAMES[ladderLevel - 1]}`
          : `Rank ${rank}`;
      setMessage(label);
      toast.success(`Congratulations! You reached ${label}.`);
    }

    try {
      localStorage.setItem(key, String(score));
    } catch {}
  }, [memberId, score, ladderLevel, rank]);

  return message ? <ConfettiBurst message={message} onDone={dismiss} /> : null;
}
