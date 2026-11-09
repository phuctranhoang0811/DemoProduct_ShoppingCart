'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  MapPin,
  Package,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AccountPage() {
  const router = useRouter();
  const currentUser = useCommerceStore((state) => state.currentUser);
  const logout = useCommerceStore((state) => state.logout);
  const updateProfile = useCommerceStore((state) => state.updateProfile);
  const addAddress = useCommerceStore((state) => state.addAddress);
  const deleteAddress = useCommerceStore((state) => state.deleteAddress);
  const setDefaultAddress = useCommerceStore((state) => state.setDefaultAddress);
  const orders = useCommerceStore((state) => state.orders);

  // Address form modal state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newWard, setNewWard] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newCity, setNewCity] = useState('');

  // Profile edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');

  // Filter orders for current user
  const userOrders = orders.filter(
    (o) =>
      currentUser &&
      (o.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
        o.customerName.toLowerCase() === currentUser.name.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-light">Account Access</h1>
        <p className="text-xs text-[#777777] mt-2">
          Please sign in to view your account details and order history.
        </p>
        <Link
          href="/login"
          className="inline-block mt-6 bg-[#111111] text-white px-8 py-3 text-xs uppercase font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: profileName, phone: profilePhone });
    setIsEditingProfile(false);
    toast.success('Profile details updated.');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity) {
      toast.error('Street and City are required.');
      return;
    }
    addAddress({
      fullName: newFullName || currentUser.name,
      phone: newPhone || currentUser.phone,
      street: newStreet,
      ward: newWard,
      district: newDistrict,
      city: newCity,
      isDefault: currentUser.addresses.length === 0,
    });
    setIsAddingAddress(false);
    setNewStreet('');
    setNewWard('');
    setNewDistrict('');
    setNewCity('');
    toast.success('New address added.');
  };

  const handleLogout = () => {
    logout();
    toast.info('Signed out of session.');
    router.push('/login');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-[#E5E5E5] gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#777777]">Customer Profile</span>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111] mt-1">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">{currentUser.email}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/orders"
            className="border border-[#111111] px-4 py-2 text-xs uppercase tracking-wider font-medium hover:bg-[#F5F4F0]"
          >
            All Orders ({userOrders.length})
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider text-[#B74747] hover:bg-[#F5F4F0]"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Card & Info */}
        <div className="space-y-6">
          <div className="bg-[#F5F4F0] p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                Profile Information
              </h2>
              <button
                onClick={() => {
                  setProfileName(currentUser.name);
                  setProfilePhone(currentUser.phone);
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="text-xs text-[#111111] underline"
              >
                {isEditingProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {!isEditingProfile ? (
              <div className="space-y-2 text-xs text-[#555555]">
                <p>
                  <span className="text-[#777777]">Name:</span> <strong className="text-[#111111]">{currentUser.name}</strong>
                </p>
                <p>
                  <span className="text-[#777777]">Email:</span> <strong className="text-[#111111]">{currentUser.email}</strong>
                </p>
                <p>
                  <span className="text-[#777777]">Phone:</span> <strong className="text-[#111111]">{currentUser.phone}</strong>
                </p>
                <p>
                  <span className="text-[#777777]">Registered:</span> {formatDate(currentUser.createdAt)}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-1.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-1.5 text-xs outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#111111] text-white py-2 text-xs uppercase font-semibold"
                >
                  Save Changes
                </button>
              </form>
            )}
          </div>

          {/* Quick links */}
          <div className="border border-[#E5E5E5] p-5 space-y-3 text-xs">
            <h3 className="uppercase tracking-wider font-semibold text-[#111111]">Wardrobe Shortcuts</h3>
            <div className="space-y-2">
              <Link href="/wishlist" className="block text-[#555555] hover:text-[#111111]">
                &rarr; View Saved Wishlist
              </Link>
              <Link href="/cart" className="block text-[#555555] hover:text-[#111111]">
                &rarr; Open Shopping Bag
              </Link>
              <Link href="/admin" className="block text-[#477A5A] font-medium hover:underline">
                &rarr; Open Store Admin Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Addresses & Orders (2 cols) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Saved Addresses */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Delivery Addresses ({currentUser.addresses.length})
              </h2>
              <button
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="text-xs uppercase tracking-wider font-medium text-[#111111] flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Address
              </button>
            </div>

            {/* Address Add form */}
            {isAddingAddress && (
              <form onSubmit={handleAddAddress} className="bg-[#F5F4F0] p-5 space-y-3 border border-[#E5E5E5]">
                <h3 className="text-xs font-semibold uppercase tracking-wider">New Shipping Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Recipient Name"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="bg-white border px-3 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="bg-white border px-3 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Street Address, Apt"
                    required
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="col-span-2 bg-white border px-3 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Ward"
                    value={newWard}
                    onChange={(e) => setNewWard(e.target.value)}
                    className="bg-white border px-3 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="District"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="bg-white border px-3 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="City / Province"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="col-span-2 bg-white border px-3 py-1.5 text-xs outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-[#111111] text-white px-5 py-2 text-xs uppercase font-semibold"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="border px-4 py-2 text-xs uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentUser.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 border text-xs space-y-2 relative ${
                    addr.isDefault ? 'border-[#111111] bg-[#FDFDFD]' : 'border-[#E5E5E5]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-[#111111]">{addr.fullName}</span>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-[#777777] hover:text-[#B74747]"
                      aria-label="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[#555555]">
                    {addr.street}<br />
                    {addr.ward ? `${addr.ward}, ` : ''}{addr.district ? `${addr.district}, ` : ''}{addr.city}
                  </p>
                  <p className="text-[#777777]">{addr.phone}</p>
                  <div className="pt-2 flex items-center justify-between">
                    {addr.isDefault ? (
                      <span className="text-[10px] uppercase font-bold text-[#477A5A] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Default Address
                      </span>
                    ) : (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[11px] underline text-[#777777] hover:text-[#111111]"
                      >
                        Set as default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] flex items-center gap-2">
                <Package className="w-4 h-4" /> Recent Orders
              </h2>
              <Link href="/orders" className="text-xs font-medium underline">
                View all orders &rarr;
              </Link>
            </div>

            {userOrders.length > 0 ? (
              <div className="divide-y divide-[#E5E5E5] border border-[#E5E5E5]">
                {userOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-mono font-medium text-[#111111]">{order.id}</p>
                      <p className="text-[11px] text-[#777777] mt-0.5">
                        {formatDate(order.createdAt)} &bull; {order.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#111111]">{formatPrice(order.total)}</span>
                      <p className="text-[11px] text-[#477A5A] font-medium mt-0.5">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#777777]">No orders placed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
