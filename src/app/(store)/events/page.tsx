import { EventsClient } from '@/components/events/EventsClient';
import { EVENTS_REVALIDATE_SECONDS, getEvents } from '@/lib/events';

export const revalidate = EVENTS_REVALIDATE_SECONDS;

export default async function EventsPage() {
  const events = await getEvents();

  return <EventsClient initialEvents={events} />;
}
