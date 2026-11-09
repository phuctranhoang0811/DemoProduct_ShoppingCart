'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard, Banknote, Building2, CheckCircle, Tag } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { PaymentMethod, OrderItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();

  const cart = useCommerceStore((state) => state.cart);
  const products = useCommerceStore((state) => state.products);
  const currentUser = useCommerceStore((state) => state.currentUser);
  const settings = useCommerceStore((state) => state.settings);
  const createOrder = useCommerceStore((state) => state.createOrder);
  const validateDiscount = useCommerceStore((state) => state.validateDiscount);
  const currency = useCommerceStore((state) => state.currency);

  // Form states
  const [fullName, setFullName] = useState(currentUser?.name || 'Elena Rostova');
  const [email, setEmail] = useState(currentUser?.email || 'customer@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+84 901 234 567');

  const defaultAddr = currentUser?.addresses.find((a) => a.isDefault) || currentUser?.addresses[0];
  const [street, setStreet] = useState(defaultAddr?.street || '72 Le Loi Boulevard, Suite 402');
  const [ward, setWard] = useState(defaultAddr?.ward || 'Ben Nghe Ward');
  const [district, setDistrict] = useState(defaultAddr?.district || 'District 1');
  const [city, setCity] = useState(defaultAddr?.city || 'Ho Chi Minh City');

  const [deliveryMethod, setDeliveryMethod] = useState('Standard Courier (2-4 business days)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online_simulation');
  const [notes, setNotes] = useState('');

  // Discount
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const res = validateDiscount(promoCode, subtotal);
    if (!res.valid) {
      toast.error(res.error || 'Invalid discount code.');
      setAppliedDiscount(null);
    } else {
      toast.success(`Code ${promoCode.toUpperCase()} applied! Saved ${formatPrice(res.discountAmount, currency)}`);
      setAppliedDiscount({
        code: promoCode.toUpperCase(),
        amount: res.discountAmount,
      });
    }
  };

  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const isFreeShipping = subtotal >= settings.freeShippingThreshold;
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : settings.shippingFee;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim() || !street.trim() || !city.trim()) {
      toast.error('Please complete all required shipping fields.');
      return;
    }

    // Revalidate stock before checkout
    for (const item of cart) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        toast.error(`Product "${item.productName}" is no longer available.`);
        return;
      }
      const sz = prod.sizes.find((s) => s.label === item.size);
      if (!sz || sz.stock < item.quantity) {
        toast.error(`Insufficient stock for "${item.productName}" size ${item.size}.`);
        return;
      }
    }

    setIsSubmitting(true);

    const orderItems: OrderItem[] = cart.map((c) => ({
      productId: c.productId,
      productName: c.productName,
      slug: c.slug,
      image: c.image,
      price: c.price,
      colorName: c.color.name,
      size: c.size,
      quantity: c.quantity,
    }));

    const newOrder = createOrder({
      customerName: fullName.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      shippingAddress: {
        street: street.trim(),
        ward: ward.trim(),
        district: district.trim(),
        city: city.trim(),
      },
      deliveryMethod,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Unpaid' : 'Paid',
      status: 'Confirmed',
      items: orderItems,
      subtotal,
      discountAmount,
      discountCode: appliedDiscount?.code,
      shippingFee,
      total,
      notes: notes.trim() || undefined,
    });

    toast.success('Order placed successfully!');
    router.push(`/order-success?orderId=${newOrder.id}`);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-light">Your shopping bag is empty</h1>
        <p className="text-xs text-[#777777] mt-2">
          Add items to your bag before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-block mt-6 bg-[#111111] text-white px-8 py-3 text-xs uppercase font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 border-b border-[#E5E5E5] pb-4">
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
          Checkout Simulation
        </h1>
        <p className="text-xs text-[#777777] mt-1">
          Demo prototype: no real credit cards or financial transactions are processed.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Shipping & Payment details (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Step 1: Contact info */}
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] pb-2 border-b border-[#E5E5E5]">
                1. Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-[#777777] block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping address */}
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] pb-2 border-b border-[#E5E5E5]">
                2. Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-[#777777] block mb-1">Street Address, Apartment, Suite *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Ward *</label>
                  <input
                    type="text"
                    required
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-[#777777] block mb-1">City / Province *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Delivery method */}
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] pb-2 border-b border-[#E5E5E5]">
                3. Shipping Method
              </h2>
              <div className="space-y-2">
                {[
                  {
                    id: 'standard',
                    label: 'Standard Courier (2-4 business days)',
                    desc: isFreeShipping ? 'Complimentary' : formatPrice(settings.shippingFee, currency),
                  },
                  {
                    id: 'express',
                    label: 'Carbon-Neutral Express (1-2 business days)',
                    desc: 'Included in complimentary shipping allowance',
                  },
                ].map((dm) => (
                  <label
                    key={dm.id}
                    className={`flex items-center justify-between p-3.5 border cursor-pointer transition-colors ${
                      deliveryMethod === dm.label ? 'border-[#111111] bg-[#F5F4F0]' : 'border-[#E5E5E5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={deliveryMethod === dm.label}
                        onChange={() => setDeliveryMethod(dm.label)}
                        className="accent-[#111111]"
                      />
                      <span className="text-xs font-medium text-[#111111]">{dm.label}</span>
                    </div>
                    <span className="text-xs text-[#777777] font-medium">{dm.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 4: Payment method */}
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] pb-2 border-b border-[#E5E5E5]">
                4. Payment Method
              </h2>
              <div className="space-y-2">
                {/* Online Simulation */}
                <label
                  className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                    paymentMethod === 'online_simulation' ? 'border-[#111111] bg-[#F5F4F0]' : 'border-[#E5E5E5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'online_simulation'}
                    onChange={() => setPaymentMethod('online_simulation')}
                    className="accent-[#111111] mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#111111]" />
                      <span className="text-xs font-semibold text-[#111111]">
                        Credit / Debit Card (Instant Simulation)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777777] mt-1">
                      Instantly simulated transaction. No card details required.
                    </p>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label
                  className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                    paymentMethod === 'bank_transfer' ? 'border-[#111111] bg-[#F5F4F0]' : 'border-[#E5E5E5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="accent-[#111111] mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#111111]" />
                      <span className="text-xs font-semibold text-[#111111]">
                        Direct Bank Transfer (Mock)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777777] mt-1">
                      Bank: Vietcombank | Acc: 1029384756 | Beneficiary: COS MINIMAL VIETNAM
                    </p>
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                    paymentMethod === 'cod' ? 'border-[#111111] bg-[#F5F4F0]' : 'border-[#E5E5E5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#111111] mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#111111]" />
                      <span className="text-xs font-semibold text-[#111111]">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777777] mt-1">
                      Pay cash to courier upon inspecting the garments.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order notes */}
            <div>
              <label className="text-[11px] text-[#777777] block mb-1">
                Order Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Gate code, reception instructions, etc."
                className="w-full border border-[#E5E5E5] px-3.5 py-2 text-xs outline-none focus:border-[#111111] resize-none"
              />
            </div>
          </div>

          {/* Right: Summary & Order confirmation (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#F5F4F0] p-6 space-y-6 sticky top-24">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] pb-3 border-b border-[#E5E5E5]">
                Order Summary ({cart.length} items)
              </h2>

              {/* Items List */}
              <div className="divide-y divide-[#E5E5E5] max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex gap-3 items-center">
                    <div className="relative w-12 h-16 bg-white flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#111111] line-clamp-1">{item.productName}</p>
                      <p className="text-[11px] text-[#777777]">
                        Size: {item.size} &bull; Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-[#111111]">
                      {formatPrice(item.price * item.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo input */}
              <div className="border-t border-[#E5E5E5] pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Discount code"
                    className="flex-1 bg-white border border-[#E5E5E5] px-3 py-2 text-xs outline-none uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-[#111111] text-white px-4 text-xs font-semibold uppercase hover:bg-[#333333]"
                  >
                    Apply
                  </button>
                </div>
                {appliedDiscount && (
                  <p className="text-[11px] text-[#477A5A] mt-1.5 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Code &quot;{appliedDiscount.code}&quot; applied
                  </p>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-[#E5E5E5] pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#555555]">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#B74747]">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#555555]">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee, currency)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#111111] border-t border-[#E5E5E5] pt-3">
                  <span>Grand Total</span>
                  <span>{formatPrice(total, currency)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#111111] text-white py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#333333] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Placing Order...' : `Place Order — ${formatPrice(total, currency)}`}
              </button>

              <p className="text-[10px] text-[#777777] text-center leading-relaxed">
                By placing your order, you accept COS Minimal terms of service and simulated privacy terms.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
