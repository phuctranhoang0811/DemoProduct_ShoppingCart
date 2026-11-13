'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Tag, Sparkles, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const register = useCommerceStore((state) => state.register);
  const hellobeeMembers = useCommerceStore((state) => state.hellobeeMembers);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const recognizedSponsor = useMemo(() => {
    if (!referralCode.trim()) return null;
    const clean = referralCode.trim().toUpperCase();
    return hellobeeMembers.find((m) => m.referralCode.toUpperCase() === clean);
  }, [referralCode, hellobeeMembers]);

  const handleQuickFill = (code = 'HB-EMP-101') => {
    setName('Nguyễn Văn Hùng');
    setEmail(`hung.nguyen.${Math.floor(Math.random() * 900 + 100)}@gmail.com`);
    setPhone('+84 908 123 456');
    setPassword('Password123');
    setReferralCode(code);
    toast.success('Đã điền thông tin mẫu thử nghiệm!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }

    register(name.trim(), email.trim(), phone.trim());
    if (recognizedSponsor) {
      toast.success(
        `Chào mừng ${name}! Đã liên kết với chuyên viên tư vấn ${recognizedSponsor.name} (${recognizedSponsor.referralCode}).`
      );
    } else {
      toast.success(`Tạo tài khoản thành công cho ${name}!`);
    }
    router.push('/account');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] tracking-[0.25em] text-[#777777] font-semibold uppercase">
          Enagic® Kangen Water® & Hellobee Network
        </span>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
          Đăng Ký Tài Khoản Khách Hàng
        </h1>
        <p className="text-xs text-[#777777] max-w-md mx-auto">
          Tạo tài khoản để theo dõi tiến độ lắp đặt thiết bị y tế Enagic, lịch bảo dưỡng lõi lọc định kỳ và hưởng chế độ bảo hành chuẩn Nhật Bản.
        </p>
      </div>

      {/* Quick Fill Demo Box */}
      <div className="bg-[#FAF9F5] p-4 rounded-lg border border-[#E5E5E5] mb-6 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#477A5A]" />
            <span>Điền Thông Tin Mẫu Nhanh</span>
          </p>
          <p className="text-[11px] text-[#777777]">
            Tự động điền dữ liệu kèm mã chuyên viên giới thiệu <code>HB-EMP-101</code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleQuickFill('HB-EMP-101')}
          className="bg-[#111111] text-white px-3.5 py-1.5 rounded-xs text-[11px] font-semibold hover:bg-[#333333] transition-colors flex-shrink-0"
        >
          Điền mẫu
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-[#E5E5E5]">
        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Họ và Tên *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nguyễn Văn Hùng"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs"
          />
        </div>

        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Địa Chỉ Email *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. hung.nguyen@example.com"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs"
          />
        </div>

        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Số Điện Thoại *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+84 908 123 456"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs"
          />
        </div>

        <div>
          <label className="text-[11px] text-[#777777] uppercase tracking-wider block mb-1">
            Mật Khẩu *
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs outline-none focus:border-[#111111] transition-colors rounded-xs"
          />
        </div>

        {/* Referral Code Field */}
        <div className="pt-2 border-t border-[#F0F0F0]">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-[#777777] uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#B9A58B]" />
              <span>Mã Nhân Viên Giới Thiệu (Tùy chọn)</span>
            </label>
            <span className="text-[10px] text-[#888888]">VD: HB-EMP-101</span>
          </div>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="HB-EMP-101 hoặc HB-EMP-102"
            className="w-full border border-[#E5E5E5] px-3.5 py-2.5 text-xs font-mono font-semibold uppercase outline-none focus:border-[#111111] transition-colors rounded-xs"
          />

          {recognizedSponsor ? (
            <div className="mt-2 p-2.5 bg-[#EBF3EA] rounded-xs border border-[#2D5A27]/20 flex items-center gap-2 text-xs text-[#2D5A27]">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Chuyên viên giới thiệu: <strong>{recognizedSponsor.name}</strong> ({recognizedSponsor.referralCode} - {recognizedSponsor.role})
              </span>
            </div>
          ) : referralCode.trim() ? (
            <p className="mt-1.5 text-[11px] text-[#888888]">
              ℹ Chưa tìm thấy chuyên viên với mã này, bạn vẫn có thể đăng ký bình thường.
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          className="w-full bg-[#111111] text-white py-3.5 text-xs uppercase tracking-[0.15em] font-semibold hover:bg-[#333333] transition-colors rounded-xs flex items-center justify-center gap-2 mt-4"
        >
          <span>Tạo Tài Khoản Khách Hàng</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#E5E5E5] text-center space-y-2 text-xs text-[#777777]">
        <p>
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#111111] underline font-semibold">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
