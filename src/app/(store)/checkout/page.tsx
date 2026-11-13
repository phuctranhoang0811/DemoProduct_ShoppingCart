'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard, Banknote, CheckCircle, ArrowRight, PhoneCall } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { PaymentMethod } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { t, language } = useTranslation();

  const cart = useCommerceStore((state) => state.cart);
  const currentUser = useCommerceStore((state) => state.currentUser);
  const createOrder = useCommerceStore((state) => state.createOrder);
  const clearCart = useCommerceStore((state) => state.clearCart);
  const currency = useCommerceStore((state) => state.currency);

  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  const defaultAddr = currentUser?.addresses.find((a) => a.isDefault) || currentUser?.addresses[0];
  const [street, setStreet] = useState(defaultAddr?.street || '');
  const [ward, setWard] = useState(defaultAddr?.ward || '');
  const [district, setDistrict] = useState(defaultAddr?.district || '');
  const [city, setCity] = useState(defaultAddr?.city || (language === 'vi' ? 'Hà Nội' : 'Ho Chi Minh City'));

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlacedId, setOrderPlacedId] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = subtotal;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !street.trim()) {
      toast.error(language === 'vi' ? 'Vui lòng điền đầy đủ các trường thông tin bắt buộc (*)' : 'Please fill all required fields (*)');
      return;
    }

    if (cart.length === 0) {
      toast.error(language === 'vi' ? 'Giỏ hàng đang trống' : 'Cart is empty');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const order = createOrder({
        customerName: fullName,
        customerEmail: email || 'customer@enagic.vn',
        customerPhone: phone,
        shippingAddress: {
          street,
          ward,
          district,
          city,
        },
        deliveryMethod: 'Enagic Certified Technician Delivery & In-Home Installation',
        paymentMethod,
        paymentStatus: paymentMethod === 'online_simulation' ? 'Paid' : 'Unpaid',
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
        notes,
      });

      clearCart();
      setIsSubmitting(false);
      setOrderPlacedId(order.id);
      toast.success(t.checkout.orderSuccessTitle);
    }, 600);
  };

  if (orderPlacedId) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-lg">
          <CheckCircle className="w-10 h-10" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Mã Đơn: #{orderPlacedId.slice(-8).toUpperCase()}
        </span>
        <h1 className="text-2xl sm:text-4xl font-medium text-[#111111]">
          {t.checkout.orderSuccessTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#555555] max-w-lg mx-auto leading-relaxed">
          {t.checkout.orderSuccessDesc}
        </p>
        <div className="p-5 rounded-2xl glass-card border border-blue-100 max-w-md mx-auto text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Khách hàng:</span>
            <span className="font-semibold">{fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Số điện thoại:</span>
            <span className="font-semibold">{phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Địa chỉ khảo sát:</span>
            <span className="font-semibold">{street}, {ward}, {city}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-500">Tổng thanh toán:</span>
            <span className="font-bold text-blue-900">{formatPrice(grandTotal, currency)}</span>
          </div>
        </div>
        <div className="pt-4 flex justify-center gap-4">
          <Link
            href="/shop"
            className="bg-[#111111] text-white px-8 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-blue-900 transition-all shadow-md"
          >
            {t.cart.startShopping}
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-28 text-center space-y-4">
        <h1 className="text-2xl font-light text-[#111111]">{t.cart.emptyTitle}</h1>
        <p className="text-xs text-[#777777]">{t.cart.emptyDesc}</p>
        <Link
          href="/shop"
          className="inline-block mt-4 bg-[#111111] text-white px-8 py-3 text-xs uppercase font-semibold tracking-wider rounded-xl hover:bg-blue-900 transition-all"
        >
          {t.cart.startShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#111111] mb-8 pb-4 border-b border-[#E5E5E5]">
        {t.checkout.title}
      </h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Checkout Steps (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Customer Contact */}
          <div className="glass-card p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
              {t.checkout.step1}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1 font-medium">{t.checkout.fullName}</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-blue-700"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1 font-medium">{t.checkout.phone}</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-blue-700"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-600 block mb-1 font-medium">{t.checkout.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-blue-700"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping / Installation Address */}
          <div className="glass-card p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
              {t.checkout.step2}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-600 block mb-1 font-medium">{t.checkout.street}</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-blue-700"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1 font-medium">{t.checkout.ward}</label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-blue-700"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1 font-medium">{t.checkout.district}</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-blue-700"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-600 block mb-1 font-medium">{t.checkout.city}</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-blue-700"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-600 block mb-1 font-medium">{t.checkout.notes}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'vi' ? 'Vd: Khảo sát vào thứ 7 hoặc buổi sáng...' : 'e.g. Please install on Saturday morning...'}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-blue-700"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="glass-card p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
              {t.checkout.step3}
            </h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-blue-700 cursor-pointer bg-white transition-colors">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-blue-700"
                />
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-[#111111]">{t.checkout.paymentCod}</span>
              </label>
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-blue-700 cursor-pointer bg-white transition-colors">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="accent-blue-700"
                />
                <CreditCard className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-medium text-[#111111]">{t.checkout.paymentBank}</span>
              </label>
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-blue-700 cursor-pointer bg-white transition-colors">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'online_simulation'}
                  onChange={() => setPaymentMethod('online_simulation')}
                  className="accent-blue-700"
                />
                <CreditCard className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-medium text-[#111111]">{t.checkout.paymentInstallment}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Column (4 cols) */}
        <div className="lg:col-span-4">
          <div className="glass-card p-6 rounded-3xl border border-blue-100 shadow-md space-y-4 sticky top-28">
            <h3 className="text-sm font-bold text-[#111111] border-b pb-3 uppercase tracking-wider">
              {language === 'vi' ? 'Thiết Bị Của Bạn' : 'Your Equipment'} ({cart.length})
            </h3>
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex gap-3 text-xs">
                  <div className="relative w-12 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="50px" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#111111] line-clamp-1">{item.productName}</p>
                    <p className="text-[11px] text-gray-500">{item.size} x {item.quantity}</p>
                    <p className="font-semibold text-blue-900 mt-0.5">{formatPrice(item.price * item.quantity, currency)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold text-[#111111]">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t.cart.shipping}</span>
                <span className="font-semibold text-emerald-700">{t.cart.shippingFree}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold text-[#111111]">
                <span>{t.cart.total}</span>
                <span className="text-xl text-blue-900">{formatPrice(grandTotal, currency)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mirror-sheen"
            >
              <span>{isSubmitting ? 'Đang Xử Lý...' : t.checkout.placeOrder}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-2 border-t">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>{t.cart.sslSecurity}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
