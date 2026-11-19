import 'server-only';

import { MEMBER_EVENTS, type MemberEvent } from '@/data/events';

const API_URL: string | undefined = undefined;

export const EVENTS_TAG = 'events';
export const EVENTS_REVALIDATE_SECONDS = 3600;

export async function getEvents(): Promise<MemberEvent[]> {
  if (!API_URL) return MEMBER_EVENTS;

  const res = await fetch(`${API_URL}/api/v1/events`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: EVENTS_REVALIDATE_SECONDS, tags: [EVENTS_TAG] },
  });

  if (!res.ok) throw new Error(`Events API responded ${res.status}`);

  const json = (await res.json()) as { data?: MemberEvent[] };
  return json.data ?? [];
}
