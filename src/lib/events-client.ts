'use client';

import type { MemberEvent } from '@/data/events';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useEventsStore } from '@/stores/useEventsStore';

const LOCAL_MODE = 501;

export async function syncEvents(): Promise<void> {
  try {
    const res = await fetch('/api/events', { cache: 'no-store' });
    if (res.status === LOCAL_MODE || !res.ok) return;

    const json = (await res.json().catch(() => ({}))) as { mode?: string; data?: MemberEvent[] };
    if (json.mode === 'local') return;
    if (Array.isArray(json.data)) {
      useEventsStore.setState({ events: json.data });
    }
  } catch {
    // Keep existing store state when offline.
  }
}

export async function createEvent(
  event: Omit<MemberEvent, 'id'>,
): Promise<{ ok: boolean; message?: string }> {
  if (useCommerceStore.getState().authMode !== 'backend') {
    useEventsStore.getState().addEvent(event);
    return { ok: true };
  }

  try {
    const res = await fetch('/api/backoffice/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    if (!res.ok) return { ok: false, message: data.message || 'Could not publish event.' };

    await syncEvents();
    return { ok: true };
  } catch {
    return { ok: false, message: 'Network error. Please try again.' };
  }
}

export async function removeEvent(id: string): Promise<{ ok: boolean; message?: string }> {
  if (useCommerceStore.getState().authMode !== 'backend') {
    useEventsStore.getState().deleteEvent(id);
    return { ok: true };
  }

  try {
    const res = await fetch(`/api/backoffice/events/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    if (!res.ok) return { ok: false, message: data.message || 'Could not delete event.' };

    await syncEvents();
    return { ok: true };
  } catch {
    return { ok: false, message: 'Network error. Please try again.' };
  }
}
