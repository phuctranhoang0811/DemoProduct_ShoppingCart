'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, Lock, MessageCircle, Newspaper, Plus, Send, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  LIVE_THREAD,
  SUPPORT_EMAIL,
  dmThreadId,
  useCommunityStore,
  type MeetingKind,
  type Person,
} from '@/stores/useCommunityStore';
import { useIsMember } from './useIsMember';

type Tab = 'meetings' | 'posts' | 'chat';

const KINDS: MeetingKind[] = ['Meeting', 'Dining', 'Gathering'];
const input = 'w-full border border-[#E5E5E5] rounded-xs px-3 py-2 text-sm bg-white';

const when = (ms: number) => new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export function CommunityHub() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('meetings');
  const { user, isMember } = useIsMember();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'meetings', label: 'Meetings', icon: CalendarCheck },
    { id: 'posts', label: 'Posts', icon: Newspaper },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
  ];

  return (
    <section id="community" className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 pb-20 scroll-mt-24">
      <h2 className="text-xs uppercase tracking-wider font-bold mb-2">Member Community</h2>
      <p className="text-sm text-[#666666] mb-6">Meetings, dinners, posts and chat for Hellobee members.</p>

      {!user || !isMember ? (
        <div className="border border-dashed border-[#CCCCCC] rounded-xl p-8 text-center space-y-3 bg-white">
          <Lock className="w-6 h-6 mx-auto text-[#777777]" />
          <p className="text-sm text-[#555555] max-w-md mx-auto">
            {user
              ? 'The community is for members. Buy a Hellobee system, or enter a membership code from an admin in your account.'
              : 'Sign in to see the community. Members get meetings, posts and chat.'}
          </p>
          <Link
            href={user ? '/account' : '/login'}
            className="inline-block bg-[#111111] text-white px-6 py-2.5 text-xs uppercase font-semibold tracking-wider rounded-xs btn-tactile"
          >
            {user ? 'Enter membership code' : 'Sign in'}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold ${
                  tab === id ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#555555] border-[#E5E5E5]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
          {tab === 'meetings' && <Meetings me={{ email: user.email, name: user.name }} />}
          {tab === 'posts' && <Posts me={{ email: user.email, name: user.name }} />}
          {tab === 'chat' && <Chat me={{ email: user.email, name: user.name }} />}
        </>
      )}
    </section>
  );
}

