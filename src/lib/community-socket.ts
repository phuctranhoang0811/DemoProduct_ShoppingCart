'use client';

import { io, type Socket } from 'socket.io-client';
import {
  useCommunityStore,
  type Meeting,
  type MembershipCode,
  type Person,
  type PostCategory,
} from '@/stores/useCommunityStore';

let socket: Socket | null = null;

export function resolveSocketUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (configured) return configured;
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname;
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return `http://${host}:4000`;
  }
  return null;
}

export function initCommunitySocket(): void {
  if (socket) return;
  const url = resolveSocketUrl();
  if (!url) return;

  socket = io(url, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
  });

  socket.on('connect', () => {
    useCommunityStore.getState().setSocketConnected(true);
  });

  socket.on('disconnect', () => {
    useCommunityStore.getState().setSocketConnected(false);
  });

  socket.on('connect_error', () => {
    useCommunityStore.getState().setSocketConnected(false);
  });

  socket.on('community:state', (snapshot) => {
    if (snapshot && typeof snapshot === 'object') {
      useCommunityStore.getState().applySnapshot(snapshot);
    }
  });
}

function emitAck<T>(event: string, payload: unknown, timeoutMs = 3000): Promise<T | null> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve(null);
      return;
    }
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, timeoutMs);

    socket.emit(event, payload, (res: T) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(res);
      }
    });
  });
}

export async function emitCreateCode(adminName: string): Promise<MembershipCode> {
  const res = await emitAck<{ ok: boolean; entry?: MembershipCode }>('code:create', { adminName });
  if (res?.ok && res.entry) return res.entry;
  return useCommunityStore.getState().createCode(adminName);
}

export async function emitRedeemCode(person: Person, code: string): Promise<{ ok: boolean; message: string }> {
  const res = await emitAck<{ ok: boolean; message: string }>('code:redeem', { person, code });
  if (res) return res;
  return useCommunityStore.getState().redeemCode(person, code);
}

export function emitEnsureMember(person: Person): void {
  if (socket?.connected) {
    socket.emit('member:ensure', { person });
  }
  useCommunityStore.getState().ensureMember(person);
}

export async function emitAddMeeting(m: Omit<Meeting, 'id' | 'attendees'>): Promise<void> {
  const res = await emitAck<{ ok: boolean }>('meeting:create', m);
  if (!res?.ok) {
    useCommunityStore.getState().addMeeting(m);
  }
}

export function emitToggleRsvp(meetingId: string, email: string): void {
  if (socket?.connected) {
    socket.emit('meeting:rsvp', { meetingId, email });
    return;
  }
  useCommunityStore.getState().toggleRsvp(meetingId, email);
}

export async function emitAddPost(
  person: Person,
  body: string,
  meta?: { category?: PostCategory; location?: string; imageUrl?: string },
): Promise<void> {
  const res = await emitAck<{ ok: boolean }>('post:create', { person, body, meta });
  if (!res?.ok) {
    useCommunityStore.getState().addPost(person, body, meta);
  }
}

export async function emitCreateGroup(name: string, creator: string, memberEmails: string[]): Promise<string> {
  const res = await emitAck<{ ok: boolean; id?: string }>('group:create', { name, creator, memberEmails });
  if (res?.ok && res.id) return res.id;
  return useCommunityStore.getState().createGroup(name, creator, memberEmails);
}

export async function emitAddToGroup(groupId: string, actorEmail: string, emails: string[], actorName?: string, names?: string[]): Promise<number> {
  const res = await emitAck<{ ok: boolean; added?: number }>('group:add', { groupId, actorEmail, actorName, emails, names });
  if (res?.ok && typeof res.added === 'number') return res.added;
  return useCommunityStore.getState().addToGroup(groupId, actorEmail, emails, actorName, names);
}

export async function emitRenameGroup(groupId: string, actor: Person, name: string): Promise<boolean> {
  const res = await emitAck<{ ok: boolean }>('group:rename', { groupId, actorEmail: actor.email, actorName: actor.name, name });
  if (res) return res.ok;
  return useCommunityStore.getState().renameGroup(groupId, actor, name);
}

export async function emitRemoveFromGroup(groupId: string, actorEmail: string, email: string, targetName?: string): Promise<boolean> {
  const res = await emitAck<{ ok: boolean }>('group:remove', { groupId, actorEmail, email, targetName });
  if (res) return res.ok;
  return useCommunityStore.getState().removeFromGroup(groupId, actorEmail, email, targetName);
}

export function emitSendMessage(threadId: string, person: Person, body: string, imageUrl?: string): void {
  if (socket?.connected) {
    socket.emit('chat:message', { threadId, person, body, imageUrl });
    return;
  }
  useCommunityStore.getState().sendMessage(threadId, person, body, imageUrl);
}
