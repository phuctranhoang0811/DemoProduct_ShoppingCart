'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Plus,
  Minus,
  Check,
  Truck,
  RotateCcw,
  Sparkles,
  Star,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Award,
  Droplets,
  Zap,
  PhoneCall,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { ProductCard } from '@/components/product/ProductCard';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductDetailClientProps {
  slug: string;
}

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const { t, language } = useTranslation();
  const products = useCommerceStore((state) => state.products);
  const reviews = useCommerceStore((state) => state.reviews);
  const addReview = useCommerceStore((state) => state.addReview);
  const addToCart = useCommerceStore((state) => state.addToCart);
  const toggleWishlist = useCommerceStore((state) => state.toggleWishlist);
  const isInWishlistStore = useCommerceStore((state) => state.isInWishlist);
  const currency = useCommerceStore((state) => state.currency);

  const product = useMemo(() => {
    return products.find((p) => p.slug === slug);
  }, [products, slug]);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [selectedPackage, setSelectedPackage] = useState<string>(product?.sizes[0]?.label || '');
  const [quantity, setQuantity] = useState(1);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('specs');

  // Review submission form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const activeImage = selectedImage || product?.images[0] || '';
  const activeColor = selectedColor || product?.colors[0];

  const isInWishlist = product ? isInWishlistStore(product.id) : false;

  const currentPkgObj = product?.sizes.find((s) => s.label === selectedPackage) || product?.sizes[0];
  const stockAvailable = currentPkgObj ? currentPkgObj.stock : 10;

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.categoryId === product.categoryId && p.status === 'active')
      .slice(0, 4);
  }, [products, product]);

  const approvedReviews = useMemo(() => {
    if (!product) return [];
    return reviews.filter((r) => r.productId === product.id && r.status === 'approved');
  }, [reviews, product]);

  const averageRating = useMemo(() => {
    if (approvedReviews.length === 0) return '5.0';
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / approvedReviews.length).toFixed(1);
  }, [approvedReviews]);

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-28 text-center space-y-4">
        <Droplets className="w-12 h-12 text-blue-500 mx-auto" />
        <h1 className="text-2xl font-light text-[#111111]">
          {language === 'vi' ? 'Không Tìm Thấy Thiết Bị' : 'Product Not Found'}
        </h1>
        <p className="text-xs text-[#777777] max-w-md mx-auto">
          {language === 'vi'
            ? 'Thiết bị bạn đang tìm kiếm có thể đã được cập nhật hoặc không khả dụng.'
            : 'The requested product does not exist or may have been unlisted.'}
        </p>
        <Link
          href="/shop"
          className="inline-block bg-[#111111] text-white px-8 py-3 text-xs uppercase font-semibold tracking-wider rounded-xl hover:bg-blue-900 transition-all shadow-md"
        >
          {t.shop.allCategories}
        </Link>
      </div>
    );
  }

  const productName = language === 'vi' ? product.nameVi || product.name : product.nameEn || product.name;
  const productDesc = language === 'vi' ? product.descriptionVi || product.description : product.descriptionEn || product.description;
  const productDetails = (language === 'vi' ? product.detailsVi || product.details : product.detailsEn || product.details) || [];

  const handleAddToCart = () => {
    const pkgLabel = selectedPackage || product.sizes[0]?.label || 'Standard';

    addToCart({
      id: `${product.id}-${activeColor?.id || 'default'}-${pkgLabel}`,
      productId: product.id,
      productName,
      slug: product.slug,
      image: activeImage || product.images[0],
      price: product.price,
      originalPrice: product.originalPrice,
      color: activeColor || { id: 'c-default', name: 'Default', hex: '#111111' },
      size: pkgLabel,
      quantity,
      stock: stockAvailable,
    });

    toast.success(
      language === 'vi'
        ? `Đã thêm ${quantity}x "${productName}" vào giỏ hàng.`
        : `Added ${quantity}x "${productName}" to your bag.`
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error(language === 'vi' ? 'Vui lòng điền đầy đủ họ tên và nhận xét.' : 'Please complete required fields.');
      return;
    }

    setIsSubmittingReview(true);
    setTimeout(() => {
      addReview({
        productId: product.id,
        productName,
        customerName: reviewName,
        customerEmail: reviewEmail || 'customer@enagic.vn',
        rating: reviewRating,
        comment: reviewComment,
      });

      setIsSubmittingReview(false);
      setReviewName('');
      setReviewEmail('');
      setReviewComment('');
      toast.success(
        language === 'vi'
          ? 'Cảm ơn bạn! Đánh giá đã được gửi và đang chờ phê duyệt.'
          : 'Thank you! Your feedback has been queued for moderation.'
      );
    }, 400);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#777777]">
        <Link href="/" className="hover:text-blue-700">{t.nav.home}</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-blue-700">{t.nav.products}</Link>
        <span>/</span>
        <span className="text-[#111111] font-medium line-clamp-1">{productName}</span>
      </nav>

      {/* Main Grid: Gallery + Purchase Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Left Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {product.images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-24 md:w-22 md:h-26 flex-shrink-0 border rounded-2xl overflow-hidden transition-all ${
                    activeImage === img ? 'border-blue-700 ring-2 ring-blue-700/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`${productName} perspective ${idx + 1}`} fill className="object-cover" sizes="90px" />
                </button>
              ))}
            </div>
          )}

          {/* Primary View */}
          <div className="relative aspect-square sm:aspect-[4/3] w-full bg-[#F5F8FA] overflow-hidden flex-1 rounded-3xl border border-blue-100 shadow-md">
            <Image
              src={activeImage}
              alt={productName}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            {product.specifications?.electrodes && (
              <span className="absolute top-4 left-4 glass-dark text-cyan-300 border border-cyan-400/30 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>{product.specifications.electrodes} {language === 'vi' ? 'Tấm Titan Bạch Kim' : 'Plates'}</span>
              </span>
            )}
            {product.specifications?.origin && (
              <span className="absolute top-4 right-4 glass-modal text-blue-900 border border-blue-200 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                Made in Japan 🇯🇵
              </span>
            )}
          </div>
        </div>

        {/* Right Purchase Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-[#E5E5E5] pb-6 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-blue-700 font-mono font-semibold">
                {product.sku}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{averageRating}</span>
                <span className="text-[#777777]">({approvedReviews.length})</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
              {productName}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-semibold text-blue-900">
                {formatPrice(product.price, currency)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-[#777777] line-through font-normal">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed pt-1">
              {productDesc}
            </p>
          </div>

          {/* Package Configuration Selection */}
          {product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111111] uppercase tracking-wider">
                  {t.productDetail.packages}
                </span>
                <button
                  type="button"
                  onClick={() => setIsInstallGuideOpen(true)}
                  className="text-blue-700 hover:underline flex items-center gap-1 text-[11px] font-medium"
                >
                  <Wrench className="w-3 h-3" />
                  <span>{t.productDetail.sizeGuide}</span>
                </button>
              </div>
              <div className="space-y-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedPackage(s.label)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      (selectedPackage || product.sizes[0].label) === s.label
                        ? 'border-blue-700 bg-blue-50/60 font-semibold text-blue-950 shadow-xs'
                        : 'border-[#E5E5E5] bg-white text-[#444444] hover:border-[#111111]'
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {s.stock > 0 ? t.productDetail.inStock : t.productDetail.lowStock}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#CCCCCC] rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-[#555555] hover:text-[#111111]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-[#555555] hover:text-[#111111]"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all mirror-sheen"
              >
                {t.productDetail.addToCart}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition-all ${
                  isInWishlist ? 'border-red-500 bg-red-50 text-red-500' : 'border-[#CCCCCC] text-[#555555] hover:border-[#111111]'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Medical Trust Badges */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>{t.productDetail.japanCertified}</span>
              </div>
              <div className="flex items-center gap-2 text-[#444444]">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>{t.productDetail.freeInstallation}</span>
              </div>
              <div className="flex items-center gap-2 text-[#444444]">
                <Award className="w-4 h-4 text-amber-600" />
                <span>{t.productDetail.fiveYearWarranty}</span>
              </div>
            </div>
          </div>

          {/* Accordion Sections: Specs & Details */}
          <div className="border-t border-[#E5E5E5] divide-y divide-[#E5E5E5] pt-2">
            {/* Tech Specs */}
            {product.specifications && (
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'specs' ? null : 'specs')}
                  className="w-full py-3 flex items-center justify-between text-xs font-semibold text-[#111111] uppercase tracking-wider"
                >
                  <span>{t.productDetail.specsTitle}</span>
                  {openAccordion === 'specs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'specs' && (
                  <div className="pb-4 text-xs space-y-2 text-[#444444]">
                    <div className="grid grid-cols-2 gap-2 py-1 border-b border-gray-100">
                      <span className="text-[#777777]">{t.showcase.electrodes}:</span>
                      <span className="font-semibold text-[#111111]">{product.specifications.electrodes} Tấm Titan Phủ Bạch Kim</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-1 border-b border-gray-100">
                      <span className="text-[#777777]">{t.showcase.phRange}:</span>
                      <span className="font-semibold text-blue-700">{product.specifications.phRange}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-1 border-b border-gray-100">
                      <span className="text-[#777777]">{t.showcase.orpLevel}:</span>
                      <span className="font-semibold text-emerald-700">{product.specifications.orp}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-1 border-b border-gray-100">
                      <span className="text-[#777777]">{t.showcase.warranty}:</span>
                      <span className="font-semibold text-[#111111]">{product.specifications.warranty}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-1 border-b border-gray-100">
                      <span className="text-[#777777]">{t.showcase.origin}:</span>
                      <span className="font-semibold text-[#111111]">{product.specifications.origin}</span>
                    </div>
                    {product.specifications.languages && (
                      <div className="grid grid-cols-2 gap-2 py-1 border-b border-gray-100">
                        <span className="text-[#777777]">{language === 'vi' ? 'Ngôn ngữ hiển thị' : 'Languages'}:</span>
                        <span className="font-semibold text-[#111111]">{product.specifications.languages}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Key Features Bullets */}
            <div>
              <button
                onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                className="w-full py-3 flex items-center justify-between text-xs font-semibold text-[#111111] uppercase tracking-wider"
              >
                <span>{language === 'vi' ? 'Đặc Điểm Nổi Bật' : 'Key Highlights'}</span>
                {openAccordion === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'details' && (
                <ul className="pb-4 text-xs space-y-1.5 text-[#444444] list-disc pl-4">
                  {productDetails.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── INSTALLATION BLUEPRINT MODAL ─── */}
      {isInstallGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-modal max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-white/80 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-semibold text-[#111111] flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-700" />
                <span>{language === 'vi' ? 'Sơ Đồ & Yêu Cầu Lắp Đặt Chuẩn Enagic' : 'Enagic Standard Installation Blueprint'}</span>
              </h3>
              <button onClick={() => setIsInstallGuideOpen(false)} className="text-gray-500 hover:text-black">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#444444] leading-relaxed">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-1">1. Lắp Đặt Để Bàn (Countertop)</h4>
                <p>Nối trực tiếp vào đầu vòi rửa bát gia đình thông qua đầu chia vòi thông minh kèm theo máy. Thao tác trong 15 phút, không khoan đục mặt đá.</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-1">2. Lắp Đặt Dưới Chậu Rửa (Under-sink)</h4>
                <p>Sử dụng bộ vòi điện tử chuyên dụng đưa lên mặt bồn, thân máy đặt kín đáo bên dưới tủ bếp, giữ trọn thẩm mỹ không gian bếp hiện đại.</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-1">3. Yêu Cầu Nguồn Nước & Điện Áp</h4>
                <p>Nguồn nước thủy cục (nước máy sinh hoạt) đã qua bộ tiền lọc nano xử lý thô. Áp lực nước 0.1 - 0.5 MPa. Nguồn điện 100V - 240V 50/60Hz.</p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setIsInstallGuideOpen(false)}
                className="bg-[#111111] text-white px-5 py-2 rounded-xl text-xs font-semibold"
              >
                {language === 'vi' ? 'Đã Hiểu' : 'Got It'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REVIEWS SECTION ─── */}
      <section className="mt-16 sm:mt-24 border-t border-[#E5E5E5] pt-12">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-xl sm:text-2xl font-medium text-[#111111]">
            {t.productDetail.reviewsTitle} ({approvedReviews.length})
          </h2>

          {/* Review List */}
          <div className="space-y-4">
            {approvedReviews.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl glass-card border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#111111]">{r.customerName}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#555555]">{r.comment}</p>
                <span className="text-[10px] text-[#999999] block">{formatDate(r.createdAt)}</span>
              </div>
            ))}
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} className="glass-card p-6 rounded-2xl border border-blue-100 space-y-4 mt-6">
            <h3 className="text-sm font-semibold text-[#111111]">{t.productDetail.writeReview}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t.checkout.fullName}
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="text-xs p-3 rounded-xl border border-[#E5E5E5] bg-white outline-none focus:border-blue-700"
                required
              />
              <input
                type="email"
                placeholder={t.checkout.email}
                value={reviewEmail}
                onChange={(e) => setReviewEmail(e.target.value)}
                className="text-xs p-3 rounded-xl border border-[#E5E5E5] bg-white outline-none focus:border-blue-700"
              />
            </div>
            <textarea
              rows={3}
              placeholder={language === 'vi' ? 'Chia sẻ trải nghiệm sử dụng nước Kangen của bạn...' : 'Share your Kangen water experience...'}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#E5E5E5] bg-white outline-none focus:border-blue-700"
              required
            />
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="bg-[#111111] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-blue-900 transition-all"
            >
              {isSubmittingReview ? 'Đang gửi...' : t.productDetail.writeReview}
            </button>
          </form>
        </div>
      </section>

      {/* ─── RELATED PRODUCTS ─── */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 sm:mt-24 border-t border-[#E5E5E5] pt-12">
          <h2 className="text-xl sm:text-2xl font-medium text-[#111111] mb-6">
            {language === 'vi' ? 'Sản Phẩm Tương Thích & Đề Xuất' : 'Recommended Ecosystem Equipment'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
