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

interface ProductDetailClientProps {
  slug: string;
}

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
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
      toast.error('Please choose your size before adding to bag.');
      return;
    }

    if (stockAvailable <= 0) {
      toast.error(`Size ${selectedSize} is currently out of stock.`);
      return;
    }

    addToCart({
      id: `${product.id}-${activeColor?.id || 'default'}-${selectedSize}`,
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: activeImage || product.images[0],
      price: product.price,
      originalPrice: product.originalPrice,
      color: activeColor || { id: 'c-default', name: 'Default', hex: '#111111' },
      size: selectedSize,
      quantity,
      stock: stockAvailable,
    });

    toast.success(`Added ${quantity}x "${product.name}" (${selectedSize}) to bag.`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error('Please complete required fields.');
      return;
    }

    setIsSubmittingReview(true);
    setTimeout(() => {
      addReview({
        productId: product.id,
        productName: product.name,
        customerName: reviewName,
        customerEmail: reviewEmail || 'customer@example.com',
        rating: reviewRating,
        comment: reviewComment,
      });

      setIsSubmittingReview(false);
      setReviewName('');
      setReviewEmail('');
      setReviewComment('');
      toast.success('Thank you! Your feedback has been queued for moderation.');
    }, 400);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#777777]">
        <Link href="/" className="hover:text-[#111111]">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#111111]">Shop</Link>
        <span>/</span>
        <span className="text-[#111111] font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery (7 cols) + Purchase Info (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Left Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails column */}
          {product.images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-28 md:w-22 md:h-30 flex-shrink-0 border transition-all ${
                    activeImage === img ? 'border-[#111111]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`${product.name} perspective ${idx + 1}`} fill className="object-cover" sizes="90px" />
                </button>
              ))}
            </div>
          )}

          {/* Primary View */}
          <div className="relative aspect-[3/4] w-full bg-[#F5F4F0] overflow-hidden flex-1">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            {product.sale && (
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#9E3A3A] border border-[#9E3A3A]/25 text-[10px] uppercase font-medium tracking-[0.2em] px-3 py-1 rounded-full shadow-xs">
                Sale
              </span>
            )}
          </div>
        </div>

        {/* Right Purchase Column */}
        <div className="lg:col-span-5 space-y-6">
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
                {formatPrice(product.price, currency)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-[#777777] line-through font-normal">
                  {formatPrice(product.originalPrice, currency)}
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
                  </button>
                );
              })}
            </div>

            {selectedSize && (
              <p className="text-[11px] text-[#777777] mt-2">
                {stockAvailable > 5 ? (
                  <span className="text-[#477A5A]">In stock — ready for dispatch</span>
                ) : stockAvailable > 0 ? (
                  <span className="text-[#B74747]">Only {stockAvailable} left in size {selectedSize}</span>
                ) : (
                  <span className="text-[#B74747]">Out of stock</span>
                )}
              </p>
            )}
          </div>

          {/* Quantity & CTA */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <div className="flex items-center border border-[#E5E5E5] h-12 px-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 hover:text-[#777777]"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-semibold font-mono w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(stockAvailable || 10, q + 1))}
                  className="p-1 hover:text-[#777777]"
                  disabled={selectedSize ? quantity >= stockAvailable : false}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={selectedSize ? stockAvailable <= 0 : false}
                className="flex-1 bg-[#111111] text-white h-12 text-xs uppercase tracking-[0.16em] font-semibold hover:bg-[#333333] transition-colors disabled:bg-[#CCCCCC] disabled:cursor-not-allowed"
              >
                {selectedSize && stockAvailable <= 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product.id);
                  if (!isInWishlist) toast.success('Saved to wishlist.');
                  else toast.info('Removed from wishlist.');
                }}
                className={`h-12 w-12 border flex items-center justify-center transition-colors ${
                  isInWishlist
                    ? 'border-[#B74747] text-[#B74747]'
                    : 'border-[#E5E5E5] text-[#111111] hover:border-[#111111]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-[#B74747]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Pills */}
          <div className="border-t border-[#E5E5E5] pt-4 space-y-2 text-xs text-[#555555]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#111111]" />
              <span>Complimentary standard delivery on orders over {formatPrice(100, currency)}</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#111111]" />
              <span>30-day effortless returns and exchanges</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#111111]" />
              <span>Crafted from certified responsible natural fibers</span>
            </div>
          </div>

          {/* Accordion Specs */}
          <div className="border-t border-[#E5E5E5] divide-y divide-[#E5E5E5]">
            <div>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                className="w-full py-4 flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-[#111111]"
              >
                <span>Product Details & Cut</span>
                {openAccordion === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'details' && (
                <div className="pb-4 text-xs text-[#555555] space-y-2 leading-relaxed">
                  <ul className="list-disc pl-4 space-y-1">
                    {(product.details || []).map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                  <p className="pt-2 text-[11px] text-[#777777]">
                    Model is 178cm / 5&apos;10&quot; wearing size S.
                  </p>
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'materials' ? null : 'materials')}
                className="w-full py-4 flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-[#111111]"
              >
                <span>Materials & Garment Care</span>
                {openAccordion === 'materials' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'materials' && (
                <div className="pb-4 text-xs text-[#555555] space-y-2 leading-relaxed">
                  <p>{product.materials}</p>
                  <p className="text-[11px] text-[#777777]">
                    Dry clean or gentle cycle inside out. Reshape while damp. Do not tumble dry.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Social Proof Section */}
      <section className="mt-20 border-t border-[#E5E5E5] pt-12">
        <div className="max-w-3xl">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-light text-[#111111]">
                Customer Reviews
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(Number(averageRating))
                          ? 'fill-[#111111] text-[#111111]'
                          : 'text-[#E5E5E5]'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-sm">{averageRating}</span>
                <span className="text-[#777777]">({approvedReviews.length} approved ratings)</span>
              </div>
            </div>
          </div>

          {/* Existing Reviews */}
          <div className="space-y-6 divide-y divide-[#E5E5E5]">
            {approvedReviews.map((r) => (
              <div key={r.id} className="pt-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#111111]">{r.customerName}</span>
                    <span className="text-[10px] bg-[#EAF3ED] text-[#477A5A] px-1.5 py-0.5 uppercase tracking-wider font-bold">
                      Verified Client
                    </span>
                  </div>
                  <span className="text-[#777777]">{formatDate(r.createdAt)}</span>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= r.rating ? 'fill-[#111111] text-[#111111]' : 'text-[#E5E5E5]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">{r.comment}</p>
              </div>
            ))}

            {approvedReviews.length === 0 && (
              <p className="text-xs text-[#777777] py-4">
                No customer reviews yet. Be the first to share your experience with this garment.
              </p>
            )}
          </div>

          {/* Submission Form */}
          <div className="mt-12 bg-[#F5F4F0] p-6 space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
              Write a Garment Review
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#777777] mb-1">Your Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          s <= reviewRating
                            ? 'fill-[#111111] text-[#111111]'
                            : 'text-[#CCCCCC]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#777777] mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="e.g. Elena V."
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#777777] mb-1">Email</label>
                  <input
                    type="email"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    placeholder="Optional for verification"
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#777777] mb-1">Comment & Fit Details *</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details on texture, silhouette drape, and sizing fidelity..."
                  className="w-full bg-white border border-[#E5E5E5] p-3 outline-none focus:border-[#111111]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="bg-[#111111] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-[#333333] transition-colors"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit for Review'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-[#E5E5E5] pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-light text-[#111111]">
              Complementary Silhouette
            </h2>
            <Link
              href={`/shop?category=${product.categoryId}`}
              className="text-xs uppercase tracking-wider font-semibold hover:underline"
            >
              View Collection &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 border border-[#E5E5E5] animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-4">
              <h3 className="text-sm uppercase tracking-widest font-semibold text-[#111111]">
                Size & Fit Blueprint
              </h3>
              <div className="flex border border-[#111111] text-xs">
                <button
                  type="button"
                  onClick={() => setSizeUnit('cm')}
                  className={`px-3 py-1 font-semibold transition-colors ${
                    sizeUnit === 'cm' ? 'bg-[#111111] text-white' : 'text-[#111111]'
                  }`}
                >
                  CM
                </button>
                <button
                  type="button"
                  onClick={() => setSizeUnit('in')}
                  className={`px-3 py-1 font-semibold transition-colors ${
                    sizeUnit === 'in' ? 'bg-[#111111] text-white' : 'text-[#111111]'
                  }`}
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
