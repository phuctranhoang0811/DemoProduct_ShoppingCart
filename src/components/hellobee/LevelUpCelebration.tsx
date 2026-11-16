'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { LADDER_NAMES, RankLevel } from '@/types/hellobee';

const COLORS = ['#F6C94C', '#FFD966', '#E0A82E', '#FFFFFF', '#FF8A3D', '#FFB703'];
const DURATION_MS = 5200;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
  kind: 'spark' | 'confetti';
  rot: number;
  vr: number;
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
}

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

// Canvas fireworks: rockets rise, burst into sparks, then gold confetti rains. Driven by
// requestAnimationFrame so it plays even when CSS animations are disabled by the OS.
function useFireworks(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const particles: Particle[] = [];
    const rockets: Rocket[] = [];
    const start = performance.now();
    let nextLaunch = 0;
    let raf = 0;

    const burst = (x: number, y: number, color: string) => {
      const count = 70;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = 2.5 + Math.random() * 4.5;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.012 + Math.random() * 0.012,
          size: 2 + Math.random() * 2,
          color: Math.random() > 0.3 ? color : pick(COLORS),
          kind: 'spark', rot: 0, vr: 0,
        });
      }
    };

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * W(),
        y: -20 - Math.random() * H() * 0.6,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1.5 + Math.random() * 2.5,
        life: 1,
        decay: 0.003,
        size: 6 + Math.random() * 6,
        color: pick(COLORS),
        kind: 'confetti',
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
      });
    }

    const frame = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, W(), H());

      if (elapsed < DURATION_MS - 1800 && now >= nextLaunch) {
        rockets.push({
          x: W() * (0.15 + Math.random() * 0.7),
          y: H(),
          vy: -(9 + Math.random() * 4),
          targetY: H() * (0.15 + Math.random() * 0.3),
          color: pick(COLORS),
        });
        nextLaunch = now + 280 + Math.random() * 320;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY || r.vy > -2) {
          burst(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.kind === 'spark') {
          p.vx *= 0.97;
          p.vy = p.vy * 0.97 + 0.06;
        } else {
          p.vx += Math.sin(now / 300 + i) * 0.02;
          p.rot += p.vr;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0 || p.y > H() + 30) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.fillStyle = p.color;
        if (p.kind === 'spark') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;

      if (elapsed < DURATION_MS || particles.length) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}

export function ConfettiBurst({ message, onDone }: { message: string; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useFireworks(canvasRef);

  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS + 600);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden" role="status" aria-live="polite">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
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
