import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MEMBER_EVENTS, MemberEvent } from '@/data/events';

interface EventsState {
  events: MemberEvent[];
  addEvent: (event: Omit<MemberEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set) => ({
      events: MEMBER_EVENTS,
      addEvent: (event) =>
        set((s) => ({ events: [{ ...event, id: `evt-${Date.now()}` }, ...s.events] })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: 'hellobee_events_v2' }
  )
);
