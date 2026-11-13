'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Plus,
  Minus,
  Truck,
  Star,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Award,
  Wrench,
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

  // Review form
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
        <h1 className="text-2xl font-light text-[#111111]">
          {language === 'vi' ? 'Không Tìm Thấy Sản Phẩm' : 'Product Not Found'}
        </h1>
        <p className="text-xs text-[#777777]">
          {language === 'vi' ? 'Sản phẩm không tồn tại hoặc đã được gỡ xuống.' : 'The requested product does not exist.'}
        </p>
        <Link
          href="/shop"
          className="inline-block mt-4 bg-[#111111] text-white px-8 py-3 text-xs uppercase font-semibold tracking-wider"
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
      color: activeColor || { id: 'c-default', name: 'Standard', hex: '#111111' },
      size: pkgLabel,
      quantity,
      stock: stockAvailable,
    });

    toast.success(
      language === 'vi'
        ? `Đã thêm ${quantity}x "${productName}" vào túi hàng.`
        : `Added ${quantity}x "${productName}" to your bag.`
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error(language === 'vi' ? 'Vui lòng điền đủ họ tên và nội dung.' : 'Please complete required fields.');
      return;
    }

    setIsSubmittingReview(true);
    setTimeout(() => {
      addReview({
        productId: product.id,
        productName,
        customerName: reviewName,
        customerEmail: reviewEmail || 'customer@example.com',
        rating: reviewRating,
        comment: reviewComment,
      });

      setIsSubmittingReview(false);
      setReviewName('');
      setReviewEmail('');
      setReviewComment('');
      toast.success(language === 'vi' ? 'Cảm ơn đánh giá của bạn!' : 'Thank you for your review!');
    }, 400);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#777777]">
        <Link href="/" className="hover:text-[#111111]">{t.nav.home}</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#111111]">{t.nav.products}</Link>
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
                  className={`relative w-20 h-24 md:w-22 md:h-26 flex-shrink-0 border rounded-xs overflow-hidden transition-all ${
                    activeImage === img ? 'border-[#111111] ring-1 ring-[#111111]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`${productName} ${idx + 1}`} fill className="object-cover" sizes="90px" />
                </button>
              ))}
            </div>
          )}

          {/* Primary View */}
          <div className="relative aspect-[3/4] w-full bg-[#F5F4F0] overflow-hidden flex-1 rounded-xs border border-black/[0.04]">
            <Image
              src={activeImage}
              alt={productName}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            {product.specifications?.electrodes && (
              <span className="absolute top-4 left-4 bg-white/90 text-[#111111] border border-black/10 text-[11px] font-medium px-3 py-1 rounded-full shadow-2xs">
                {product.specifications.electrodes} {language === 'vi' ? 'Tấm Titan Bạch Kim' : 'Plates'}
              </span>
            )}
          </div>
        </div>

        {/* Right Purchase Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-[#E5E5E5] pb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-[#777777] font-mono">
                {product.sku}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <Star className="w-3.5 h-3.5 fill-[#111111] text-[#111111]" />
                <span className="font-semibold">{averageRating}</span>
                <span className="text-[#777777]">({approvedReviews.length})</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#111111]">
              {productName}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-2xl font-normal text-[#111111]">
                {formatPrice(product.price, currency)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-[#777777] line-through font-normal">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed pt-1">
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
                  className="text-[#111111] underline flex items-center gap-1 text-[11px]"
                >
                  <Wrench className="w-3 h-3" />
                  <span>{t.productDetail.sizeGuide}</span>
                </button>
              </div>
              <div className="space-y-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedPackage(s.label)}
                    className={`w-full p-2.5 rounded-xs border text-left text-xs transition-colors flex items-center justify-between ${
                      (selectedPackage || product.sizes[0].label) === s.label
                        ? 'border-[#111111] bg-[#F5F4F0] font-medium text-[#111111]'
                        : 'border-[#E5E5E5] bg-white text-[#555555] hover:border-[#111111]'
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className="text-[11px] text-[#777777]">
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
              <div className="flex items-center border border-[#E5E5E5] rounded-xs bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 text-[#555555] hover:text-[#111111]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 text-[#555555] hover:text-[#111111]"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#111111] hover:bg-[#333333] text-white py-3 rounded-xs text-xs uppercase tracking-wider font-semibold active:scale-[0.98] transition-all"
              >
                {t.productDetail.addToCart}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xs border transition-colors ${
                  isInWishlist ? 'border-[#9E3A3A] text-[#9E3A3A]' : 'border-[#E5E5E5] text-[#555555] hover:border-[#111111]'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-[#9E3A3A]' : ''}`} />
              </button>
            </div>

            {/* Guarantees */}
            <div className="p-3 border border-[#E5E5E5] bg-[#FAF9F5] rounded-xs text-xs space-y-1.5 text-[#555555]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#111111]" />
                <span>{t.productDetail.japanCertified}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#111111]" />
                <span>{t.productDetail.freeInstallation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#111111]" />
                <span>{t.productDetail.fiveYearWarranty}</span>
              </div>
            </div>
          </div>

          {/* Accordion Sections: Specs & Details */}
          <div className="border-t border-[#E5E5E5] divide-y divide-[#E5E5E5] pt-2">
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
                  <div className="pb-4 text-xs space-y-1.5 text-[#555555]">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#888888]">{t.showcase.electrodes}:</span>
                      <span className="font-medium text-[#111111]">{product.specifications.electrodes} Tấm Titan Bạch Kim</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#888888]">{t.showcase.phRange}:</span>
                      <span className="font-medium text-[#111111]">{product.specifications.phRange}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#888888]">{t.showcase.orpLevel}:</span>
                      <span className="font-medium text-[#111111]">{product.specifications.orp}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#888888]">{t.showcase.warranty}:</span>
                      <span className="font-medium text-[#111111]">{product.specifications.warranty}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#888888]">{t.showcase.origin}:</span>
                      <span className="font-medium text-[#111111]">{product.specifications.origin}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                className="w-full py-3 flex items-center justify-between text-xs font-semibold text-[#111111] uppercase tracking-wider"
              >
                <span>{language === 'vi' ? 'Đặc Điểm Nổi Bật' : 'Key Highlights'}</span>
                {openAccordion === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'details' && (
                <ul className="pb-4 text-xs space-y-1 text-[#555555] list-disc pl-4">
                  {productDetails.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Installation Blueprint Modal */}
      {isInstallGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-xs border border-[#E5E5E5] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>{language === 'vi' ? 'Sơ Đồ & Yêu Cầu Lắp Đặt' : 'Installation Requirements'}</span>
              </h3>
              <button onClick={() => setIsInstallGuideOpen(false)} className="text-[#777777] hover:text-[#111111]">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#555555] leading-relaxed">
              <div className="p-3 bg-[#FAF9F5] border border-[#E5E5E5]">
                <h4 className="font-semibold text-[#111111] mb-0.5">1. Lắp Đặt Để Bàn (Countertop)</h4>
                <p>Nối trực tiếp vào đầu vòi rửa gia đình thông qua đầu chia vòi thông minh kèm theo máy.</p>
              </div>
              <div className="p-3 bg-[#FAF9F5] border border-[#E5E5E5]">
                <h4 className="font-semibold text-[#111111] mb-0.5">2. Lắp Đặt Dưới Chậu Rửa (Under-sink)</h4>
                <p>Sử dụng bộ vòi điện tử chuyên dụng đưa lên mặt bồn, thân máy đặt kín đáo bên dưới tủ bếp.</p>
              </div>
              <div className="p-3 bg-[#FAF9F5] border border-[#E5E5E5]">
                <h4 className="font-semibold text-[#111111] mb-0.5">3. Nguồn Nước & Áp Lực</h4>
                <p>Nước máy sinh hoạt đã qua bộ tiền lọc nano xử lý thô. Áp lực nước 0.1 - 0.5 MPa.</p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setIsInstallGuideOpen(false)}
                className="bg-[#111111] text-white px-5 py-2 text-xs font-semibold"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <section className="mt-16 border-t border-[#E5E5E5] pt-10">
        <div className="max-w-2xl space-y-6">
          <h2 className="text-lg font-normal text-[#111111]">
            {t.productDetail.reviewsTitle} ({approvedReviews.length})
          </h2>

          <div className="space-y-3">
            {approvedReviews.map((r) => (
              <div key={r.id} className="p-4 border border-[#E5E5E5] bg-white rounded-xs space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#111111]">{r.customerName}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < r.rating ? 'fill-[#111111] text-[#111111]' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#555555]">{r.comment}</p>
                <span className="text-[10px] text-[#999999] block">{formatDate(r.createdAt)}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleReviewSubmit} className="p-5 border border-[#E5E5E5] bg-[#FAF9F5] rounded-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">{t.productDetail.writeReview}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t.checkout.fullName}
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="text-xs p-2.5 border border-[#E5E5E5] bg-white outline-none"
                required
              />
              <input
                type="email"
                placeholder={t.checkout.email}
                value={reviewEmail}
                onChange={(e) => setReviewEmail(e.target.value)}
                className="text-xs p-2.5 border border-[#E5E5E5] bg-white outline-none"
              />
            </div>
            <textarea
              rows={3}
              placeholder={language === 'vi' ? 'Nội dung nhận xét...' : 'Write your review...'}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full text-xs p-2.5 border border-[#E5E5E5] bg-white outline-none"
              required
            />
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="bg-[#111111] text-white px-5 py-2 text-xs uppercase font-semibold"
            >
              {isSubmittingReview ? '...' : t.productDetail.writeReview}
            </button>
          </form>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-[#E5E5E5] pt-10">
          <h2 className="text-lg font-normal text-[#111111] mb-6">
            {language === 'vi' ? 'Sản Phẩm Tương Thích' : 'Related Equipment'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
