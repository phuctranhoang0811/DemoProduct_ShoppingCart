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

const isSample = (item) => /^(meet|post)-seed-/.test(String(item?.id || ''));

const defaultState = () => ({
  codes: [],
  members: {},
  meetings: [],
  posts: [],
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
      meetings: Array.isArray(raw.meetings) ? raw.meetings.filter((m) => !isSample(m)) : [],
      posts: Array.isArray(raw.posts) ? raw.posts.filter((x) => !isSample(x)) : [],
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
      const names = Array.isArray(payload?.names) ? payload.names : [];
      const label = (e) => String(names[emails.findIndex((x) => norm(x) === e)] || e).slice(0, 60);
      systemNote(groupId, `${String(payload?.actorName || actor).slice(0, 60)} added ${added.map((e) => `@${label(e)}`).join(', ')} to the group`);
      broadcast();
    }
    if (typeof ack === 'function') ack({ ok: true, added: added.length });
  });

  const systemNote = (threadId, body) => {
    state.messages = [...state.messages, { id: uid('msg'), threadId, fromEmail: 'system', fromName: 'System', body, system: true, at: Date.now() }].slice(-1000);
  };

  socket.on('group:rename', (payload, ack) => {
    const group = state.groups.find((g) => g.id === String(payload?.groupId || ''));
    const actor = norm(payload?.actorEmail);
    const name = String(payload?.name || '').trim().slice(0, 40);
    const actorName = String(payload?.actorName || actor).slice(0, 60);
    if (!group || !name || name === group.name || !group.memberEmails.includes(actor)) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    state.groups = state.groups.map((g) => (g.id === group.id ? { ...g, name } : g));
    systemNote(group.id, `${actorName} renamed the group to "${name}"`);
    broadcast();
    if (typeof ack === 'function') ack({ ok: true });
  });

  // Anyone can leave; only the creator can remove someone else, and never themselves via "remove".
  socket.on('group:remove', (payload, ack) => {
    const group = state.groups.find((g) => g.id === String(payload?.groupId || ''));
    const actor = norm(payload?.actorEmail);
    const target = norm(payload?.email);
    const targetName = String(payload?.targetName || target).slice(0, 60);
    const allowed = group && group.memberEmails.includes(actor) && group.memberEmails.includes(target) && (actor === target || (actor === group.createdBy && target !== group.createdBy));
    if (!allowed) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    state.groups = state.groups.map((g) => (g.id === group.id ? { ...g, memberEmails: g.memberEmails.filter((e) => e !== target) } : g));
    systemNote(group.id, actor === target ? `${targetName} left the group` : `${targetName} was removed from the group`);
    broadcast();
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('chat:message', (payload, ack) => {
    const threadId = String(payload?.threadId || '').trim();
    const email = norm(payload?.person?.email);
    const name = String(payload?.person?.name || '').trim() || email;
    const body = String(payload?.body || '').trim().slice(0, 1000);
    // Only small inline images; anything else is dropped rather than stored and rebroadcast.
    const imageUrl =
      typeof payload?.imageUrl === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(payload.imageUrl) && payload.imageUrl.length <= 700_000
        ? payload.imageUrl
        : undefined;
    if (!threadId || (!body && !imageUrl)) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    const msg = {
      id: uid('msg'),
      threadId,
      fromEmail: email,
      fromName: name,
      body,
      ...(imageUrl ? { imageUrl } : {}),
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
