import Link from 'next/link';
import { Users } from 'lucide-react';
import { CommunityHub } from '@/components/community/CommunityHub';

export default function MeetingsPage() {
  return (
    <div className="bg-[#FDFCFB] text-[#111111]">
      <section className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 pt-16 pb-10 space-y-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-[#B8860B]">
          <Users className="w-3.5 h-3.5" /> Hellobee Members
        </span>
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight">Meetings</h1>
        <p className="text-sm sm:text-base text-[#555555] max-w-2xl leading-relaxed">
          Member-organized meetings, dinners and gatherings. Official company events live on the{' '}
          <Link href="/events" className="underline font-semibold">
            Events
          </Link>{' '}
          page.
        </p>
      </section>

      <CommunityHub />
    </div>
  );
}
