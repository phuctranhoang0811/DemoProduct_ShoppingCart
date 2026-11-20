'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bold,
  CheckCheck,
  ChevronDown,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  LogOut,
  MessageCircle,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Send,
  Strikethrough,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LIVE_THREAD,
  dmThreadId,
  useCommunityStore,
  type ChatMessage,
  type Person,
} from '@/stores/useCommunityStore';
import {
  emitAddToGroup,
  emitCreateGroup,
  emitEnsureMember,
  emitRemoveFromGroup,
  emitRenameGroup,
  emitSendMessage,
} from '@/lib/community-socket';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { resizeImageFile } from './resizeImage';

const field = 'w-full border border-[#E5E5E5] rounded-xs px-3 py-2 text-sm bg-white';
const AVATAR_COLORS = ['#E8B44A', '#6C8EAD', '#8A6FB0', '#4F9A7A', '#C46A5A', '#7A7F87'];

const cleanName = (name: string) => name.replace(/\s*\(.*\)/, '').trim();
const initials = (name: string) =>
  cleanName(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';
const colorFor = (key: string) => AVATAR_COLORS[key.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

function Avatar({ name, seed, size = 40, icon }: { name: string; seed: string; size?: number; icon?: 'live' | 'group' }) {
  const Icon = icon === 'live' ? MessageCircle : icon === 'group' ? Users : null;
  return (
    <span
      className="shrink-0 rounded-full flex items-center justify-center text-white font-semibold select-none"
      style={{ width: size, height: size, background: colorFor(seed), fontSize: size * 0.36 }}
      aria-hidden
    >
      {Icon ? <Icon style={{ width: size * 0.5, height: size * 0.5 }} /> : initials(name)}
    </span>
  );
}

const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString();
const clock = (ms: number) => new Date(ms).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
const longDate = (ms: number) => {
  const d = new Date(ms);
  return `${d.toLocaleDateString('en-US', { weekday: 'long' })}, ${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getFullYear()}`;
};
function listTime(ms: number): string {
  const now = Date.now();
  if (sameDay(ms, now)) return clock(ms);
  if (sameDay(ms, now - 86_400_000)) return 'Yesterday';
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getFullYear()}`;
}

// Small markdown subset: **bold**, _italic_, ~~strike~~, "- " bullets and "1. " numbered lines.
interface Mentions {
  re: RegExp | null;
  myName: string;
}
function withMentions(text: string, keyBase: string, mentions?: Mentions): React.ReactNode {
  if (!mentions?.re) return text;
  return text.split(mentions.re).map((part, i) =>
    i % 2 === 1 ? (
      <span key={`${keyBase}-m${i}`} className={`font-semibold rounded px-0.5 ${part.slice(1) === mentions.myName ? 'bg-[#FFE9A8] text-[#7A4B00]' : 'text-[#1D5FD1]'}`}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
function inline(text: string, keyBase: string, mentions?: Mentions) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_|~~[^~]+~~)/g).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={key}>{withMentions(part.slice(2, -2), key, mentions)}</strong>;
    if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4) return <s key={key}>{withMentions(part.slice(2, -2), key, mentions)}</s>;
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) return <em key={key}>{withMentions(part.slice(1, -1), key, mentions)}</em>;
    return <Fragment key={key}>{withMentions(part, key, mentions)}</Fragment>;
  });
}
function RichText({ body, mentions }: { body: string; mentions?: Mentions }) {
  const lines = body.split('\n');
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; ) {
    const bullet = /^- (.*)$/.exec(lines[i]);
    const numbered = /^\d+\. (.*)$/.exec(lines[i]);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const items: string[] = [];
      while (i < lines.length) {
        const m = ordered ? /^\d+\. (.*)$/.exec(lines[i]) : /^- (.*)$/.exec(lines[i]);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      const Tag = ordered ? 'ol' : 'ul';
      blocks.push(
        <Tag key={`l${i}`} className={`${ordered ? 'list-decimal' : 'list-disc'} pl-5 my-0.5`}>
          {items.map((it, j) => (
            <li key={j}>{inline(it, `li${i}-${j}`, mentions)}</li>
          ))}
        </Tag>,
      );
    } else {
      blocks.push(
        <p key={`p${i}`} className="min-h-[1.25em]">
          {inline(lines[i], `p${i}`, mentions)}
        </p>,
      );
      i++;
    }
  }
  return <div className="break-words">{blocks}</div>;
}

const readKey = (email: string) => `hellobee_chat_read_v1:${email}`;
function loadRead(email: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(readKey(email)) || '{}');
  } catch {
    return {};
  }
}

interface Conversation {
  id: string;
  label: string;
  seed: string;
  kind: 'live' | 'group' | 'dm';
  last?: ChatMessage;
  unread: number;
}

export function Chat({ me }: { me: Person }) {
  const groups = useCommunityStore((s) => s.groups);
  const messages = useCommunityStore((s) => s.messages);
  const joined = useCommunityStore((s) => s.members);
  const socketConnected = useCommunityStore((s) => s.socketConnected);
  const hellobeeMembers = useCommerceStore((s) => s.hellobeeMembers);

  const myEmail = me.email.toLowerCase();
  const [thread, setThread] = useState(LIVE_THREAD);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState({ groups: true, dms: true });
  const [read, setRead] = useState<Record<string, number>>({});
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [creating, setCreating] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [inviting, setInviting] = useState(false);
  const [invitePicked, setInvitePicked] = useState<string[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
  const [mentionIdx, setMentionIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setRead(loadRead(myEmail)), [myEmail]);
  useEffect(() => {
    emitEnsureMember(me);
  }, [me.email, me.name, socketConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const people = useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(joined).forEach(([email, m]) => map.set(email.toLowerCase(), m.name));
    hellobeeMembers.forEach((m) => {
      if (m.isActive && m.email && !map.has(m.email.toLowerCase())) map.set(m.email.toLowerCase(), m.name);
    });
    map.delete(myEmail);
    return Array.from(map, ([email, name]) => ({ email, name }));
  }, [joined, hellobeeMembers, myEmail]);

  const myGroups = useMemo(() => groups.filter((g) => g.memberEmails.includes(myEmail)), [groups, myEmail]);
  const activeGroup = myGroups.find((g) => g.id === thread);
  const invitable = activeGroup ? people.filter((p) => !activeGroup.memberEmails.includes(p.email)) : [];
  const nameOf = (email: string) => (email === myEmail ? me.name : people.find((p) => p.email === email)?.name ?? email);
  const isCreator = Boolean(activeGroup && activeGroup.createdBy === myEmail);

  const conversations = useMemo(() => {
    const byThread = new Map<string, ChatMessage[]>();
    messages.forEach((m) => byThread.set(m.threadId, [...(byThread.get(m.threadId) ?? []), m]));
    const make = (id: string, label: string, seed: string, kind: Conversation['kind']): Conversation => {
      const list = byThread.get(id) ?? [];
      const since = read[id] ?? 0;
      return { id, label, seed, kind, last: list[list.length - 1], unread: list.filter((m) => m.fromEmail.toLowerCase() !== myEmail && m.at > since).length };
    };
    const newest = (a: Conversation, b: Conversation) => (b.last?.at ?? 0) - (a.last?.at ?? 0);
    return {
      live: make(LIVE_THREAD, 'Live chat', 'live', 'live'),
      groups: myGroups.map((g) => make(g.id, g.name, g.id, 'group')).sort(newest),
      dms: people.map((p) => make(dmThreadId(myEmail, p.email), cleanName(p.name), p.email, 'dm')).sort(newest),
    };
  }, [messages, myGroups, people, myEmail, read]);

  const active =
    thread === LIVE_THREAD ? conversations.live : conversations.groups.find((c) => c.id === thread) ?? conversations.dms.find((c) => c.id === thread) ?? conversations.live;
  const current = useMemo(() => messages.filter((m) => m.threadId === active.id), [messages, active.id]);

  const tagable = useMemo(() => {
    if (active.kind === 'group') return people.filter((p) => activeGroup?.memberEmails.includes(p.email));
    if (active.kind === 'dm') return people.filter((p) => dmThreadId(myEmail, p.email) === active.id);
    return people;
  }, [active.kind, active.id, activeGroup, people, myEmail]);
  const mentions = useMemo<Mentions>(() => {
    const names = [...people.map((p) => cleanName(p.name)), cleanName(me.name)].filter(Boolean).sort((a, b) => b.length - a.length);
    const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return { re: escaped.length ? new RegExp(`(@(?:${escaped.join('|')}))(?![\\p{L}\\p{N}])`, 'gu') : null, myName: cleanName(me.name) };
  }, [people, me.name]);
  const mentionList = mention ? tagable.filter((p) => cleanName(p.name).toLowerCase().includes(mention.query.toLowerCase())).slice(0, 6) : [];

  // Opening a conversation, or receiving a message in it, marks it read.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    const next = { ...read, [active.id]: Date.now() };
    setRead(next);
    try {
      localStorage.setItem(readKey(myEmail), JSON.stringify(next));
    } catch {
      /* storage unavailable: unread counts just reset on reload */
    }
  }, [active.id, current.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = query.trim().toLowerCase();
  const matches = (c: Conversation) => !q || c.label.toLowerCase().includes(q);
  const shownGroups = conversations.groups.filter(matches);
  const shownDms = conversations.dms.filter(matches);
  const showLive = matches(conversations.live);

  const choose = (id: string) => {
    setThread(id);
    setInviting(false);
    setShowMembers(false);
    setRenaming(null);
    setMention(null);
    setInvitePicked([]);
    setText('');
    setImage(undefined);
  };

  const wrap = (before: string, after = before) => {
    const el = inputRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const next = text.slice(0, s) + before + (text.slice(s, e) || 'text') + after + text.slice(e);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + (e > s ? e - s : 4));
    });
  };
  const prefixLines = (numbered: boolean) => {
    const el = inputRef.current;
    if (!el) return;
    const start = text.lastIndexOf('\n', el.selectionStart - 1) + 1;
    const endIdx = text.indexOf('\n', el.selectionEnd);
    const end = endIdx === -1 ? text.length : endIdx;
    const lines = text.slice(start, end).split('\n').map((l, i) => `${numbered ? `${i + 1}. ` : '- '}${l}`);
    setText(text.slice(0, start) + lines.join('\n') + text.slice(end));
    requestAnimationFrame(() => el.focus());
  };

  const attach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImage(await resizeImageFile(file));
    } catch {
      toast.error('Could not process that image.');
    }
    e.target.value = '';
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() && !image) return;
    emitSendMessage(active.id, { email: myEmail, name: me.name }, text.trim(), image);
    setText('');
    setImage(undefined);
  };

  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    const caret = e.target.selectionStart;
    const m = /(^|\s)@([^\s@]{0,30})$/.exec(value.slice(0, caret));
    if (m) {
      setMention({ start: caret - m[2].length - 1, query: m[2] });
      setMentionIdx(0);
    } else setMention(null);
  };
  const pickMention = (p: { name: string }) => {
    if (!mention) return;
    const el = inputRef.current;
    const caret = el?.selectionStart ?? text.length;
    const insert = `@${cleanName(p.name)} `;
    setText(text.slice(0, mention.start) + insert + text.slice(caret));
    setMention(null);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(mention.start + insert.length, mention.start + insert.length);
    });
  };

  const rename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || renaming === null) return;
    const ok = await emitRenameGroup(activeGroup.id, { email: myEmail, name: me.name }, renaming);
    if (ok) toast.success('Group renamed.');
    setRenaming(null);
  };
  const removeMember = async (email: string) => {
    if (!activeGroup) return;
    const leaving = email === myEmail;
    const ok = await emitRemoveFromGroup(activeGroup.id, myEmail, email, cleanName(nameOf(email)));
    if (ok) {
      toast.success(leaving ? 'You left the group.' : 'Member removed.');
      if (leaving) choose(LIVE_THREAD);
    }
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || invitePicked.length === 0) return;
    const added = await emitAddToGroup(activeGroup.id, myEmail, invitePicked, me.name, invitePicked.map((em) => cleanName(nameOf(em))));
    toast.success(added > 0 ? `Added ${added} to ${activeGroup.name}.` : 'Nobody new to add.');
    setInvitePicked([]);
    setInviting(false);
  };
  const makeGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || picked.length === 0) {
      toast.error('Name the group and pick at least one member.');
      return;
    }
    choose(await emitCreateGroup(groupName.trim(), myEmail, picked));
    setGroupName('');
    setPicked([]);
    setCreating(false);
  };

  const row = (c: Conversation) => {
    const selected = c.id === active.id;
    const preview = c.last ? `${c.last.fromEmail.toLowerCase() === myEmail ? 'You: ' : c.kind === 'dm' ? '' : `${cleanName(c.last.fromName)}: `}${c.last.imageUrl && !c.last.body ? '[Image]' : c.last.body.replace(/\n/g, ' ')}` : 'No messages yet';
    return (
      <button
        key={c.id}
        type="button"
        onClick={() => choose(c.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${selected ? 'bg-[#EDEDED]' : 'hover:bg-[#F6F6F6]'}`}
      >
        <Avatar name={c.label} seed={c.seed} icon={c.kind === 'dm' ? undefined : c.kind} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold text-[#111111]">{c.label}</span>
            {c.last && <span className="shrink-0 text-[11px] text-[#777777]">{listTime(c.last.at)}</span>}
          </span>
          <span className="flex items-center justify-between gap-2">
            <span className={`truncate text-xs ${c.unread ? 'text-[#111111]' : 'text-[#777777]'}`}>{preview}</span>
            {c.unread > 0 && !selected && (
              <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E53935] text-white text-[10px] font-bold flex items-center justify-center">
                {c.unread}
              </span>
            )}
          </span>
        </span>
      </button>
    );
  };

  const section = (key: 'groups' | 'dms', label: string, count: number, extra?: React.ReactNode) => (
    <div className="flex items-center justify-between px-4 pt-3 pb-1">
      <button type="button" onClick={() => setOpen({ ...open, [key]: !open[key] })} className="flex items-center gap-2 text-sm text-[#333333]" aria-expanded={open[key]}>
        <ChevronDown className={`w-4 h-4 transition-transform ${open[key] ? '' : '-rotate-90'}`} />
        {label}
        <span className="text-[11px] text-[#999999]">{count}</span>
      </button>
      {extra}
    </div>
  );

  return (
    <div className="grid md:grid-cols-[320px_1fr] bg-white border border-[#E5E5E5] rounded-xl overflow-hidden h-[640px]">
      <aside className="border-b md:border-b-0 md:border-r border-[#E5E5E5] flex flex-col min-h-0 max-h-[320px] md:max-h-none">
        <div className="p-3 shrink-0">
          <label className="flex items-center gap-2 border border-[#D9D9D9] rounded-full px-3.5 py-2 bg-white focus-within:border-[#111111]">
            <Search className="w-4 h-4 text-[#777777]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or group"
              aria-label="Search conversations"
              className="w-full text-sm outline-none bg-transparent"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {showLive && row(conversations.live)}

          {section(
            'groups',
            'Groups',
            conversations.groups.length,
            <button type="button" onClick={() => setCreating((v) => !v)} aria-label="New group" className="p-1 hover:bg-[#F0F0F0] rounded">
              <Plus className="w-4 h-4" />
            </button>,
          )}
          {creating && (
            <form onSubmit={makeGroup} className="mx-4 mb-2 space-y-2 p-3 border border-[#E5E5E5] rounded-xs">
              <input className={field} placeholder="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
              <div className="max-h-28 overflow-y-auto space-y-1">
                {people.map((p) => (
                  <label key={p.email} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={picked.includes(p.email)} onChange={(e) => setPicked(e.target.checked ? [...picked, p.email] : picked.filter((x) => x !== p.email))} />
                    <span className="truncate">{p.name}</span>
                  </label>
                ))}
                {people.length === 0 && <p className="text-xs text-[#888888]">No other members yet.</p>}
              </div>
              <button type="submit" className="w-full bg-[#111111] text-white py-1.5 text-xs uppercase font-semibold rounded-xs">
                Create
              </button>
            </form>
          )}
          {open.groups && (shownGroups.length ? shownGroups.map(row) : <p className="px-4 py-2 text-xs text-[#888888]">{q ? 'No matching groups.' : 'No groups yet.'}</p>)}

          {section('dms', 'Direct Messages', conversations.dms.length)}
          {open.dms && (shownDms.length ? shownDms.map(row) : <p className="px-4 py-2 text-xs text-[#888888]">{q ? 'No matching members.' : 'No other members yet.'}</p>)}
        </div>
      </aside>

      <div className="flex flex-col min-h-0">
        <header className="px-5 py-3 border-b border-[#E5E5E5] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={active.label} seed={active.seed} size={36} icon={active.kind === 'dm' ? undefined : active.kind} />
            <div className="min-w-0">
              {renaming !== null ? (
                <form onSubmit={rename} className="flex items-center gap-1">
                  <input autoFocus value={renaming} maxLength={40} onChange={(e) => setRenaming(e.target.value)} aria-label="Rename group" className="border border-[#CFCFCF] rounded-xs px-2 py-1 text-sm w-44" />
                  <button type="submit" className="text-xs font-semibold underline">Save</button>
                  <button type="button" onClick={() => setRenaming(null)} className="text-xs text-[#777777]">Cancel</button>
                </form>
              ) : (
                <p className="text-sm font-semibold text-[#111111] truncate">{active.label}</p>
              )}
              <p className="text-xs text-[#777777]">
                {active.kind === 'live' ? 'Everyone in the community' : active.kind === 'group' ? `${activeGroup?.memberEmails.length ?? 0} member${activeGroup?.memberEmails.length === 1 ? "" : "s"}` : 'Direct message'}
                {active.last && ` · last message ${listTime(active.last.at)}`}
              </p>
            </div>
          </div>
          {activeGroup && (
            <div className="flex items-center gap-3 shrink-0">
              <button type="button" onClick={() => setRenaming(activeGroup.name)} className="inline-flex items-center gap-1 text-xs font-semibold underline">
                <Pencil className="w-3.5 h-3.5" /> Rename
              </button>
              <button type="button" onClick={() => setShowMembers((v) => !v)} aria-expanded={showMembers} className="inline-flex items-center gap-1 text-xs font-semibold underline">
                <Users className="w-3.5 h-3.5" /> Members
              </button>
              <button type="button" onClick={() => setInviting((v) => !v)} className="inline-flex items-center gap-1 text-xs font-semibold underline">
                <Plus className="w-3.5 h-3.5" /> Add members
              </button>
            </div>
          )}
        </header>
        {activeGroup && showMembers && (
          <div className="p-3 border-b border-[#E5E5E5] bg-[#FAF9F5] shrink-0 space-y-1" aria-label="Group members">
            {activeGroup.memberEmails.map((email) => (
              <div key={email} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate">
                  {cleanName(nameOf(email))}
                  {email === myEmail && ' (you)'}
                  {email === activeGroup.createdBy && ' · creator'}
                </span>
                {isCreator && email !== myEmail && (
                  <button type="button" onClick={() => removeMember(email)} aria-label={`Remove ${cleanName(nameOf(email))}`} className="inline-flex items-center gap-1 text-[#B3261E] font-semibold">
                    <UserMinus className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => removeMember(myEmail)} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#B3261E]">
              <LogOut className="w-3.5 h-3.5" /> Leave group
            </button>
          </div>
        )}
        {activeGroup && inviting && (
          <form onSubmit={invite} className="p-3 border-b border-[#E5E5E5] space-y-2 bg-[#FAF9F5] shrink-0">
            {invitable.length === 0 ? (
              <p className="text-xs text-[#777777]">Everyone is already in this group.</p>
            ) : (
              <div className="max-h-28 overflow-y-auto space-y-1">
                {invitable.map((p) => (
                  <label key={p.email} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={invitePicked.includes(p.email)} onChange={(e) => setInvitePicked(e.target.checked ? [...invitePicked, p.email] : invitePicked.filter((x) => x !== p.email))} />
                    <span className="truncate">{p.name}</span>
                  </label>
                ))}
              </div>
            )}
            <button type="submit" disabled={invitePicked.length === 0} className="bg-[#111111] text-white px-4 py-1.5 text-xs uppercase font-semibold rounded-xs disabled:opacity-40">
              Add
            </button>
          </form>
        )}

        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 min-h-0 bg-white">
          {current.length === 0 && <p className="text-xs text-[#888888] text-center mt-6">No messages yet. Say hello.</p>}
          {current.map((m, i) => {
            const mine = m.fromEmail.toLowerCase() === myEmail;
            const prev = current[i - 1];
            const newDay = !prev || !sameDay(prev.at, m.at);
            if (m.system) {
              return (
                <Fragment key={m.id}>
                  {newDay && (
                    <div className="flex items-center gap-3 my-4" role="separator">
                      <span className="flex-1 h-px bg-[#E5E5E5]" />
                      <span className="text-[11px] text-[#777777] border border-[#E5E5E5] rounded-full px-3 py-1">{longDate(m.at)}</span>
                      <span className="flex-1 h-px bg-[#E5E5E5]" />
                    </div>
                  )}
                  <p className="my-2 text-center text-[11px] text-[#777777]" data-system>{inline(m.body, m.id, mentions)}</p>
                </Fragment>
              );
            }
            const showName = !mine && active.kind !== 'dm' && (newDay || prev.fromEmail !== m.fromEmail);
            return (
              <Fragment key={m.id}>
                {newDay && (
                  <div className="flex items-center gap-3 my-4" role="separator">
                    <span className="flex-1 h-px bg-[#E5E5E5]" />
                    <span className="text-[11px] text-[#777777] border border-[#E5E5E5] rounded-full px-3 py-1">{longDate(m.at)}</span>
                    <span className="flex-1 h-px bg-[#E5E5E5]" />
                  </div>
                )}
                <div className={`flex mb-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg px-3.5 py-2.5 text-sm text-[#222222] ${mine ? 'bg-[#DCF5D0] rounded-tr-none' : 'bg-[#F1F1F1] rounded-tl-none'}`}>
                    {showName && <p className="text-[11px] font-semibold text-[#8A5A0B] mb-0.5">{cleanName(m.fromName)}</p>}
                    {m.body && <RichText body={m.body} mentions={mentions} />}
                    {m.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.imageUrl} alt="Shared image" className="mt-1 max-h-72 w-auto max-w-full rounded-md border border-black/5" />
                    )}
                    <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-[#888888]">
                      {mine && <CheckCheck className="w-3.5 h-3.5 text-[#2EA043]" aria-label="Sent" />}
                      {clock(m.at)}
                    </p>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>

        <form onSubmit={submit} className="m-4 mt-0 border border-[#CFCFCF] rounded-lg shrink-0 focus-within:border-[#111111]">
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#E5E5E5] text-[#555555]">
            {[
              { label: 'Bold', icon: Bold, run: () => wrap('**') },
              { label: 'Italic', icon: Italic, run: () => wrap('_') },
              { label: 'Strikethrough', icon: Strikethrough, run: () => wrap('~~') },
            ].map(({ label, icon: Icon, run }) => (
              <button key={label} type="button" onClick={run} aria-label={label} title={label} className="p-1.5 rounded hover:bg-[#F0F0F0]">
                <Icon className="w-4 h-4" />
              </button>
            ))}
            <span className="w-px h-4 bg-[#E0E0E0] mx-1" />
            <button type="button" onClick={() => prefixLines(false)} aria-label="Bulleted list" title="Bulleted list" className="p-1.5 rounded hover:bg-[#F0F0F0]">
              <List className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => prefixLines(true)} aria-label="Numbered list" title="Numbered list" className="p-1.5 rounded hover:bg-[#F0F0F0]">
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>
          {image && (
            <div className="px-3 pt-3 relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Attachment preview" className="max-h-24 rounded-md border border-[#E5E5E5]" />
              <button type="button" onClick={() => setImage(undefined)} aria-label="Remove image" className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {mention && mentionList.length > 0 && (
            <ul role="listbox" aria-label="Mention suggestions" className="mx-3 mb-1 border border-[#E5E5E5] rounded-md bg-white shadow-sm overflow-hidden">
              {mentionList.map((p, i) => (
                <li key={p.email} role="option" aria-selected={i === mentionIdx}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickMention(p);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm ${i === mentionIdx ? 'bg-[#F1F1F1]' : ''}`}
                  >
                    <Avatar name={p.name} seed={p.email} size={22} />
                    {cleanName(p.name)}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <textarea
            ref={inputRef}
            rows={2}
            maxLength={1000}
            value={text}
            onChange={onTextChange}
            onKeyDown={(e) => {
              if (mention && mentionList.length > 0) {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  setMentionIdx((i) => (i + (e.key === 'ArrowDown' ? 1 : mentionList.length - 1)) % mentionList.length);
                  return;
                }
                if (e.key === 'Enter' || e.key === 'Tab') {
                  e.preventDefault();
                  pickMention(mentionList[mentionIdx] ?? mentionList[0]);
                  return;
                }
                if (e.key === 'Escape') {
                  setMention(null);
                  return;
                }
              }
              if (e.key === 'Enter' && !e.shiftKey) submit(e);
            }}
            placeholder="Type message here"
            aria-label="Message"
            className="w-full resize-none px-4 py-3 text-sm outline-none bg-transparent"
          />
          <div className="flex items-center justify-between px-3 pb-2.5">
            <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach image" title="Attach image" className="p-1.5 rounded text-[#555555] hover:bg-[#F0F0F0]">
              <Paperclip className="w-5 h-5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={attach} className="hidden" />
            <button
              type="submit"
              aria-label="Send"
              disabled={!text.trim() && !image}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-[#111111] disabled:bg-[#CFCFCF] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