function Meetings({ me }: { me: Person }) {
  const meetings = useCommunityStore((s) => s.meetings);
  const addMeeting = useCommunityStore((s) => s.addMeeting);
  const toggleRsvp = useCommunityStore((s) => s.toggleRsvp);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', kind: 'Meeting' as MeetingKind, date: '', time: '', location: '', description: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.location.trim()) {
      toast.error('Add a title, date and location.');
      return;
    }
    addMeeting({ ...form, hostName: me.name });
    setForm({ title: '', kind: 'Meeting', date: '', time: '', location: '', description: '' });
    setOpen(false);
    toast.success('Meeting posted.');
  };

  const sorted = [...meetings].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1.5 text-xs font-semibold underline">
        <Plus className="w-3.5 h-3.5" /> Organize a meeting, dinner or gathering
      </button>

      {open && (
        <form onSubmit={submit} className="bg-white border border-[#E5E5E5] rounded-xl p-5 grid sm:grid-cols-2 gap-3">
          <input className={`${input} sm:col-span-2`} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className={input} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as MeetingKind })}>
            {KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          <input className={input} placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input type="date" className={input} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input className={input} placeholder="Time, e.g. 7:00 PM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <textarea rows={2} className={`${input} sm:col-span-2`} placeholder="What is it about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="sm:col-span-2 bg-[#111111] text-white py-2.5 text-xs uppercase font-semibold tracking-wider rounded-xs btn-tactile">
            Post meeting
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((m) => {
          const going = m.attendees.includes(me.email);
          return (
            <article key={m.id} className="bg-white border border-[#E5E5E5] rounded-xl p-5 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#B8860B]">{m.kind}</span>
              <h3 className="font-semibold">{m.title}</h3>
              <p className="text-xs text-[#666666]">{m.description}</p>
              <p className="text-xs text-[#555555]">
                {m.date} {m.time && `· ${m.time}`} · {m.location}
              </p>
              <p className="text-[11px] text-[#888888]">Hosted by {m.hostName} · {m.attendees.length} going</p>
              <button
                type="button"
                onClick={() => toggleRsvp(m.id, me.email)}
                className={`mt-auto text-xs font-semibold uppercase tracking-wider py-2 rounded-xs border btn-tactile ${
                  going ? 'bg-emerald-600 text-white border-emerald-600' : 'border-[#111111] text-[#111111]'
                }`}
              >
                {going ? 'Going' : 'Join'}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Posts({ me }: { me: Person }) {
  const posts = useCommunityStore((s) => s.posts);
  const addPost = useCommunityStore((s) => s.addPost);
  const [body, setBody] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    addPost(me, body.trim());
    setBody('');
  };

  return (
    <div className="max-w-2xl space-y-4">
      <form onSubmit={submit} className="bg-white border border-[#E5E5E5] rounded-xl p-4 space-y-3">
        <textarea rows={3} maxLength={1000} className={input} placeholder="Share something with the members" value={body} onChange={(e) => setBody(e.target.value)} />
        <button type="submit" disabled={!body.trim()} className="bg-[#111111] text-white px-5 py-2 text-xs uppercase font-semibold tracking-wider rounded-xs disabled:opacity-40 btn-tactile">
          Post
        </button>
      </form>
      {posts.length === 0 && <p className="text-sm text-[#777777]">No posts yet. Be the first.</p>}
      {posts.map((p) => (
        <article key={p.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4">
          <p className="text-xs font-semibold">
            {p.authorName} <span className="font-normal text-[#888888]">· {when(p.createdAt)}</span>
          </p>
          <p className="text-sm text-[#333333] mt-2 whitespace-pre-wrap break-words">{p.body}</p>
        </article>
      ))}
    </div>
  );
}

function Chat({ me }: { me: Person }) {
  const groups = useCommunityStore((s) => s.groups);
  const messages = useCommunityStore((s) => s.messages);
  const joined = useCommunityStore((s) => s.members);
  const ensureMember = useCommunityStore((s) => s.ensureMember);
  const sendMessage = useCommunityStore((s) => s.sendMessage);
  const createGroup = useCommunityStore((s) => s.createGroup);
  const [thread, setThread] = useState(LIVE_THREAD);
  const [text, setText] = useState('');
  const [creating, setCreating] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const myEmail = me.email.toLowerCase();

  const people = useMemo(() => {
    const map = new Map<string, string>([[SUPPORT_EMAIL, 'Hellobee Support']]);
    Object.entries(joined).forEach(([email, m]) => map.set(email, m.name));
    map.delete(myEmail);
    return Array.from(map, ([email, name]) => ({ email, name }));
  }, [joined, myEmail]);

  useEffect(() => ensureMember(me), [ensureMember, me.email, me.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const myGroups = groups.filter((g) => g.memberEmails.includes(myEmail));
  const current = messages.filter((m) => m.threadId === thread);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [current.length, thread]);

  const title =
    thread === LIVE_THREAD
      ? 'Live chat'
      : myGroups.find((g) => g.id === thread)?.name ?? people.find((p) => dmThreadId(myEmail, p.email) === thread)?.name ?? 'Chat';

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(thread, { email: myEmail, name: me.name }, text.trim());
    setText('');
  };

  const makeGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || picked.length === 0) {
      toast.error('Name the group and pick at least one member.');
      return;
    }
    setThread(createGroup(groupName.trim(), myEmail, picked));
    setGroupName('');
    setPicked([]);
    setCreating(false);
  };

  const row = (id: string, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setThread(id)}
      className={`w-full text-left px-3 py-2 text-sm rounded-xs truncate ${thread === id ? 'bg-[#111111] text-white' : 'hover:bg-[#F5F4F0]'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="grid md:grid-cols-[240px_1fr] bg-white border border-[#E5E5E5] rounded-xl overflow-hidden min-h-[420px]">
      <aside className="border-b md:border-b-0 md:border-r border-[#E5E5E5] p-3 space-y-1 max-h-[480px] overflow-y-auto">
        {row(LIVE_THREAD, 'Live chat')}
        <div className="flex items-center justify-between pt-3 pb-1 px-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#888888]">Groups</span>
          <button type="button" onClick={() => setCreating((v) => !v)} aria-label="New group" className="p-1 hover:bg-[#F5F4F0] rounded">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {creating && (
          <form onSubmit={makeGroup} className="space-y-2 p-2 border border-[#E5E5E5] rounded-xs">
            <input className={input} placeholder="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            <div className="max-h-28 overflow-y-auto space-y-1">
              {people.map((p) => (
                <label key={p.email} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={picked.includes(p.email)}
                    onChange={(e) => setPicked(e.target.checked ? [...picked, p.email] : picked.filter((x) => x !== p.email))}
                  />
                  {p.name}
                </label>
              ))}
            </div>
            <button type="submit" className="w-full bg-[#111111] text-white py-1.5 text-xs uppercase font-semibold rounded-xs">
              Create
            </button>
          </form>
        )}
        {myGroups.map((g) => row(g.id, g.name))}
        <div className="pt-3 pb-1 px-1 text-[10px] uppercase tracking-wider font-bold text-[#888888]">Direct messages</div>
        {people.map((p) => row(dmThreadId(myEmail, p.email), p.name))}
      </aside>

      <div className="flex flex-col">
        <header className="px-4 py-3 border-b border-[#E5E5E5] text-sm font-semibold">{title}</header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[360px]">
          {current.length === 0 && <p className="text-xs text-[#888888]">No messages yet. Say hello.</p>}
          {current.map((m) => {
            const mine = m.fromEmail.toLowerCase() === myEmail;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-[#888888] mb-0.5">
                  {mine ? 'You' : m.fromName} · {when(m.at)}
                </span>
                <p className={`text-sm px-3 py-2 rounded-2xl max-w-[80%] break-words whitespace-pre-wrap ${mine ? 'bg-[#111111] text-white' : 'bg-[#F0EFEA]'}`}>
                  {m.body}
                </p>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex gap-2 p-3 border-t border-[#E5E5E5]">
          <input className={input} placeholder="Message" maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit" aria-label="Send" className="bg-[#111111] text-white px-4 rounded-xs btn-tactile">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
