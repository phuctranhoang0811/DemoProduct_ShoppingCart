'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Plus, Trash2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { createEvent, removeEvent, syncEvents } from '@/lib/events-client';
import { useEventsStore } from '@/stores/useEventsStore';
import { MemberEvent } from '@/data/events';

const CATEGORIES: MemberEvent['category'][] = ['Community', 'Training', 'Wellness', 'Leadership'];
const DEFAULT_IMAGE = '/images/events/campfire.webp';
const MAX_IMAGE_BYTES = 800 * 1024;

const emptyForm = {
  title: '',
  category: 'Community' as MemberEvent['category'],
  date: '',
  time: '',
  location: '',
  description: '',
  meaning: '',
  image: DEFAULT_IMAGE,
};

const inputClass =
  'w-full border border-[#E5E5E5] rounded-xs px-3 py-2 text-sm focus:outline-none focus:border-[#111111]';

export default function AdminEventsPage() {
  const events = useEventsStore((s) => s.events);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void syncEvents();
  }, []);

  const set = (key: keyof typeof emptyForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleImage = (file?: File) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image must be under 800 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set('image', String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.location.trim()) {
      toast.error('Title, date, and location are required.');
      return;
    }
    setSubmitting(true);
    const result = await createEvent({ ...form, title: form.title.trim(), location: form.location.trim() });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.message || 'Could not publish event.');
      return;
    }
    setForm(emptyForm);
    toast.success('Event published to the Events page.');
  };

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#E5E5E5]">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">Events</h1>
        <p className="text-sm text-[#666666] mt-1">Create posts for member events. They appear instantly on the public Events page.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E5E5E5] rounded-lg p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#555555]">Title</span>
          <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Hellobee Campfire Night" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#555555]">Category</span>
          <select className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#555555]">Location</span>
          <input className={inputClass} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, State" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#555555]">Date</span>
          <input type="date" className={inputClass} value={form.date} onChange={(e) => set('date', e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#555555]">Time</span>
          <input className={inputClass} value={form.time} onChange={(e) => set('time', e.target.value)} placeholder="6:30 PM" />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#555555]">Description</span>
          <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#555555]">Meaning of the event</span>
          <textarea rows={2} className={inputClass} value={form.meaning} onChange={(e) => set('meaning', e.target.value)} />
        </label>
        <div className="space-y-2 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#555555]">Image</span>
          <div className="flex flex-wrap items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image} alt="Event preview" className="w-28 h-20 object-cover rounded-xs border border-[#E5E5E5]" />
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E5E5] rounded-xs text-xs font-semibold cursor-pointer hover:bg-[#F5F4F0]">
              <ImagePlus className="w-4 h-4" /> Upload image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0])} />
            </label>
            <input className={`${inputClass} flex-1 min-w-[200px]`} value={form.image.startsWith('data:') ? '' : form.image} onChange={(e) => set('image', e.target.value || DEFAULT_IMAGE)} placeholder="or paste an image URL" />
          </div>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-[#111111] text-white px-5 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#333333] btn-tactile disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {submitting ? 'Publishing...' : 'Publish event'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider font-bold text-[#111111]">Published events ({events.length})</h2>
        {events.map((e) => (
          <div key={e.id} className="bg-white border border-[#E5E5E5] rounded-lg p-4 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.image} alt="" className="w-20 h-14 object-cover rounded-xs shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#111111] truncate">{e.title}</p>
              <p className="text-xs text-[#777777] flex items-center gap-1.5 mt-0.5">
                <CalendarDays className="w-3.5 h-3.5" /> {e.date} · {e.category} · {e.location}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const result = await removeEvent(e.id);
                if (!result.ok) {
                  toast.error(result.message || 'Could not delete event.');
                  return;
                }
                toast.success('Event deleted.');
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              aria-label={`Delete ${e.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
