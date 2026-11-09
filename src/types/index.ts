export type ProductStatus = 'active' | 'draft' | 'out_of_stock';

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  image?: string;
}

export interface ProductSize {
  id: string;
  label: string;
  stock: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  colorId: string;
  sizeId: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  details?: string[];
  materials?: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  images: string[];
  colors: ProductColor[];
  sizes: ProductSize[];
  variants?: ProductVariant[];
  status: ProductStatus;
  featured: boolean;
  bestSeller: boolean;
  newArrival?: boolean;
  sale?: boolean;
  gender?: 'women' | 'men' | 'unisex';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: 'active' | 'inactive';
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  color: ProductColor;
  size: string;
  quantity: number;
  stock: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  ward: string;
  isDefault?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive';
  addresses: Address[];
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'Unpaid' | 'Paid' | 'Refunded';

export type PaymentMethod = 'cod' | 'bank_transfer' | 'online_simulation';

export interface OrderItem {
  productId: string;
  productName: string;
  slug: string;
  image: string;
  price: number;
  colorName: string;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  deliveryMethod: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  shippingFee: number;
  total: number;
  notes?: string;
  createdAt: string;
  statusHistory?: { status: OrderStatus; timestamp: string; note?: string }[];
}

export type DiscountType = 'percentage' | 'fixed';

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'hidden';
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  variantInfo: string;
  change: number;
  previousStock: number;
  newStock: number;
  reason: string;
  date: string;
}

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  shippingFee: number;
  freeShippingThreshold: number;
  currency: string;
  announcementText: string;
  lowStockThreshold: number;
}
