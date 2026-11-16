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
  Edit2,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Award,
  Check,
  X,
  CreditCard,
  Wifi,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { Address } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AccountPage() {
  const router = useRouter();
  const currentUser = useCommerceStore((state) => state.currentUser);
  const logout = useCommerceStore((state) => state.logout);
  const updateProfile = useCommerceStore((state) => state.updateProfile);
  const addAddress = useCommerceStore((state) => state.addAddress);
  const updateAddress = useCommerceStore((state) => state.updateAddress);
  const deleteAddress = useCommerceStore((state) => state.deleteAddress);
  const setDefaultAddress = useCommerceStore((state) => state.setDefaultAddress);
  const orders = useCommerceStore((state) => state.orders);

  // Address form modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    postalCode: '',
    country: 'United States',
    deliveryNotes: '',
    isDefault: false,
  });

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    gender: currentUser?.gender || 'prefer_not_to_say',
    birthday: currentUser?.birthday || '',
    company: currentUser?.company || '',
  });

  // Active tab in account
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');

  // Filter orders for current user
  const userOrders = orders.filter(
    (o) =>
      currentUser &&
      (o.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
        o.customerName.toLowerCase() === currentUser.name.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-16 h-16 bg-[#F5F4F0] rounded-full flex items-center justify-center mx-auto text-[#111111] border border-[#E5E5E5]">
          <User className="w-8 h-8 stroke-[1.2]" />
        </div>
        <h1 className="text-2xl font-light text-[#111111]">Account Sign In Required</h1>
        <p className="text-xs text-[#777777] max-w-sm mx-auto">
          Please log in to manage your personal details, shipping destinations, and Enagic order history.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 bg-[#111111] text-white px-8 py-3 text-xs uppercase font-semibold tracking-wider hover:bg-[#333333] transition-colors rounded-xs shadow-xs"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const handleStartEditingProfile = () => {
    setProfileForm({
      name: currentUser.name,
      phone: currentUser.phone || '',
      gender: currentUser.gender || 'prefer_not_to_say',
      birthday: currentUser.birthday || '',
      company: currentUser.company || '',
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Full name cannot be empty.');
      return;
    }
    updateProfile({
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      gender: profileForm.gender as any,
      birthday: profileForm.birthday,
      company: profileForm.company.trim(),
    });
    setIsEditingProfile(false);
    toast.success('Personal profile information updated successfully.');
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: currentUser.name,
      phone: currentUser.phone || '',
      street: '',
      ward: '',
      district: '',
      city: 'New York',
      postalCode: '10001',
      country: 'United States',
      deliveryNotes: '',
      isDefault: currentUser.addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      ward: addr.ward || '',
      district: addr.district || '',
      city: addr.city,
      postalCode: addr.postalCode || '',
      country: addr.country || 'Vietnam',
      deliveryNotes: addr.deliveryNotes || '',
      isDefault: !!addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.street.trim() || !addressForm.city.trim()) {
      toast.error('Street Address and City are required fields.');
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, {
        fullName: addressForm.fullName || currentUser.name,
        phone: addressForm.phone || currentUser.phone,
        street: addressForm.street.trim(),
        ward: addressForm.ward.trim(),
        district: addressForm.district.trim(),
        city: addressForm.city.trim(),
        postalCode: addressForm.postalCode.trim(),
        country: addressForm.country.trim(),
        deliveryNotes: addressForm.deliveryNotes.trim(),
        isDefault: addressForm.isDefault,
      });
      if (addressForm.isDefault) {
        setDefaultAddress(editingAddressId);
      }
      toast.success('Shipping address updated successfully.');
    } else {
      addAddress({
        fullName: addressForm.fullName || currentUser.name,
        phone: addressForm.phone || currentUser.phone,
        street: addressForm.street.trim(),
        ward: addressForm.ward.trim(),
        district: addressForm.district.trim(),
        city: addressForm.city.trim(),
        postalCode: addressForm.postalCode.trim(),
        country: addressForm.country.trim(),
        deliveryNotes: addressForm.deliveryNotes.trim(),
        isDefault: addressForm.isDefault || currentUser.addresses.length === 0,
      });
      toast.success('New shipping address saved.');
    }
    setIsAddressModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.info('Signed out of session.');
    router.push('/login');
  };

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Compute 1A–5A rank from how many orders used this customer's referral code
  const referredOrderCount = currentUser.referralCode
    ? orders.filter(
        (o) =>
          o.referralCode &&
          o.referralCode.toUpperCase() === currentUser.referralCode!.toUpperCase() &&
          !o.customerEmail.toLowerCase().includes(currentUser.email.toLowerCase())
      ).length
    : 0;

  const getRank = (count: number): string | null => {
    if (count >= 625) return '5A';
    if (count >= 125) return '4A';
    if (count >= 25) return '3A';
    if (count >= 5) return '2A';
    if (count >= 1) return '1A';
    return null;
  };

  const customerRank = getRank(referredOrderCount);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Account Hero Card */}
      <div className="bg-[#FAF9F5] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#111111] text-white flex items-center justify-center text-xl sm:text-2xl font-light tracking-wider flex-shrink-0 shadow-sm border-2 border-white">
              {initials || 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-[#111111]">
                  {currentUser.name}
                </h1>
                {customerRank ? (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-[#EBF3EA] text-[#2D5A27] px-2.5 py-0.5 rounded-full border border-[#2D5A27]/20 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Rank {customerRank}
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-[#EAE8E1] text-[#555555] px-2.5 py-0.5 rounded-full border border-[#CCCCCC]/40 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Member
                  </span>
                )}
                <span className="text-[10px] uppercase tracking-wider font-mono bg-[#EAE8E1] text-[#555555] px-2 py-0.5 rounded-xs">
                  Role: {currentUser.role?.toUpperCase() || 'CUSTOMER'}
                </span>
              </div>
              <p className="text-xs text-[#666666] flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#888888]" />
                  {currentUser.email}
                </span>
                {currentUser.phone && (
                  <span className="hidden sm:flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#888888]" />
                    {currentUser.phone}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-4 md:pt-0 border-t md:border-t-0 border-[#EAE8E1]">
            {currentUser.role === 'admin' && (
              <Link
                href="/admin"
                className="bg-[#111111] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#333333] transition-colors"
              >
                Go to Admin Portal
              </Link>
            )}
            {currentUser.role === 'employee' && (
              <Link
                href="/employee"
                className="bg-[#2D5A27] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#23471f] transition-colors"
              >
                Go to Employee Portal
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider text-[#B74747] border border-[#B74747]/30 hover:bg-[#FBEAEA] transition-colors rounded-xs"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Account Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#EAE8E1] text-xs">
          <div className="bg-white p-3 rounded-lg border border-[#EBEBEB]">
            <span className="text-[11px] text-[#777777] block">Account Status</span>
            <span className="font-semibold text-[#2D5A27] uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Online
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-[#EBEBEB]">
            <span className="text-[11px] text-[#777777] block">Total Orders</span>
            <span className="font-semibold text-[#111111] text-sm mt-0.5">
              {userOrders.length} Completed
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-[#EBEBEB]">
            <span className="text-[11px] text-[#777777] block">Saved Addresses</span>
            <span className="font-semibold text-[#111111] text-sm mt-0.5">
              {currentUser.addresses.length} Locations
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-[#EBEBEB]">
            <span className="text-[11px] text-[#777777] block">Member Since</span>
            <span className="font-semibold text-[#111111] text-sm mt-0.5">
              {formatDate(currentUser.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E5E5E5] mb-8 gap-8 text-xs uppercase tracking-wider font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <User className="w-4 h-4" /> Personal Information
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <MapPin className="w-4 h-4" /> Shipping Addresses ({currentUser.addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Package className="w-4 h-4" /> Orders & History ({userOrders.length})
        </button>
      </div>

      {/* TAB 1: Personal Information */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E5E5] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0]">
              <div>
                <h2 className="text-sm uppercase tracking-wider font-bold text-[#111111]">
                  Personal Profile Details
                </h2>
                <p className="text-xs text-[#777777] mt-0.5">
                  Manage your personal identity, contact credentials, and preferences.
                </p>
              </div>
              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={handleStartEditingProfile}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#111111] text-[11px] uppercase tracking-wider font-semibold rounded-xs hover:bg-[#F5F4F0] transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Edit Profile
                </button>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#888888] font-medium block">
                    Full Legal Name
                  </span>
                  <p className="text-sm font-semibold text-[#111111]">{currentUser.name}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#888888] font-medium block">
                    Primary Email Address
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#111111]">{currentUser.email}</p>
                    <span className="text-[10px] bg-[#EBF3EA] text-[#2D5A27] px-1.5 py-0.5 rounded font-bold">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#888888] font-medium block">
                    Contact Phone Number
                  </span>
                  <p className="text-sm font-semibold text-[#111111]">
                    {currentUser.phone || 'Not provided'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#888888] font-medium block">
                    Gender
                  </span>
                  <p className="text-sm font-semibold text-[#111111] capitalize">
                    {currentUser.gender ? currentUser.gender.replace('_', ' ') : 'Not specified'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#888888] font-medium block">
                    Date of Birth
                  </span>
                  <p className="text-sm font-semibold text-[#111111]">
                    {currentUser.birthday || 'Not specified'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#888888] font-medium block">
                    Organization / Company
                  </span>
                  <p className="text-sm font-semibold text-[#111111]">
                    {currentUser.company || 'Private Residence'}
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-[#F0F0F0]">
                  <span className="text-[11px] uppercase tracking-wider text-[#888888] font-medium block">
                    Assigned Enagic® Consultant / Specialist
                  </span>
                  {currentUser.referralCode ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F5] border border-[#E5E5E5] rounded-xs text-xs text-[#2D5A27] font-medium">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {currentUser.sponsorName || 'Hydration Specialist'} (<code>{currentUser.referralCode}</code>) &bull; Auto-credited on purchases
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-[#777777]">
                      Direct Customer Account (No Consultant Linked)
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555555] block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full border border-[#D5D5D5] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#111111] transition-colors bg-white text-xs"
                      placeholder="e.g. Elena Rostova"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555555] block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full border border-[#D5D5D5] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#111111] transition-colors bg-white text-xs"
                      placeholder="e.g. +1 (555) 349-8201"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555555] block mb-1">
                      Gender
                    </label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value as any })}
                      className="w-full border border-[#D5D5D5] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#111111] transition-colors bg-white text-xs"
                    >
                      <option value="prefer_not_to_say">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555555] block mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileForm.birthday}
                      onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                      className="w-full border border-[#D5D5D5] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#111111] transition-colors bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555555] block mb-1">
                      Company / Organization (Optional)
                    </label>
                    <input
                      type="text"
                      value={profileForm.company}
                      onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                      className="w-full border border-[#D5D5D5] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#111111] transition-colors bg-white text-xs"
                      placeholder="e.g. Design Studio Inc."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#F0F0F0]">
                  <button
                    type="submit"
                    className="bg-[#111111] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#333333] transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="border border-[#E5E5E5] px-5 py-2.5 text-xs uppercase tracking-wider text-[#555555] hover:bg-[#F5F4F0] rounded-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Side card: Membership & Security */}
          <div className="space-y-6">
            <div className="bg-[#FAF9F5] p-6 rounded-lg border border-[#E5E5E5] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EAE8E1]">
                <ShieldCheck className="w-4 h-4 text-[#477A5A]" />
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#111111]">
                  Official Warranty & Care
                </h3>
              </div>
              <p className="text-xs text-[#666666] leading-relaxed">
                All Enagic® Kangen Water® medical devices registered under this account are backed by
                our 3 to 5-year international manufacturer guarantee and free biannual deep-clean checkups.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#111111]">
                Need technician dispatch? Call toll-free:{' '}
                <span className="text-[#2D5A27]">1-800-ENAGIC</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] space-y-3 text-xs">
              <h3 className="uppercase tracking-wider font-bold text-[#111111]">Account Security</h3>
              <p className="text-[#666666]">
                Two-factor authentication is active on this session. Password last verified recently.
              </p>
              <button
                type="button"
                onClick={() => toast.success('Password update instructions sent to your registered email.')}
                className="w-full text-center border border-[#111111] py-2 text-xs uppercase tracking-wider font-medium hover:bg-[#F5F4F0] transition-colors rounded-xs"
              >
                Request Password Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Shipping Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E5E5] gap-3">
            <div>
              <h2 className="text-sm uppercase tracking-wider font-bold text-[#111111]">
                Delivery & Installation Addresses
              </h2>
              <p className="text-xs text-[#777777] mt-0.5">
                Manage destination addresses where Enagic certified technicians install your devices.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="inline-flex items-center gap-1.5 bg-[#111111] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#333333] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Address
            </button>
          </div>

          {currentUser.addresses.length === 0 ? (
            <div className="bg-[#FAF9F5] p-10 text-center rounded-lg border border-[#E5E5E5] space-y-3">
              <MapPin className="w-8 h-8 text-[#888888] mx-auto" />
              <h3 className="text-sm font-semibold text-[#111111]">No Saved Addresses</h3>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">
                Add your primary residential or business shipping address for express checkout and in-home plumbing surveys.
              </p>
              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="inline-block mt-2 bg-[#111111] text-white px-5 py-2 text-xs uppercase font-semibold rounded-xs"
              >
                Add Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentUser.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-lg border bg-white flex flex-col justify-between transition-all ${
                    addr.isDefault
                      ? 'border-[#111111] shadow-sm ring-1 ring-[#111111]/10'
                      : 'border-[#E5E5E5] hover:border-[#CCCCCC]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-sm text-[#111111] block">
                          {addr.fullName}
                        </span>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#2D5A27] bg-[#EBF3EA] px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Default Address
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditAddress(addr)}
                          className="p-1.5 text-[#777777] hover:text-[#111111] hover:bg-[#F5F4F0] rounded-xs transition-colors"
                          title="Edit Address"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            deleteAddress(addr.id);
                            toast.info('Address removed.');
                          }}
                          className="p-1.5 text-[#777777] hover:text-[#B74747] hover:bg-[#FBEAEA] rounded-xs transition-colors"
                          title="Delete Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-[#555555] space-y-1 pt-1 leading-relaxed">
                      <p className="text-[#111111] font-medium">{addr.street}</p>
                      <p>
                        {addr.ward ? `${addr.ward}, ` : ''}
                        {addr.district ? `${addr.district}, ` : ''}
                        {addr.city} {addr.postalCode ? `(${addr.postalCode})` : ''}
                      </p>
                      <p className="text-[#777777]">{addr.country || 'Vietnam'}</p>
                      <p className="text-[#111111] font-mono text-[11px] pt-1">
                        Phone: {addr.phone}
                      </p>
                      {addr.deliveryNotes && (
                        <p className="text-[11px] text-[#8C5E1E] bg-[#FAF1E4] px-2 py-1 rounded-xs mt-2">
                          Note: {addr.deliveryNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F0F0F0] flex items-center justify-between text-xs">
                    {!addr.isDefault ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDefaultAddress(addr.id);
                          toast.success('Set as default delivery destination.');
                        }}
                        className="text-[11px] font-semibold text-[#111111] underline hover:text-[#477A5A]"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#777777]">Primary shipping destination</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEditAddress(addr)}
                      className="text-[11px] font-medium text-[#777777] hover:text-[#111111]"
                    >
                      Modify details &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Orders & History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <h2 className="text-sm uppercase tracking-wider font-bold text-[#111111]">
              Order History & Serial Certifications ({userOrders.length})
            </h2>
            <Link href="/shop" className="text-xs font-semibold text-[#111111] underline">
              Browse More Equipment &rarr;
            </Link>
          </div>

          {userOrders.length === 0 ? (
            <div className="bg-[#FAF9F5] p-10 text-center rounded-lg border border-[#E5E5E5] space-y-3">
              <Package className="w-8 h-8 text-[#888888] mx-auto" />
              <h3 className="text-sm font-semibold text-[#111111]">No Orders Placed Yet</h3>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">
                Once you order an Enagic ionizer or replacement filter, your invoice and delivery status will appear here.
              </p>
              <Link
                href="/shop"
                className="inline-block mt-2 bg-[#111111] text-white px-5 py-2 text-xs uppercase font-semibold rounded-xs"
              >
                Explore Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-[#E5E5E5] p-5 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F0F0]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#111111]">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[10px] uppercase font-bold bg-[#EBF3EA] text-[#2D5A27] px-2 py-0.5 rounded-full">
                          {order.status}
                        </span>
                        <span className="text-[10px] uppercase font-bold bg-[#EAE8E1] text-[#555] px-2 py-0.5 rounded-full">
                          Payment: {order.paymentStatus} ({order.paymentMethod.toUpperCase()})
                        </span>
                      </div>
                      <p className="text-[11px] text-[#777777] mt-0.5">
                        Placed on {formatDate(order.createdAt)} &bull; {order.items.length} items
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-base font-bold text-[#111111]">
                        {formatPrice(order.total)}
                      </span>
                      <p className="text-[10px] text-[#477A5A] font-semibold">
                        Installation Guaranteed
                      </p>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="divide-y divide-[#F5F5F5]">
                    {order.items.map((item, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-[#111111]">{item.productName}</span>
                          <span className="text-[#888888] font-mono text-[11px]">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold text-[#111111]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#F0F0F0] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#777777] gap-2">
                    <p>
                      <strong>Delivery to:</strong> {order.shippingAddress.street},{' '}
                      {order.shippingAddress.city}
                    </p>
                    {order.referralCode && (
                      <span className="font-mono text-[11px] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E5E5E5] text-[#111111]">
                        Sponsor Ref: {order.referralCode}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Address Edit / Add Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-4 right-4 text-[#888888] hover:text-[#111111] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#111111] mb-1">
              {editingAddressId ? 'Edit Shipping Address' : 'Add New Shipping Address'}
            </h3>
            <p className="text-xs text-[#777777] mb-5">
              Enter precise delivery and installation location for Enagic certified technicians.
            </p>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full border border-[#D5D5D5] px-3 py-2 rounded-xs outline-none focus:border-[#111111]"
                    placeholder="e.g. Elena Rostova"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full border border-[#D5D5D5] px-3 py-2 rounded-xs outline-none focus:border-[#111111]"
                    placeholder="+1 (555) 349-8201"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                    Street Address, Building & Suite *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full border border-[#D5D5D5] px-3 py-2 rounded-xs outline-none focus:border-[#111111]"
                    placeholder="e.g. 72 Le Loi Boulevard, Suite 402"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                    Ward / Sub-district
                  </label>
                  <input
                    type="text"
                    value={addressForm.ward}
                    onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                    className="w-full border border-[#D5D5D5] px-3 py-2 rounded-xs outline-none focus:border-[#111111]"
                    placeholder="e.g. Ben Nghe Ward"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                    District / County
                  </label>
                  <input
                    type="text"
                    value={addressForm.district}
                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                    className="w-full border border-[#D5D5D5] px-3 py-2 rounded-xs outline-none focus:border-[#111111]"
                    placeholder="e.g. District 1"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                    City / Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full border border-[#D5D5D5] px-3 py-2 rounded-xs outline-none focus:border-[#111111]"
                    placeholder="e.g. Ho Chi Minh City"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                    Postal / ZIP Code
                  </label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full border border-[#D5D5D5] px-3 py-2 rounded-xs outline-none focus:border-[#111111]"
                    placeholder="700000"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full border border-[#D5D5D5] px-3 py-2 rounded-xs outline-none focus:border-[#111111]"
                    placeholder="Vietnam / United States"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                    Delivery & Installation Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={addressForm.deliveryNotes}
                    onChange={(e) => setAddressForm({ ...addressForm, deliveryNotes: e.target.value })}
                    className="w-full border border-[#D5D5D5] px-3 py-2 rounded-xs outline-none focus:border-[#111111]"
                    placeholder="e.g. Front desk security check required; under-sink direct valve."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="accent-[#111111] w-4 h-4"
                />
                <label htmlFor="defaultAddressCheckbox" className="text-xs text-[#333333] cursor-pointer">
                  Set as my default shipping & installation address
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F0F0F0]">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E5E5] text-xs uppercase tracking-wider rounded-xs text-[#555] hover:bg-[#F5F4F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#111111] text-white text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#333333] transition-colors"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
