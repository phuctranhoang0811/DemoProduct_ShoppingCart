'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Ruler,
  Star,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { ProductCard } from '@/components/product/ProductCard';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const products = useCommerceStore((state) => state.products);
  const reviews = useCommerceStore((state) => state.reviews);
  const addReview = useCommerceStore((state) => state.addReview);
  const addToCart = useCommerceStore((state) => state.addToCart);
  const toggleWishlist = useCommerceStore((state) => state.toggleWishlist);
  const isInWishlistStore = useCommerceStore((state) => state.isInWishlist);

  const product = useMemo(() => {
    return products.find((p) => p.slug === slug);
  }, [products, slug]);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeUnit, setSizeUnit] = useState<'cm' | 'in'>('cm');
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  // Review submission form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const activeImage = selectedImage || product?.images[0] || '';
  const activeColor = selectedColor || product?.colors[0];

  const isInWishlist = product ? isInWishlistStore(product.id) : false;

  const currentSizeObj = product?.sizes.find((s) => s.label === selectedSize);
  const stockAvailable = currentSizeObj ? currentSizeObj.stock : 0;

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
    if (approvedReviews.length === 0) return 5;
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / approvedReviews.length).toFixed(1);
  }, [approvedReviews]);

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-28 text-center">
        <h1 className="text-2xl font-light">Product Not Found</h1>
        <p className="text-xs text-[#777777] mt-2">
          The requested garment does not exist or may have been unlisted.
        </p>
        <Link
          href="/shop"
          className="inline-block mt-6 bg-[#111111] text-white px-8 py-3 text-xs uppercase font-semibold tracking-wider hover:bg-[#333333]"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size to continue.');
      return;
    }

    if (stockAvailable <= 0) {
      toast.error('This size is currently out of stock.');
      return;
    }

    addToCart({
      id: `${product.id}-${activeColor?.id || 'default'}-${selectedSize}`,
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: activeColor?.image || product.images[0],
      price: product.price,
      originalPrice: product.originalPrice,
      color: activeColor || { id: 'default', name: 'Default', hex: '#000' },
      size: selectedSize,
      quantity,
      stock: stockAvailable,
    });

    toast.success(`Added ${quantity} x ${product.name} (${selectedSize}) to your bag.`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error('Please fill in your name and review comment.');
      return;
    }

    setIsSubmittingReview(true);
    addReview({
      productId: product.id,
      productName: product.name,
      customerName: reviewName.trim(),
      customerEmail: reviewEmail.trim() || 'shopper@example.com',
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    toast.success('Your review has been submitted for moderation and will appear once approved.');
    setReviewComment('');
    setReviewName('');
    setReviewEmail('');
    setIsSubmittingReview(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Breadcrumbs */}
      <nav className="text-xs text-[#777777] mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-[#111111] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#111111] transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-[#111111] truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout with Sticky Purchase Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible flex-shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-22 sm:w-20 sm:h-28 flex-shrink-0 bg-[#F5F4F0] border transition-all ${
                    activeImage === img ? 'border-[#111111]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`${product.name} view ${idx + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image */}
          <div className="relative aspect-[3/4] flex-1 bg-[#F5F4F0] overflow-hidden">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            {product.sale && (
              <span className="absolute top-4 left-4 bg-[#B74747] text-white text-[11px] uppercase font-bold tracking-wider px-3 py-1">
                Sale
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Product Info & Purchase (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="border-b border-[#E5E5E5] pb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-[#777777] font-mono">
                {product.sku}
              </span>
              {approvedReviews.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Star className="w-3.5 h-3.5 fill-[#111111] text-[#111111]" />
                  <span className="font-semibold">{averageRating}</span>
                  <span className="text-[#777777]">({approvedReviews.length})</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-normal tracking-tight text-[#111111]">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xl sm:text-2xl font-normal text-[#111111]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-[#777777] line-through font-normal">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-xs text-[#B74747] font-semibold bg-[#FBEAEA] px-2 py-0.5">
                  Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            <p className="text-sm sm:text-[15px] text-[#555555] leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#777777] uppercase tracking-wider">Colour</span>
                <span className="font-medium text-[#111111]">{activeColor?.name}</span>
              </div>
              <div className="flex gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c);
                      if (c.image) setSelectedImage(c.image);
                    }}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                      activeColor?.id === c.id
                        ? 'border-[#111111] ring-1 ring-[#111111] ring-offset-2'
                        : 'border-black/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {activeColor?.id === c.id && (
                      <Check
                        className={`w-4 h-4 ${
                          c.hex.toLowerCase() === '#ffffff' || c.hex.toLowerCase() === '#f9f9f9'
                            ? 'text-black'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#777777] uppercase tracking-wider">Select Size</span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-xs text-[#111111] hover:underline flex items-center gap-1"
              >
                <Ruler className="w-3.5 h-3.5" /> Size Guide
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map((s) => {
                const isOutOfStock = s.stock <= 0;
                const isSelected = selectedSize === s.label;
                return (
                  <button
                    key={s.id}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSize(s.label)}
                    className={`py-3 text-xs uppercase font-medium border text-center transition-all ${
                      isOutOfStock
                        ? 'bg-[#F5F4F0] text-[#A0A0A0] border-[#E5E5E5] line-through cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'border-[#E5E5E5] text-[#111111] hover:border-[#111111]'
                    }`}
                  >
                    {s.label}
                    {s.stock > 0 && s.stock <= 3 && (
                      <span className="block text-[9px] text-[#B74747] font-normal">
                        Only {s.stock} left
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedSize && (
              <p className="text-xs text-[#477A5A] mt-2 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock ({stockAvailable} units available)
              </p>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E5E5E5] h-12">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 text-[#111111] disabled:text-[#CCCCCC]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-semibold font-mono w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={selectedSize ? quantity >= stockAvailable : false}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 text-[#111111] disabled:text-[#CCCCCC]"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-[#111111] text-white h-12 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#2A2A2A] active:scale-[0.99] transition-all"
              >
                Add to Bag
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product.id);
                  toast(isInWishlist ? 'Removed from wishlist' : 'Saved to wishlist');
                }}
                className={`h-12 w-12 border flex items-center justify-center transition-colors ${
                  isInWishlist
                    ? 'border-[#B74747] text-[#B74747]'
                    : 'border-[#E5E5E5] text-[#111111] hover:border-[#111111]'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 stroke-[1.5] ${isInWishlist ? 'fill-[#B74747]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Accordion Sections: Details, Materials, Delivery */}
          <div className="border-t border-[#E5E5E5] pt-4 divide-y divide-[#E5E5E5] text-xs">
            {/* Details */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                className="w-full flex justify-between items-center text-left uppercase font-semibold tracking-wider text-[#111111]"
              >
                <span>Details & Features</span>
                {openAccordion === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'details' && (
                <div className="pt-3 text-[#555555] space-y-1.5 animate-in fade-in duration-150">
                  {product.details?.map((detail, idx) => (
                    <p key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#111111] rounded-full" />
                      {detail}
                    </p>
                  ))}
                  <p className="mt-2 text-[#777777]">Gender cut: {product.gender || 'Unisex'}</p>
                </div>
              )}
            </div>

            {/* Materials & Care */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'materials' ? null : 'materials')}
                className="w-full flex justify-between items-center text-left uppercase font-semibold tracking-wider text-[#111111]"
              >
                <span>Composition & Care</span>
                {openAccordion === 'materials' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'materials' && (
                <div className="pt-3 text-[#555555] leading-relaxed animate-in fade-in duration-150">
                  <p>{product.materials || '100% Sustainable fiber. Specialist care recommended.'}</p>
                  <p className="mt-1 text-[#777777]">Designed in London, consciously manufactured in Portugal.</p>
                </div>
              )}
            </div>

            {/* Delivery & Returns */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'delivery' ? null : 'delivery')}
                className="w-full flex justify-between items-center text-left uppercase font-semibold tracking-wider text-[#111111]"
              >
                <span>Delivery & Complimentary Returns</span>
                {openAccordion === 'delivery' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'delivery' && (
                <div className="pt-3 text-[#555555] space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-[#111111] flex-shrink-0 mt-0.5" />
                    <p>Free standard shipping on orders over $200. Dispatched in plastic-free recycled packaging.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <RotateCcw className="w-4 h-4 text-[#111111] flex-shrink-0 mt-0.5" />
                    <p>30-day effortless returns policy. Prepaid return labels included with domestic deliveries.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-24 pt-12 border-t border-[#E5E5E5]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777777]">Verified Impressions</span>
            <h2 className="text-2xl font-light text-[#111111] mt-1">
              Customer Reviews ({approvedReviews.length})
            </h2>
            <div className="flex items-center gap-2.5 mt-2">
              <div className="flex text-[#111111]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i <= Math.round(Number(averageRating)) ? 'fill-[#111111]' : 'text-[#E5E5E5]'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold">{averageRating} out of 5 stars</span>
            </div>
          </div>

          {/* Leave a review form */}
          <div className="bg-[#F5F4F0] p-6 max-w-md w-full border border-[#E5E5E5]">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#111111] mb-2">
              Write an Editorial Review
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-[#777777] block mb-1">Your Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${s <= reviewRating ? 'fill-[#111111] text-[#111111]' : 'text-[#CCCCCC]'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder="Your Name *"
                required
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full bg-white px-3 py-2 text-xs border border-[#E5E5E5] outline-none"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={reviewEmail}
                onChange={(e) => setReviewEmail(e.target.value)}
                className="w-full bg-white px-3 py-2 text-xs border border-[#E5E5E5] outline-none"
              />
              <textarea
                placeholder="How does the fabric feel? How is the silhouette and cut? *"
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-white px-3 py-2 text-xs border border-[#E5E5E5] outline-none resize-none"
              />
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-[#111111] text-white py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-[#333333]"
              >
                Submit Review
              </button>
              <p className="text-[10px] text-[#777777] text-center">
                Reviews are reviewed by editorial moderators before publication.
              </p>
            </form>
          </div>
        </div>

        {/* Reviews List */}
        {approvedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedReviews.map((rev) => (
              <div key={rev.id} className="p-6 border border-[#E5E5E5] space-y-2.5 bg-white">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-xs text-[#111111]">{rev.customerName}</span>
                  <span className="text-[11px] text-[#777777]">{formatDate(rev.createdAt)}</span>
                </div>
                <div className="flex gap-0.5 text-[#111111]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i <= rev.rating ? 'fill-[#111111]' : 'text-[#E5E5E5]'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#555555] leading-relaxed pt-1">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#777777] italic">No approved reviews yet. Be the first to review this garment.</p>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-12 border-t border-[#E5E5E5]">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest text-[#777777]">Complete The Look</span>
            <h2 className="text-2xl font-light text-[#111111] mt-1">You May Also Admire</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Advanced Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 border border-[#E5E5E5] relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-4 right-4 p-1 text-[#777777] hover:text-[#111111]"
            >
              &times;
            </button>
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-xs uppercase tracking-widest font-semibold">
                Size & Fit Blueprint
              </h3>
              <div className="flex bg-[#F5F4F0] p-0.5 text-[10px]">
                <button
                  onClick={() => setSizeUnit('cm')}
                  className={`px-2.5 py-0.5 font-medium ${sizeUnit === 'cm' ? 'bg-white shadow-xs font-bold' : ''}`}
                >
                  CM
                </button>
                <button
                  onClick={() => setSizeUnit('in')}
                  className={`px-2.5 py-0.5 font-medium ${sizeUnit === 'in' ? 'bg-white shadow-xs font-bold' : ''}`}
                >
                  IN
                </button>
              </div>
            </div>

            <p className="text-xs text-[#777777] mb-4 leading-relaxed">
              Our tailoring embodies a relaxed Scandinavian proportion. For a sharper contoured fit, select one size below your usual tag.
            </p>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#111111]">
                  <th className="py-2">Standard</th>
                  <th className="py-2">Chest ({sizeUnit})</th>
                  <th className="py-2">Waist ({sizeUnit})</th>
                  <th className="py-2">Hips ({sizeUnit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-[#555555]">
                <tr>
                  <td className="py-2 font-medium">XS / 34</td>
                  <td>{sizeUnit === 'cm' ? '82-86' : '32-34'}</td>
                  <td>{sizeUnit === 'cm' ? '64-68' : '25-27'}</td>
                  <td>{sizeUnit === 'cm' ? '90-94' : '35-37'}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">S / 36</td>
                  <td>{sizeUnit === 'cm' ? '86-90' : '34-36'}</td>
                  <td>{sizeUnit === 'cm' ? '68-72' : '27-29'}</td>
                  <td>{sizeUnit === 'cm' ? '94-98' : '37-39'}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">M / 38</td>
                  <td>{sizeUnit === 'cm' ? '90-96' : '36-38'}</td>
                  <td>{sizeUnit === 'cm' ? '72-78' : '29-31'}</td>
                  <td>{sizeUnit === 'cm' ? '98-104' : '39-41'}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">L / 40</td>
                  <td>{sizeUnit === 'cm' ? '96-102' : '38-40'}</td>
                  <td>{sizeUnit === 'cm' ? '78-84' : '31-33'}</td>
                  <td>{sizeUnit === 'cm' ? '104-110' : '41-43'}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">XL / 42</td>
                  <td>{sizeUnit === 'cm' ? '102-108' : '40-42'}</td>
                  <td>{sizeUnit === 'cm' ? '84-90' : '33-35'}</td>
                  <td>{sizeUnit === 'cm' ? '110-116' : '43-45'}</td>
                </tr>
              </tbody>
            </table>

            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="mt-6 w-full bg-[#111111] text-white py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-[#333333]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
