import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Kept in the browser only (localStorage) until the community feature gets a backend.
export const CODE_TTL_MS = 10 * 60 * 1000;
export const SUPPORT_EMAIL = 'support@hellobee.com';
export const LIVE_THREAD = 'live';
const STORAGE_KEY = 'hellobee_community_v1';

export type MeetingKind = 'Meeting' | 'Dining' | 'Gathering';

export interface MembershipCode {
  code: string;
  createdAt: number;
  expiresAt: number;
  createdBy: string;
  usedBy?: string;
}

export interface Meeting {
  id: string;
  title: string;
  kind: MeetingKind;
  date: string;
  time: string;
  location: string;
  description: string;
  hostName: string;
  attendees: string[];
}

export interface Post {
  id: string;
  authorEmail: string;
  authorName: string;
  body: string;
  createdAt: number;
}

export interface ChatGroup {
  id: string;
  name: string;
  memberEmails: string[];
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  fromEmail: string;
  fromName: string;
  body: string;
  at: number;
}

export interface Person {
  email: string;
  name: string;
}

interface CommunityState {
  codes: MembershipCode[];
  members: Record<string, { name: string; joinedAt: number; code: string }>;
  meetings: Meeting[];
  posts: Post[];
  groups: ChatGroup[];
  messages: ChatMessage[];
  createCode: (adminName: string) => MembershipCode;
  redeemCode: (person: Person, code: string) => { ok: boolean; message: string };
  ensureMember: (person: Person) => void;
  addMeeting: (m: Omit<Meeting, 'id' | 'attendees'>) => void;
  toggleRsvp: (meetingId: string, email: string) => void;
  addPost: (person: Person, body: string) => void;
  createGroup: (name: string, creator: string, memberEmails: string[]) => string;
  sendMessage: (threadId: string, person: Person, body: string) => void;
}

// Slows down guessing in this browser. Real enforcement has to live on a server later.
const MAX_MISSES = 5;
const LOCK_MS = 30_000;
let misses = 0;
let lockedUntil = 0;

function lockedForMs(): number {
  return Math.max(0, lockedUntil - Date.now());
}

function recordMiss(): void {
  misses += 1;
  if (misses >= MAX_MISSES) {
    misses = 0;
    lockedUntil = Date.now() + LOCK_MS;
  }
}

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const norm = (email: string) => email.trim().toLowerCase();

export const dmThreadId = (a: string, b: string) => `dm:${[norm(a), norm(b)].sort().join('|')}`;

// No look-alike characters (0/O, 1/I) so a code read aloud or from a chat is typed correctly.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');
}

const SEED_MEETINGS: Meeting[] = [
  {
    id: 'meet-seed-1',
    title: 'Monthly Members Meeting',
    kind: 'Meeting',
    date: '2026-12-05',
    time: '7:00 PM',
    location: 'Hellobee Studio, Ho Chi Minh City',
    description: 'Product updates, rank progress and open questions for every member.',
    hostName: 'Hellobee Team',
    attendees: [],
  },
  {
    id: 'meet-seed-2',
    title: 'Members Dinner',
    kind: 'Dining',
    date: '2026-12-12',
    time: '6:30 PM',
    location: 'Riverside Garden Restaurant',
    description: 'Eat together and meet your upline and downline in person.',
    hostName: 'Hellobee Team',
    attendees: [],
  },
];

export function mergeStored(persisted: unknown, current: CommunityState): CommunityState {
  const p = (persisted ?? {}) as Partial<CommunityState>;
  return {
    ...current,
    codes: Array.isArray(p.codes) ? p.codes : current.codes,
    members: p.members && typeof p.members === 'object' && !Array.isArray(p.members) ? p.members : current.members,
    meetings: Array.isArray(p.meetings) ? p.meetings : current.meetings,
    posts: Array.isArray(p.posts) ? p.posts : current.posts,
    groups: Array.isArray(p.groups) ? p.groups : current.groups,
    messages: Array.isArray(p.messages) ? p.messages : current.messages,
  };
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      codes: [],
      members: {},
      meetings: SEED_MEETINGS,
      posts: [],
      groups: [],
      messages: [],

      createCode: (adminName) => {
        const now = Date.now();
        const entry: MembershipCode = { code: randomCode(), createdAt: now, expiresAt: now + CODE_TTL_MS, createdBy: adminName };
        set((s) => ({ codes: [entry, ...s.codes].slice(0, 50) }));
        return entry;
      },

      redeemCode: (person, code) => {
        const email = norm(person.email);
        if (get().members[email]) return { ok: false, message: 'You are already a member.' };

        const wait = lockedForMs();
        if (wait > 0) return { ok: false, message: `Too many wrong codes. Try again in ${Math.ceil(wait / 1000)} seconds.` };

        const entry = get().codes.find((c) => c.code === code.trim().toUpperCase());
        if (!entry) {
          recordMiss();
          return { ok: false, message: 'Code not found.' };
        }
        if (entry.usedBy) return { ok: false, message: 'This code has already been used.' };
        if (entry.expiresAt <= Date.now()) return { ok: false, message: 'This code has expired. Ask an admin for a new one.' };

        set((s) => ({
          codes: s.codes.map((c) => (c.code === entry.code ? { ...c, usedBy: email } : c)),
          members: { ...s.members, [email]: { name: person.name, joinedAt: Date.now(), code: entry.code } },
        }));
        misses = 0;
        return { ok: true, message: 'Welcome! Your membership is active.' };
      },

      // Eligible people (system buyers, staff) become reachable in chat once they open it.
      ensureMember: (person) => {
        const email = norm(person.email);
        if (get().members[email]) return;
        set((s) => ({ members: { ...s.members, [email]: { name: person.name, joinedAt: Date.now(), code: '' } } }));
      },

      addMeeting: (m) => set((s) => ({ meetings: [{ ...m, id: uid('meet'), attendees: [] }, ...s.meetings] })),

      toggleRsvp: (meetingId, email) =>
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id !== meetingId
              ? m
              : { ...m, attendees: m.attendees.includes(email) ? m.attendees.filter((e) => e !== email) : [...m.attendees, email] },
          ),
        })),

      addPost: (person, body) =>
        set((s) => ({
          posts: [{ id: uid('post'), authorEmail: person.email, authorName: person.name, body, createdAt: Date.now() }, ...s.posts].slice(0, 200),
        })),

      createGroup: (name, creator, memberEmails) => {
        const id = uid('grp');
        set((s) => ({ groups: [...s.groups, { id, name, createdBy: creator, memberEmails: Array.from(new Set([creator, ...memberEmails])) }] }));
        return id;
      },

      sendMessage: (threadId, person, body) =>
        set((s) => ({
          messages: [...s.messages, { id: uid('msg'), threadId, fromEmail: person.email, fromName: person.name, body, at: Date.now() }].slice(-1000),
        })),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      // Damaged or hand-edited storage must not crash the page.
      merge: mergeStored,
    },
  ),
);

if (typeof window !== 'undefined') {
  // Other tabs write the same key: pick their changes up so chat feels live.
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) void useCommunityStore.persist.rehydrate();
  });
}
