import { createServer } from 'node:http';
import { Server } from 'socket.io';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.SOCKET_PORT || process.env.PORT || 4000);
const DATA_FILE = path.resolve(process.cwd(), 'server', '.community-data.json');
const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_MISSES = 5;
const LOCK_MS = 30_000;

const SEED_MEETINGS = [
  {
    id: 'meet-seed-1',
    title: 'Monthly Members Meeting',
    kind: 'Meeting',
    date: '2026-12-05',
    time: '7:00 PM',
    location: 'Hello Bee Studio, Ho Chi Minh City',
    description: 'Product updates, LV1–LV10 rank progress and open questions for every member.',
    hostName: 'Hello Bee Team',
    attendees: [],
  },
  {
    id: 'meet-seed-2',
    title: 'Weekend Team Dinner & Drinks',
    kind: 'Dining',
    date: '2026-12-12',
    time: '6:30 PM',
    location: 'Riverside Garden Restaurant',
    description: 'Eat, drink, share stories and meet your upline and downline offline.',
    hostName: 'Johnathan Bee',
    attendees: [],
  },
  {
    id: 'meet-seed-3',
    title: 'Sunday Coffee & Offline Meetup',
    kind: 'Gathering',
    date: '2026-12-19',
    time: '9:30 AM',
    location: 'The Hive Coffee, District 1',
    description: 'Casual weekend coffee meetup to welcome new members and exchange ideas.',
    hostName: 'David Nguyen',
    attendees: [],
  },
];

const SEED_POSTS = [
  {
    id: 'post-seed-1',
    authorEmail: 'owner@hellobee.com',
    authorName: 'Johnathan Bee (Managing Owner)',
    category: 'Dining & Drinks',
    location: 'Riverside Garden Restaurant',
    body: 'Great dinner & drinks tonight with the crew! Looking forward to welcoming everyone at our next weekend meetup.',
    imageUrl: '/images/events/campfire.webp',
    createdAt: Date.UTC(2026, 10, 15, 19, 30),
  },
  {
    id: 'post-seed-2',
    authorEmail: 'employee@hellobee.com',
    authorName: 'David Nguyen (Senior Associate)',
    category: 'Offline Meetup',
    location: 'The Hive Coffee, District 1',
    body: 'Hosting a casual coffee and offline hangout this Sunday morning. Bring any new friends who want to learn about Hello Bee!',
    createdAt: Date.UTC(2026, 10, 18, 9, 15),
  },
];

const defaultState = () => ({
  codes: [],
  members: {},
  meetings: SEED_MEETINGS,
  posts: SEED_POSTS,
  groups: [],
  messages: [],
});

function loadState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return defaultState();
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return {
      codes: Array.isArray(raw.codes) ? raw.codes : [],
      members: raw.members && typeof raw.members === 'object' && !Array.isArray(raw.members) ? raw.members : {},
      meetings: Array.isArray(raw.meetings) ? raw.meetings : SEED_MEETINGS,
      posts: Array.isArray(raw.posts) ? raw.posts : SEED_POSTS,
      groups: Array.isArray(raw.groups) ? raw.groups : [],
      messages: Array.isArray(raw.messages) ? raw.messages : [],
    };
  } catch {
    return defaultState();
  }
}

let state = loadState();
let saveTimer = null;

