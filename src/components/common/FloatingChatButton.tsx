'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export function FloatingChatButton() {
  const pathname = usePathname();
  if (pathname === '/meetings') return null;

  return (
    <Link
      href="/meetings#chat"
      onClick={() => window.dispatchEvent(new CustomEvent('hellobee:community-tab', { detail: 'chat' }))}
      aria-label="Open Hello Bee member chat"
      className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#111111] text-white border border-white/20 shadow-lg hover:bg-[#262626] transition-all btn-tactile"
    >
      <MessageCircle className="w-4 h-4 text-[var(--honey)]" />
      <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">Chat</span>
    </Link>
  );
}
