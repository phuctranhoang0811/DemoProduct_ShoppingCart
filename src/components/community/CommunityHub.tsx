'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  ImagePlus,
  Lock,
  MapPin,
  MessageCircle,
  Newspaper,
  Plus,
  Send,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LIVE_THREAD,
  dmThreadId,
  useCommunityStore,
  type MeetingKind,
  type Person,
  type PostCategory,
} from '@/stores/useCommunityStore';
import {
  emitAddMeeting,
  emitAddPost,
  emitAddToGroup,
  emitCreateGroup,
  emitEnsureMember,
  emitSendMessage,
  emitToggleRsvp,
} from '@/lib/community-socket';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { MembershipCard } from './MembershipCard';
import { useIsMember } from './useIsMember';
import { resizeImageFile } from './resizeImage';
import { Chat } from './ChatPanel';

type Tab = 'meetings' | 'posts' | 'chat';

const KINDS: MeetingKind[] = ['Meeting', 'Dining', 'Gathering'];
const POST_CATEGORIES: PostCategory[] = ['Dining & Drinks', 'Offline Meetup', 'Team Gathering', 'General'];
const input = 'w-full border border-[#E5E5E5] rounded-xs px-3 py-2 text-sm bg-white';

const when = (ms: number) =>
  new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export function CommunityHub() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('meetings');
  const sectionRef = useRef<HTMLElement>(null);
  const socketConnected = useCommunityStore((s) => s.socketConnected);
  const { user, isMember } = useIsMember();

  useEffect(() => {
    setMounted(true);

    const activateTabFromHash = (rawHash: string) => {
      const hash = rawHash.toLowerCase();
      if (hash === '#meetings') setTab('meetings');
      else if (hash === '#posts') setTab('posts');
      else if (hash === '#chat') setTab('chat');

      if (hash === '#meetings' || hash === '#posts' || hash === '#chat' || hash === '#community') {
        requestAnimationFrame(() => {
          sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    };

    const onHashChange = () => activateTabFromHash(window.location.hash);
    const onTabEvent = (e: Event) => {
      const target = (e as CustomEvent<Tab>).detail;
      if (target === 'meetings' || target === 'posts' || target === 'chat') {
        setTab(target);
        requestAnimationFrame(() => {
          sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    };

    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('hellobee:community-tab', onTabEvent);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('hellobee:community-tab', onTabEvent);
    };
  }, []);

  if (!mounted) return null;

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'meetings', label: 'Meetings', icon: CalendarCheck },
    { id: 'posts', label: 'Offline Posts', icon: Newspaper },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
  ];

  const canInteract = Boolean(user && isMember);
  const viewer: Person = user ? { email: user.email, name: user.name } : { email: '', name: 'Guest' };

  return (
    <section
      id="community"
      ref={sectionRef}
      className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 pb-20 scroll-mt-28"
    >
      <span id="meetings" className="scroll-mt-28" aria-hidden />
      <span id="posts" className="scroll-mt-28" aria-hidden />
      <span id="chat" className="scroll-mt-28" aria-hidden />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h2 className="text-xs uppercase tracking-wider font-bold">Meetings, Offline Posts &amp; Member Chat</h2>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
            socketConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-[#F5F4F0] text-[#666666] border-[#E5E5E5]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-[#999999]'}`} />
          {socketConnected ? 'Socket.IO Live' : 'Local Mode'}
        </span>
      </div>
      <p className="text-sm text-[#666666] mb-6">
        Organize offline meetings and dinners, share dining &amp; meetup photos, and chat with Hello Bee members.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-colors ${
              tab === id ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-[#111111]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {!canInteract && (
        <div className="mb-6">
          {user ? (
            <MembershipCard />
          ) : (
            <div className="border border-dashed border-[#CCCCCC] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#777777] shrink-0" />
                <p className="text-sm text-[#555555]">
                  Sign in as a Hello Bee member to RSVP, organize meetups, post photos, and open live chat.
                </p>
              </div>
              <Link
                href="/login?next=/meetings%23community"
                className="shrink-0 bg-[#111111] text-white px-6 py-2.5 text-xs uppercase font-semibold tracking-wider rounded-xs btn-tactile text-center"
              >
                Sign in to post, RSVP &amp; chat
              </Link>
            </div>
          )}
        </div>
      )}

      {tab === 'meetings' && <Meetings me={viewer} canInteract={canInteract} />}
      {tab === 'posts' && <Posts me={viewer} canInteract={canInteract} />}
      {tab === 'chat' &&
        (canInteract ? (
          <Chat me={viewer} />
        ) : (
          <div className="border border-[#E5E5E5] rounded-xl p-10 text-center space-y-3 bg-white">
            <Lock className="w-6 h-6 mx-auto text-[#777777]" />
            <p className="text-sm text-[#555555] max-w-md mx-auto">
              Member Chat is reserved for active Hello Bee members. Sign in or enter a membership code above to chat.
            </p>
          </div>
        ))}
    </section>
  );
}

function Meetings({ me, canInteract }: { me: Person; canInteract: boolean }) {
  const meetings = useCommunityStore((s) => s.meetings);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', kind: 'Meeting' as MeetingKind, date: '', time: '', location: '', description: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.location.trim()) {
      toast.error('Add a title, date and location.');
      return;
    }
    await emitAddMeeting({ ...form, hostName: me.name });
    setForm({ title: '', kind: 'Meeting', date: '', time: '', location: '', description: '' });
    setOpen(false);
    toast.success('Meeting posted.');
  };

  const sorted = [...meetings].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      {canInteract && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1.5 text-xs font-semibold underline">
          <Plus className="w-3.5 h-3.5" /> Organize a meeting, dinner or gathering
        </button>
      )}

      {canInteract && open && (
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
        {sorted.length === 0 && (
          <p className="text-sm text-[#777777] md:col-span-2 xl:col-span-3">
            No meetings yet. {canInteract ? 'Organize the first one above.' : 'Members can organize meetings, dinners and gatherings.'}
          </p>
        )}
        {sorted.map((m) => {
          const going = canInteract && m.attendees.includes(me.email);
          return (
            <article key={m.id} className="bg-white border border-[#E5E5E5] rounded-xl p-5 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#B8860B]">{m.kind}</span>
              <h3 className="font-semibold">{m.title}</h3>
              <p className="text-xs text-[#666666]">{m.description}</p>
              <p className="text-xs text-[#555555]">
                {m.date} {m.time && `· ${m.time}`} · {m.location}
              </p>
              <p className="text-[11px] text-[#888888]">Hosted by {m.hostName} · {m.attendees.length} going</p>
              {canInteract ? (
                <button
                  type="button"
                  onClick={() => emitToggleRsvp(m.id, me.email)}
                  className={`mt-auto text-xs font-semibold uppercase tracking-wider py-2 rounded-xs border btn-tactile ${
                    going ? 'bg-emerald-600 text-white border-emerald-600' : 'border-[#111111] text-[#111111]'
                  }`}
                >
                  {going ? 'Going' : 'Join'}
                </button>
              ) : (
                <Link
                  href="/login?next=/meetings%23meetings"
                  className="mt-auto text-center text-xs font-semibold uppercase tracking-wider py-2 rounded-xs border border-[#E5E5E5] text-[#666666] hover:border-[#111111] hover:text-[#111111]"
                >
                  Sign in to Join
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Posts({ me, canInteract }: { me: Person; canInteract: boolean }) {
  const posts = useCommunityStore((s) => s.posts);
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<PostCategory>('Dining & Drinks');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImageFile(file);
      setImageUrl(resized);
    } catch {
      toast.error('Could not process that image.');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    await emitAddPost(me, body.trim(), {
      category,
      location: location.trim() || undefined,
      imageUrl,
    });
    setBody('');
    setLocation('');
    setImageUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Post shared with the community.');
  };

  return (
    <div className="max-w-2xl space-y-4">
      {canInteract && (
        <form onSubmit={submit} className="bg-white border border-[#E5E5E5] rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {POST_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                  category === cat
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-[#FAF9F5] text-[#555555] border-[#E5E5E5] hover:border-[#111111]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            className={input}
            placeholder="Location (e.g. Riverside Bistro, District 1)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <textarea
            rows={3}
            maxLength={1000}
            className={input}
            placeholder="Share an offline meetup, dinner & drinks story, or photo with members..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          {imageUrl && (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Upload preview" className="max-h-48 rounded-lg border border-[#E5E5E5] object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImageUrl(undefined);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                aria-label="Remove photo"
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#555555] hover:text-[#111111] cursor-pointer">
              <ImagePlus className="w-4 h-4" />
              <span>Add Photo</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={!body.trim()}
              className="bg-[#111111] text-white px-5 py-2 text-xs uppercase font-semibold tracking-wider rounded-xs disabled:opacity-40 btn-tactile"
            >
              Post
            </button>
          </div>
        </form>
      )}

      {posts.length === 0 && <p className="text-sm text-[#777777]">No posts yet. Be the first.</p>}
      {posts.map((p) => (
        <article key={p.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold">
              {p.authorName} <span className="font-normal text-[#888888]">· {when(p.createdAt)}</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {p.category && (
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#FFF8E7] text-[#8A5A0B] border border-[#E0A82E]/40">
                  {p.category}
                </span>
              )}
              {p.location && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#666666] bg-[#F5F4F0] px-2 py-0.5 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {p.location}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-[#333333] whitespace-pre-wrap break-words">{p.body}</p>
          {p.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageUrl} alt="Community meetup" className="w-full max-h-80 object-cover rounded-lg border border-[#EEEEEE]" />
          )}
        </article>
      ))}
    </div>
  );
}