function saveState() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      const tmp = `${DATA_FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
      fs.renameSync(tmp, DATA_FILE);
    } catch (err) {
      console.error('[socket] failed to persist state:', err);
    }
  }, 50);
}

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const norm = (email) => String(email || '').trim().toLowerCase();

function randomCode() {
  const bytes = crypto.randomBytes(8);
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');
}

const snapshot = () => ({
  codes: state.codes,
  members: state.members,
  meetings: state.meetings,
  posts: state.posts,
  groups: state.groups,
  messages: state.messages,
});

const missTrackers = new Map();

function getLockedMs(key) {
  const entry = missTrackers.get(key);
  if (!entry) return 0;
  return Math.max(0, entry.lockedUntil - Date.now());
}

function recordMiss(key) {
  const entry = missTrackers.get(key) || { misses: 0, lockedUntil: 0 };
  entry.misses += 1;
  if (entry.misses >= MAX_MISSES) {
    entry.misses = 0;
    entry.lockedUntil = Date.now() + LOCK_MS;
  }
  missTrackers.set(key, entry);
}

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, clients: io.engine.clientsCount }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: { origin: true, credentials: true },
  maxHttpBufferSize: 5e6,
});

function broadcast() {
  saveState();
  io.emit('community:state', snapshot());
}

io.on('connection', (socket) => {
  socket.emit('community:state', snapshot());

  socket.on('code:create', (payload, ack) => {
    const adminName = String(payload?.adminName || 'Admin').trim() || 'Admin';
    const now = Date.now();
    const entry = {
      code: randomCode(),
      createdAt: now,
      expiresAt: now + CODE_TTL_MS,
      createdBy: adminName,
    };
    state.codes = [entry, ...state.codes].slice(0, 50);
    broadcast();
    if (typeof ack === 'function') ack({ ok: true, entry });
  });

  socket.on('code:redeem', (payload, ack) => {
    const email = norm(payload?.person?.email);
    const name = String(payload?.person?.name || '').trim() || email;
    const rawCode = String(payload?.code || '').trim().toUpperCase();
    const lockKey = email || socket.id;

    if (!email) {
      if (typeof ack === 'function') ack({ ok: false, message: 'Email is required.' });
      return;
    }
    if (state.members[email]) {
      if (typeof ack === 'function') ack({ ok: false, message: 'You are already a member.' });
      return;
    }

    const wait = getLockedMs(lockKey);
    if (wait > 0) {
      if (typeof ack === 'function') {
        ack({ ok: false, message: `Too many wrong codes. Try again in ${Math.ceil(wait / 1000)} seconds.` });
      }
      return;
    }

    const entry = state.codes.find((c) => c.code === rawCode);
    if (!entry) {
      recordMiss(lockKey);
      if (typeof ack === 'function') ack({ ok: false, message: 'Code not found.' });
      return;
    }
    if (entry.usedBy) {
      if (typeof ack === 'function') ack({ ok: false, message: 'This code has already been used.' });
      return;
    }
    if (entry.expiresAt <= Date.now()) {
      if (typeof ack === 'function') ack({ ok: false, message: 'This code has expired. Ask an admin for a new one.' });
      return;
    }

    state.codes = state.codes.map((c) => (c.code === entry.code ? { ...c, usedBy: email } : c));
    state.members = {
      ...state.members,
      [email]: { name, joinedAt: Date.now(), code: entry.code },
    };
    missTrackers.delete(lockKey);
    broadcast();
    if (typeof ack === 'function') ack({ ok: true, message: 'Welcome! Your membership is active.' });
  });

  socket.on('member:ensure', (payload) => {
    const email = norm(payload?.person?.email);
    const name = String(payload?.person?.name || '').trim() || email;
    if (!email || state.members[email]) return;
    state.members = {
      ...state.members,
      [email]: { name, joinedAt: Date.now(), code: '' },
    };
    broadcast();
  });

  socket.on('meeting:create', (payload, ack) => {
    const title = String(payload?.title || '').trim();
    const date = String(payload?.date || '').trim();
    const location = String(payload?.location || '').trim();
    if (!title || !date || !location) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    const meeting = {
      id: uid('meet'),
      title,
      kind: payload?.kind || 'Meeting',
      date,
      time: String(payload?.time || '').trim(),
      location,
      description: String(payload?.description || '').trim(),
      hostName: String(payload?.hostName || 'Member').trim(),
      attendees: [],
    };
    state.meetings = [meeting, ...state.meetings];
    broadcast();
    if (typeof ack === 'function') ack({ ok: true, id: meeting.id });
  });

  socket.on('meeting:rsvp', (payload) => {
    const meetingId = String(payload?.meetingId || '');
    const email = norm(payload?.email);
    if (!meetingId || !email) return;
    state.meetings = state.meetings.map((m) =>
      m.id !== meetingId
        ? m
        : {
            ...m,
            attendees: m.attendees.includes(email)
              ? m.attendees.filter((e) => e !== email)
              : [...m.attendees, email],
          },
    );
    broadcast();
  });

  socket.on('post:create', (payload, ack) => {
    const email = norm(payload?.person?.email);
    const name = String(payload?.person?.name || '').trim() || email;
    const body = String(payload?.body || '').trim().slice(0, 1000);
    if (!body) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    const meta = payload?.meta || {};
    const post = {
      id: uid('post'),
      authorEmail: email,
      authorName: name,
      body,
      ...(meta.category ? { category: meta.category } : {}),
      ...(meta.location ? { location: String(meta.location).trim() } : {}),
      ...(meta.imageUrl ? { imageUrl: String(meta.imageUrl) } : {}),
      createdAt: Date.now(),
    };
    state.posts = [post, ...state.posts].slice(0, 200);
    broadcast();
    if (typeof ack === 'function') ack({ ok: true, id: post.id });
  });

  socket.on('group:create', (payload, ack) => {
    const name = String(payload?.name || '').trim();
    const creator = norm(payload?.creator);
    const rawMembers = Array.isArray(payload?.memberEmails) ? payload.memberEmails : [];
    if (!name || !creator) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    const id = uid('grp');
    const memberEmails = Array.from(new Set([creator, ...rawMembers.map(norm).filter(Boolean)]));
    state.groups = [...state.groups, { id, name, createdBy: creator, memberEmails }];
    broadcast();
    if (typeof ack === 'function') ack({ ok: true, id });
  });

  socket.on('group:add', (payload, ack) => {
    const groupId = String(payload?.groupId || '');
    const actor = norm(payload?.actorEmail);
    const emails = Array.isArray(payload?.emails) ? payload.emails : [];
    const group = state.groups.find((g) => g.id === groupId);
    if (!group || !group.memberEmails.includes(actor)) {
      if (typeof ack === 'function') ack({ ok: true, added: 0 });
      return;
    }
    const added = Array.from(new Set(emails.map(norm))).filter((e) => e && !group.memberEmails.includes(e));
    if (added.length > 0) {
      state.groups = state.groups.map((g) =>
        g.id === groupId ? { ...g, memberEmails: [...g.memberEmails, ...added] } : g,
      );
      broadcast();
    }
    if (typeof ack === 'function') ack({ ok: true, added: added.length });
  });

  socket.on('chat:message', (payload, ack) => {
    const threadId = String(payload?.threadId || '').trim();
    const email = norm(payload?.person?.email);
    const name = String(payload?.person?.name || '').trim() || email;
    const body = String(payload?.body || '').trim().slice(0, 1000);
    if (!threadId || !body) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    const msg = {
      id: uid('msg'),
      threadId,
      fromEmail: email,
      fromName: name,
      body,
      at: Date.now(),
    };
    state.messages = [...state.messages, msg].slice(-1000);
    broadcast();
    if (typeof ack === 'function') ack({ ok: true, id: msg.id });
  });
});

httpServer.listen(PORT, () => {
  console.log(`[socket.io] listening on http://localhost:${PORT}`);
});
