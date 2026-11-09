'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export function StoreFooter() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Thank you for subscribing to COS editorial bulletins.');
    setEmail('');
  };

  return (
    <footer className="bg-[#111111] text-white pt-16 pb-12 mt-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2A2A2A]">
          {/* Brand Vision */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-xl font-bold tracking-[0.25em] uppercase">COS</span>
            <p className="text-sm text-[#A0A0A0] max-w-sm leading-relaxed">
              Design for the understated life. Rooted in Scandinavian minimalism and architectural
              clarity, creating enduring garments crafted from consciously chosen textiles.
            </p>
            <div className="pt-2 text-xs text-[#808080]">
              <p>Demo prototype for demonstration and testing purposes.</p>
              <p>All data stored locally in your browser.</p>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#FFFFFF] font-semibold">Collections</p>
            <ul className="space-y-2 text-xs text-[#A0A0A0]">
              <li><Link href="/shop?filter=new" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop?gender=women" className="hover:text-white transition-colors">Women</Link></li>
              <li><Link href="/shop?gender=men" className="hover:text-white transition-colors">Men</Link></li>
              <li><Link href="/shop?category=cat-outerwear" className="hover:text-white transition-colors">Outerwear</Link></li>
              <li><Link href="/shop?filter=sale" className="hover:text-[#B9A58B] transition-colors">Seasonal Archive (Sale)</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#FFFFFF] font-semibold">Customer Care</p>
            <ul className="space-y-2 text-xs text-[#A0A0A0]">
              <li><Link href="/account" className="hover:text-white transition-colors">Account & Orders</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Shopping Bag</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">Saved Items</Link></li>
              <li><Link href="/admin" className="hover:text-[#B9A58B] transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#FFFFFF] font-semibold">Editorial Bulletin</p>
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              Receive seasonal lookbooks, cultural conversations, and preview access.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-[#1E1E1E] text-white px-3 py-2 text-xs border border-[#333333] focus:border-white outline-none placeholder-[#777777]"
              />
              <button
                type="submit"
                className="w-full bg-white text-[#111111] py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F4F0] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#777777] gap-4">
          <p>&copy; {new Date().getFullYear()} COS MINIMAL. Frontend Prototype inspired by COS.</p>
          <div className="flex space-x-6 text-xs">
            <Link href="/admin/settings" className="hover:text-white transition-colors">Store Settings</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Management Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
