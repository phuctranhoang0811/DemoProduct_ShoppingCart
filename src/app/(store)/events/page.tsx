'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, MapPin, Flame } from 'lucide-react';
import { MemberEvent } from '@/data/events';
import { useEventsStore } from '@/stores/useEventsStore';

const CATEGORIES = ['All', 'Community', 'Training', 'Wellness', 'Leadership'] as const;

function formatEventDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function EventCard({ event }: { event: MemberEvent }) {
  return (
    <article className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden flex flex-col card-interactive">
      <div className="relative h-48 bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-bold bg-white text-[#111111] px-2.5 py-1 rounded-full">
          {event.category}
        </span>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-lg font-semibold text-[#111111]">{event.title}</h3>
        <p className="text-sm text-[#666666] leading-relaxed">{event.description}</p>
        <ul className="text-xs text-[#555555] space-y-1.5">
          <li className="flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" />{formatEventDate(event.date)}</li>
          <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />{event.time}</li>
          <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{event.location}</li>
        </ul>
        <p className="text-xs italic text-[#777777] border-l-2 border-[#E0A82E] pl-3 leading-relaxed">{event.meaning}</p>
        <Link
          href="/hellobee"
          className="mt-auto bg-[#111111] text-white text-center text-xs uppercase tracking-wider font-semibold py-2.5 rounded-xs hover:bg-[#333333] transition-colors btn-tactile"
        >
          Member Sign-Up
        </Link>
      </div>
    </article>
  );
}

export default function EventsPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const allEvents = useEventsStore((s) => s.events);
  const events = [...allEvents].sort((a, b) => a.date.localeCompare(b.date)).filter((e) => category === 'All' || e.category === category);

  return (
    <div className="bg-[#FDFCFB] text-[#111111]">
      <section className="relative h-[60svh] min-h-[420px] overflow-hidden bg-black flex items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/events/campfire.webp" alt="Members dancing in a circle around a bonfire" className="absolute inset-0 w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative max-w-[1440px] mx-auto w-full px-6 sm:px-12 lg:px-20 pb-12 text-white">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-amber-300 mb-3">
            <Flame className="w-3.5 h-3.5" /> Hellobee Member Events
          </span>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight">Gather. Connect. Grow Together.</h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-14 text-center space-y-4">
        <h2 className="text-xs uppercase tracking-wider font-bold">The Meaning Behind the Circle</h2>
        <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
          A ring of hands around a single fire is the heart of every Hellobee gathering. The fire is our shared purpose,
          healthy living for everyone. The circle has no front and no back, so every member, from rank 1A to 5A, stands
          equal and connected. Each person who steps in makes the circle wider and the light brighter.
        </p>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 pb-20">
        <div className="flex gap-2 overflow-x-auto pb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`shrink-0 px-4 py-2 rounded-full border text-xs font-semibold transition-colors ${
                category === c
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-[#111111]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </div>
  );
}
