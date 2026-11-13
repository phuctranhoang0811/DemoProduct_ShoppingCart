'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle,
  ArrowRight,
  PhoneCall,
  Tag,
  Award,
  Sparkles,
  UserCheck,
  AlertCircle,
  Lock,
  ExternalLink,
  Zap,
  Check,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { PaymentMethod } from '@/types';
import { HellobeeMember } from '@/types/hellobee';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cart = useCommerceStore((state) => state.cart);
  const currentUser = useCommerceStore((state) => state.currentUser);
  const hellobeeMembers = useCommerceStore((state) => state.hellobeeMembers);
  const createOrder = useCommerceStore((state) => state.createOrder);
  const clearCart = useCommerceStore((state) => state.clearCart);
  const currency = useCommerceStore((state) => state.currency);

  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [referralCode, setReferralCode] = useState(searchParams?.get('ref') || '');

  useEffect(() => {
    const refFromUrl = searchParams?.get('ref');
    if (refFromUrl) {
      setReferralCode(refFromUrl.toUpperCase());
    }
  }, [searchParams]);

  const defaultAddr = currentUser?.addresses.find((a) => a.isDefault) || currentUser?.addresses[0];
  const [street, setStreet] = useState(defaultAddr?.street || '');
  const [ward, setWard] = useState(defaultAddr?.ward || '');
  const [district, setDistrict] = useState(defaultAddr?.district || '');
  const [city, setCity] = useState(defaultAddr?.city || 'Ho Chi Minh City');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || '700000');
  const [country, setCountry] = useState(defaultAddr?.country || 'Vietnam');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlacedId, setOrderPlacedId] = useState<string | null>(null);
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<string | null>(null);
  const [placedReferral, setPlacedReferral] = useState<HellobeeMember | null>(null);

  // Stripe form state
  const [stripeCardNumber, setStripeCardNumber] = useState('');
  const [stripeExp, setStripeExp] = useState('');
  const [stripeCvc, setStripeCvc] = useState('');
  const [stripeCardName, setStripeCardName] = useState(currentUser?.name || '');
  const [stripeZip, setStripeZip] = useState(defaultAddr?.postalCode || '90210');
  const [saveCardWithStripe, setSaveCardWithStripe] = useState(true);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = subtotal;

  // Real-time lookup of employee/owner sponsor
  const verifiedBeneficiary = useMemo(() => {
    if (!referralCode.trim()) return null;
    const clean = referralCode.trim().toUpperCase();
    return hellobeeMembers.find((m) => m.referralCode.toUpperCase() === clean) || null;
  }, [referralCode, hellobeeMembers]);

  const directCommissionAmount = verifiedBeneficiary ? Math.round(grandTotal * 0.1) : 0;

  // Detect card brand
  const detectedCardBrand = useMemo(() => {
    const clean = stripeCardNumber.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    if (/^6(?:011|5)/.test(clean)) return 'Discover';
    return null;
  }, [stripeCardNumber]);

  const fillStripeTestCard = () => {
    setStripeCardNumber('4242 4242 4242 4242');
    setStripeExp('12/28');
    setStripeCvc('123');
    setStripeCardName(fullName || 'Elena Rostova');
    setStripeZip('90210');
    toast.success('Stripe test card filled: 4242 4242 4242 4242');
  };

  const handleFormatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setStripeCardNumber(parts.join(' '));
  };

  const handleFormatExp = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setStripeExp(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setStripeExp(raw);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim()) {
      toast.error('Please complete all required customer and address fields (*)');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your shopping cart is currently empty.');
      return;
    }

    if (paymentMethod === 'stripe') {
      const cleanCard = stripeCardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15) {
        toast.error('Please enter a valid credit card number or use the 1-Click Test Card button.');
        return;
      }
      if (!stripeExp || stripeExp.length < 4) {
        toast.error('Please enter a valid card expiration date (MM/YY).');
        return;
      }
      if (!stripeCvc || stripeCvc.length < 3) {
        toast.error('Please enter the 3-digit CVC security code.');
        return;
      }
    }

    setIsSubmitting(true);

    const simulationDelay = paymentMethod === 'stripe' ? 1200 : 700;

    setTimeout(() => {
      const generatedStripeId =
        paymentMethod === 'stripe'
          ? `pi_${Math.random().toString(36).substring(2, 10)}_secret_${Math.random().toString(36).substring(2, 8)}`
          : undefined;

      const order = createOrder({
        customerName: fullName,
        customerEmail: email || 'customer@enagic.com',
        customerPhone: phone,
        shippingAddress: {
          street,
          ward,
          district,
          city,
        },
        deliveryMethod: 'Enagic Certified Technician Delivery & In-Home Installation',
        paymentMethod,
        paymentStatus: paymentMethod === 'stripe' || paymentMethod === 'online_simulation' ? 'Paid' : 'Unpaid',
        status: 'Pending',
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          slug: item.slug,
          image: item.image,
          price: item.price,
          colorName: item.color.name,
          size: item.size,
          quantity: item.quantity,
        })),
        subtotal,
        discountAmount: 0,
        shippingFee: 0,
        total: grandTotal,
        referralCode: referralCode.trim() || undefined,
        notes: notes.trim()
          ? `${notes} [Payment: ${paymentMethod.toUpperCase()}${generatedStripeId ? ` - Stripe Ref: ${generatedStripeId}` : ''}]`
          : `[Payment: ${paymentMethod.toUpperCase()}${generatedStripeId ? ` - Stripe Ref: ${generatedStripeId}` : ''}]`,
      });

      if (verifiedBeneficiary) {
        setPlacedReferral(verifiedBeneficiary);
      }
      if (generatedStripeId) {
        setStripePaymentIntentId(generatedStripeId);
      }
      clearCart();
      setIsSubmitting(false);
      setOrderPlacedId(order.id);
      toast.success(
        paymentMethod === 'stripe'
          ? 'Payment authorized by Stripe! Order placed successfully.'
          : 'Order placed successfully!'
      );
    }, simulationDelay);
  };

  if (orderPlacedId) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-[#EBF3EA] rounded-full flex items-center justify-center mx-auto text-[#2D5A27] border border-[#2D5A27]/20">
          <CheckCircle className="w-10 h-10" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-[#2D5A27] bg-[#EBF3EA] px-3.5 py-1 rounded-xs border border-[#2D5A27]/20 font-bold">
          Order Reference: #{orderPlacedId.slice(-8).toUpperCase()}
        </span>
        <h1 className="text-2xl sm:text-3xl font-light text-[#111111]">
          Thank You For Choosing Enagic® Kangen Water®
        </h1>
        <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
          Your order has been recorded in the central Enagic enterprise registry. An authorized
          water-specialist will contact you within 24 hours to schedule complimentary certified
          in-home plumbing installation.
        </p>

        {/* Stripe Confirmation Badge */}
        {stripePaymentIntentId && (
          <div className="max-w-md mx-auto p-4 rounded-lg bg-[#F8F9FE] border border-[#635BFF]/30 text-left text-xs space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#635BFF] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Stripe Payment Confirmed
              </span>
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] uppercase font-bold text-[#635BFF] flex items-center gap-0.5 hover:underline"
              >
                Stripe.com <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <p className="text-[#555555]">
              Charged Amount: <strong className="text-[#111111]">{formatPrice(grandTotal, currency)}</strong>
            </p>
            <p className="text-[11px] font-mono text-[#777777] truncate">
              Stripe Intent ID: {stripePaymentIntentId}
            </p>
            <p className="text-[10px] text-[#2D5A27] font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> 256-Bit SSL Encrypted & PCI-DSS Level 1 Certified
            </p>
          </div>
        )}

        {/* Sponsor recognition */}
        {placedReferral && (
          <div className="max-w-md mx-auto p-4 rounded-lg bg-[#FAF9F5] border border-[#E5E5E5] text-left text-xs space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#8C5E1E] font-bold">
              Consultant Commission Logged
            </span>
            <p className="font-semibold text-[#111111]">
              Consultant: {placedReferral.name} ({placedReferral.referralCode})
            </p>
            <p className="text-[11px] text-[#666666]">
              Direct 10% commission ({formatPrice(directCommissionAmount, currency)}) has been credited to consultant’s Hellobee ledger.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/account"
            className="w-full sm:w-auto bg-[#111111] text-white px-8 py-3 text-xs uppercase font-semibold tracking-wider rounded-xs hover:bg-[#333333] transition-colors"
          >
            View in Account Portal
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto border border-[#E5E5E5] px-8 py-3 text-xs uppercase font-medium hover:bg-[#F5F4F0] transition-colors"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Checkout Breadcrumb Header */}
      <div className="mb-8 pb-4 border-b border-[#E5E5E5]">
        <span className="text-xs uppercase tracking-widest text-[#737373]">
          Enagic® Global Medical Equipment &bull; Secure Checkout
        </span>
        <h1 className="text-2xl sm:text-3xl font-light text-[#111111] mt-1">
          Complete Your Order
        </h1>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Form Details Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Customer Contact Info */}
          <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider">
                1. Customer & Warranty Recipient Information
              </h2>
              {currentUser && (
                <span className="text-[10px] uppercase font-bold text-[#477A5A] bg-[#EBF3EA] px-2 py-0.5 rounded-full">
                  Signed in as {currentUser.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-[#737373] block mb-1 font-medium">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full text-xs p-3 rounded-xs border border-[#E5E5E5] bg-white outline-none focus:border-[#111111] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[#737373] block mb-1 font-medium">
                  Contact Phone Number (US) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 349-8201"
                  className="w-full text-xs p-3 rounded-xs border border-[#E5E5E5] bg-white outline-none focus:border-[#111111] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[#737373] block mb-1 font-medium">
                  Email Address (For Invoice & Warranty Certificate) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  className="w-full text-xs p-3 rounded-xs border border-[#E5E5E5] bg-white outline-none focus:border-[#111111] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping & Installation Address */}
          <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider">
              2. Shipping & Certified In-Home Installation Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-[#737373] block mb-1 font-medium">
                  Street Address & Apartment / Unit *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 72 Le Loi Boulevard, Suite 402"
                  className="w-full text-xs p-3 rounded-xs border border-[#E5E5E5] bg-white outline-none focus:border-[#111111] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[#737373] block mb-1 font-medium">
                  Ward / Sub-district
                </label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g. Ben Nghe Ward"
                  className="w-full text-xs p-3 rounded-xs border border-[#E5E5E5] bg-white outline-none focus:border-[#111111] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[#737373] block mb-1 font-medium">
                  District / County
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. District 1"
                  className="w-full text-xs p-3 rounded-xs border border-[#E5E5E5] bg-white outline-none focus:border-[#111111] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[#737373] block mb-1 font-medium">
                  City / State *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Ho Chi Minh City"
                  className="w-full text-xs p-3 rounded-xs border border-[#E5E5E5] bg-white outline-none focus:border-[#111111] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[#737373] block mb-1 font-medium">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="700000"
                  className="w-full text-xs p-3 rounded-xs border border-[#E5E5E5] bg-white outline-none focus:border-[#111111] transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-[#737373] block mb-1 font-medium">
                  Installation Notes & Water Tap Type (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Under-sink installation requested, preferred technician visit on Saturday morning."
                  className="w-full text-xs p-3 rounded-xs border border-[#E5E5E5] bg-white outline-none focus:border-[#111111] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Referral Code Section */}
          <div className="bg-[#FAF9F5] p-6 rounded-lg border border-[#E5E5E5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#111111] uppercase tracking-wider">
                <Tag className="w-4 h-4 text-[#B9A58B]" />
                <span>Enagic Consultant Referral Code</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#EAE8E1] text-[#555] font-semibold rounded-xs">
                Optional
              </span>
            </div>

            <p className="text-xs text-[#737373] leading-relaxed">
              If an Enagic Certified Hydration Associate assisted you (e.g. <code>HB-EMP-101</code>),
              enter their code below to credit their direct commission and assign them as your dedicated customer specialist.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter Consultant Code (e.g. HB-EMP-101)..."
                className="w-full text-xs p-3 rounded-xs border border-[#D5D5D5] bg-white uppercase font-mono font-bold tracking-wider outline-none focus:border-[#111111] transition-colors"
              />

              {/* Quick Pick Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="text-[#888888]">Quick samples:</span>
                <button
                  type="button"
                  onClick={() => setReferralCode('HB-EMP-101')}
                  className={`px-2.5 py-1 rounded-xs border text-[10px] font-mono font-semibold transition-all ${
                    referralCode === 'HB-EMP-101'
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white border-[#D5D5D5] text-[#333333] hover:border-[#111111]'
                  }`}
                >
                  HB-EMP-101 (David Nguyen - 10%)
                </button>
                <button
                  type="button"
                  onClick={() => setReferralCode('HB-EMP-102')}
                  className={`px-2.5 py-1 rounded-xs border text-[10px] font-mono font-semibold transition-all ${
                    referralCode === 'HB-EMP-102'
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white border-[#D5D5D5] text-[#333333] hover:border-[#111111]'
                  }`}
                >
                  HB-EMP-102 (Sophia Miller - 10%)
                </button>
                <button
                  type="button"
                  onClick={() => setReferralCode('HB-OWNER-01')}
                  className={`px-2.5 py-1 rounded-xs border text-[10px] font-mono font-semibold transition-all ${
                    referralCode === 'HB-OWNER-01'
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white border-[#D5D5D5] text-[#333333] hover:border-[#111111]'
                  }`}
                >
                  HB-OWNER-01 (Managing Owner)
                </button>
              </div>

              {/* Verification Status */}
              {verifiedBeneficiary ? (
                <div className="mt-3 p-3.5 bg-[#EBF3EA] rounded-xs border border-[#2D5A27]/20 flex items-start gap-2.5 text-xs text-[#2D5A27]">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">
                      ✓ Valid Code: {verifiedBeneficiary.name} ({verifiedBeneficiary.referralCode})
                    </p>
                    <p className="text-[11px] text-[#2D5A27]/80">
                      Role: <strong>{verifiedBeneficiary.role}</strong> (Rank {verifiedBeneficiary.rank}) &bull;
                      Direct 10% Associate commission will be credited upon order completion.
                    </p>
                  </div>
                </div>
              ) : referralCode.trim() ? (
                <div className="mt-2 p-2.5 bg-[#FFF7ED] rounded-xs border border-[#EA580C]/20 flex items-center gap-2 text-xs text-[#C2410C]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Referral code &quot;{referralCode}&quot; is not found. Please verify spelling or pick a demo code above.</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Step 3: Payment Method (Featuring STRIPE) */}
          <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider">
                3. Payment Method
              </h2>
              <span className="text-[11px] text-[#777777] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#2D5A27]" /> 256-Bit SSL Encrypted
              </span>
            </div>

            {/* Payment Options */}
            <div className="space-y-3">
              {/* Option 1: STRIPE (Recommended) */}
              <div
                className={`rounded-lg border transition-all ${
                  paymentMethod === 'stripe'
                    ? 'border-[#635BFF] bg-[#FAFAFF] shadow-xs ring-1 ring-[#635BFF]/30'
                    : 'border-[#E5E5E5] hover:border-[#CCCCCC] bg-white'
                }`}
              >
                <label className="flex items-start gap-3.5 p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                    className="accent-[#635BFF] mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#111111]">
                          Pay with Stripe
                        </span>
                        <span className="text-[10px] font-bold uppercase bg-[#635BFF] text-white px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      </div>
                      {/* Stripe Brand & Card Icons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#635BFF] bg-white px-2 py-0.5 rounded border border-[#635BFF]/30">
                          Powered by stripe
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                      Instant, secure checkout via credit/debit card, Apple Pay, Google Pay, and Stripe Link.
                    </p>

                    {/* Integrated Stripe Payment Element UI */}
                    {paymentMethod === 'stripe' && (
                      <div className="mt-4 pt-4 border-t border-[#E5E5FF] space-y-4 animate-in fade-in duration-200">
                        {/* 1-Click Express Pay Pills */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider block">
                            Express 1-Click Checkout
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={fillStripeTestCard}
                              className="bg-black text-white py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#222222] transition-colors shadow-2xs"
                            >
                              <span>Pay</span>
                              <span className="text-[10px] opacity-75">Apple Pay</span>
                            </button>
                            <button
                              type="button"
                              onClick={fillStripeTestCard}
                              className="bg-white border border-[#D5D5D5] text-[#333333] py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[#F9F9F9] transition-colors shadow-2xs"
                            >
                              <span className="text-blue-600 font-bold">G</span>Pay
                            </button>
                            <button
                              type="button"
                              onClick={fillStripeTestCard}
                              className="bg-[#00D66F] text-[#0A2540] py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#00c566] transition-colors shadow-2xs"
                            >
                              <span>⚡ Link</span>
                              <span className="text-[10px] opacity-80">by Stripe</span>
                            </button>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-2">
                          <div className="flex-1 h-px bg-[#E5E5E5]" />
                          <span className="text-[10px] text-[#888888] uppercase tracking-wider font-semibold">
                            Or pay with Card via Stripe Elements
                          </span>
                          <div className="flex-1 h-px bg-[#E5E5E5]" />
                        </div>

                        {/* Test card filler shortcut */}
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-md border border-[#D8D8F6]">
                          <span className="text-[11px] text-[#555555]">
                            Testing this demo? Autofill Stripe test card credentials:
                          </span>
                          <button
                            type="button"
                            onClick={fillStripeTestCard}
                            className="inline-flex items-center gap-1 bg-[#635BFF] text-white px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-bold hover:bg-[#5046E5] transition-colors shadow-2xs"
                          >
                            <Zap className="w-3 h-3" />
                            Fill Test Card
                          </button>
                        </div>

                        {/* Card Input Elements */}
                        <div className="bg-white p-4 rounded-lg border border-[#D8D8F6] space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555]">
                                Card Number
                              </label>
                              {detectedCardBrand && (
                                <span className="text-[10px] font-bold text-[#635BFF] bg-[#F0EFFF] px-2 py-0.5 rounded">
                                  {detectedCardBrand}
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={stripeCardNumber}
                                onChange={(e) => handleFormatCardNumber(e.target.value)}
                                placeholder="4242 4242 4242 4242"
                                maxLength={19}
                                className="w-full text-xs font-mono p-2.5 pr-10 rounded-xs border border-[#D5D5D5] outline-none focus:border-[#635BFF] transition-colors"
                              />
                              <CreditCard className="w-4 h-4 text-[#888888] absolute right-3 top-3 pointer-events-none" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                                Expiration (MM/YY)
                              </label>
                              <input
                                type="text"
                                value={stripeExp}
                                onChange={(e) => handleFormatExp(e.target.value)}
                                placeholder="MM/YY"
                                maxLength={5}
                                className="w-full text-xs font-mono p-2.5 rounded-xs border border-[#D5D5D5] outline-none focus:border-[#635BFF] transition-colors"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                                CVC / CVV
                              </label>
                              <div className="relative">
                                <input
                                  type="password"
                                  value={stripeCvc}
                                  onChange={(e) => setStripeCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                  placeholder="•••"
                                  maxLength={4}
                                  className="w-full text-xs font-mono p-2.5 pr-8 rounded-xs border border-[#D5D5D5] outline-none focus:border-[#635BFF] transition-colors"
                                />
                                <Lock className="w-3.5 h-3.5 text-[#888888] absolute right-2.5 top-3 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                                Cardholder Name
                              </label>
                              <input
                                type="text"
                                value={stripeCardName}
                                onChange={(e) => setStripeCardName(e.target.value)}
                                placeholder="Name as on card"
                                className="w-full text-xs p-2.5 rounded-xs border border-[#D5D5D5] outline-none focus:border-[#635BFF] transition-colors"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                                Billing ZIP / Postal Code
                              </label>
                              <input
                                type="text"
                                value={stripeZip}
                                onChange={(e) => setStripeZip(e.target.value)}
                                placeholder="90210"
                                className="w-full text-xs p-2.5 rounded-xs border border-[#D5D5D5] outline-none focus:border-[#635BFF] transition-colors"
                              />
                            </div>
                          </div>

                          <div className="pt-1 flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="stripeSaveCard"
                              checked={saveCardWithStripe}
                              onChange={(e) => setSaveCardWithStripe(e.target.checked)}
                              className="accent-[#635BFF] w-4 h-4"
                            />
                            <label htmlFor="stripeSaveCard" className="text-[11px] text-[#555] cursor-pointer">
                              Save card info securely for 1-click checkout next time (Stripe Link)
                            </label>
                          </div>
                        </div>

                        {/* Official Stripe Footer Security Badge */}
                        <div className="flex items-center justify-between text-[11px] text-[#666666] pt-1">
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-[#635BFF]" />
                            <span>PCI-DSS Level 1 Encrypted</span>
                          </span>
                          <a
                            href="https://stripe.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#635BFF] hover:underline flex items-center gap-0.5 font-medium"
                          >
                            Learn about Stripe security <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Option 2: Cash / Certified Check upon Technician Delivery */}
              <div
                className={`rounded-lg border transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#111111] bg-white shadow-xs ring-1 ring-[#111111]/20'
                    : 'border-[#E5E5E5] hover:border-[#CCCCCC] bg-white'
                }`}
              >
                <label className="flex items-center gap-3.5 p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#111111]"
                  />
                  <Banknote className="w-4 h-4 text-[#2D5A27]" />
                  <div className="flex-1">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#111111] block">
                      Pay Upon Delivery & Installation (Cash / Certified Bank Draft)
                    </span>
                    <span className="text-[11px] text-[#777777]">
                      Inspect water tester and filtration unit before finalizing payment with the technician.
                    </span>
                  </div>
                </label>
              </div>

              {/* Option 3: Corporate Direct Bank Wire Transfer */}
              <div
                className={`rounded-lg border transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-[#111111] bg-white shadow-xs ring-1 ring-[#111111]/20'
                    : 'border-[#E5E5E5] hover:border-[#CCCCCC] bg-white'
                }`}
              >
                <label className="flex items-center gap-3.5 p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="accent-[#111111]"
                  />
                  <CreditCard className="w-4 h-4 text-[#111111]" />
                  <div className="flex-1">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#111111] block">
                      Enagic Corporate Bank Wire Transfer
                    </span>
                    <span className="text-[11px] text-[#777777]">
                      Direct wire to Enagic Vietnam / Enagic USA corporate account.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Column (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-xs space-y-4 sticky top-28">
            <h3 className="text-sm font-semibold text-[#111111] border-b border-[#E5E5E5] pb-3 uppercase tracking-wider">
              Order Summary ({cart.length})
            </h3>
            <div className="divide-y divide-[#E5E5E5] max-h-72 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex gap-3 text-xs">
                  <div className="relative w-12 h-12 bg-white rounded-xs border border-[#E5E5E5] p-0.5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <Image src={item.image} alt={item.productName} fill className="object-contain" sizes="50px" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#111111] line-clamp-1">{item.productName}</p>
                    <p className="text-[11px] text-[#737373]">{item.size} x {item.quantity}</p>
                    <p className="font-semibold text-[#111111] mt-0.5">{formatPrice(item.price * item.quantity, currency)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5E5E5] pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-[#737373]">
                <span>Equipment Subtotal</span>
                <span className="font-semibold text-[#111111]">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-[#737373]">
                <span>Technician In-Home Setup</span>
                <span className="font-semibold text-[#2D5A27]">FREE (Included)</span>
              </div>

              {verifiedBeneficiary && (
                <div className="flex justify-between text-[#2D5A27] text-[11px] pt-1 border-t border-dashed border-[#E5E5E5]">
                  <span>Consultant Commission (10%):</span>
                  <span>+{formatPrice(directCommissionAmount, currency)}</span>
                </div>
              )}

              <div className="border-t border-[#E5E5E5] pt-3 flex justify-between text-base font-semibold text-[#111111]">
                <span>Total Due</span>
                <span className="text-lg font-bold text-[#111111]">{formatPrice(grandTotal, currency)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xs text-xs uppercase tracking-wider font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs text-white ${
                paymentMethod === 'stripe'
                  ? 'bg-[#635BFF] hover:bg-[#5046E5] disabled:bg-[#8888FF]'
                  : 'bg-[#111111] hover:bg-[#262626] disabled:bg-[#888888]'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{paymentMethod === 'stripe' ? 'Authorizing with Stripe...' : 'Processing Order...'}</span>
                </span>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'stripe'
                      ? `Pay ${formatPrice(grandTotal, currency)} with Stripe`
                      : 'Place Order'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#737373] pt-2 border-t border-[#E5E5E5]">
              <ShieldCheck className="w-4 h-4 text-[#111111]" />
              <span>Official Enagic Medical Grade Certification Guarantee</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-16 text-center text-xs text-[#737373]">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
