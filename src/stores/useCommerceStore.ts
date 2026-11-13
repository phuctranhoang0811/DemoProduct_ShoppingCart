'use client';

import { create } from 'zustand';
import {
  Product,
  Category,
  CartItem,
  Order,
  Customer,
  Discount,
  Review,
  InventoryMovement,
  StoreSettings,
  OrderStatus,
  PaymentStatus,
  Address,
} from '@/types';
import {
  HellobeeMember,
  CommissionTransaction,
  PayoutRequest,
  HellobeeRole,
  RankLevel,
  PayoutStatus,
} from '@/types/hellobee';
import { initialProducts } from '@/data/products';
import { initialCategories } from '@/data/categories';
import { initialCustomers } from '@/data/customers';
import { initialOrders } from '@/data/orders';
import { initialDiscounts } from '@/data/discounts';
import { initialReviews } from '@/data/reviews';
import { initialInventoryMovements } from '@/data/inventory';
import { initialSettings } from '@/data/settings';
import {
  initialHellobeeMembers,
  initialCommissionTransactions,
  initialPayoutRequests,
} from '@/data/hellobeeMembers';
import { generateId } from '@/lib/utils';

const STORAGE_KEYS = {
  products: 'enagic_kangen_products_v2',
  categories: 'enagic_kangen_categories_v2',
  cart: 'enagic_kangen_cart_v2',
  wishlist: 'enagic_kangen_wishlist_v2',
  orders: 'enagic_kangen_orders_v2',
  customers: 'enagic_kangen_customers_v2',
  discounts: 'enagic_kangen_discounts_v2',
  reviews: 'enagic_kangen_reviews_v2',
  inventory: 'enagic_kangen_inventory_v2',
  settings: 'enagic_kangen_settings_v2',
  session: 'enagic_kangen_session_v2',
  currency: 'enagic_kangen_currency_v2',
  language: 'enagic_kangen_language_v2',
  hellobeeMembers: 'hellobee_members_v1',
  commissions: 'hellobee_commissions_v1',
  payouts: 'hellobee_payouts_v1',
  activeMemberId: 'hellobee_active_member_v1',
};

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to set ${key} in localStorage`, e);
  }
}

interface CommerceState {
  isHydrated: boolean;
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  customers: Customer[];
  discounts: Discount[];
  reviews: Review[];
  inventoryMovements: InventoryMovement[];
  settings: StoreSettings;
  currentUser: Customer | null;
  currency: 'USD' | 'VND';
  language: 'vi' | 'en';
  isCartDrawerOpen: boolean;

  initHydrate: () => void;
  resetDemoData: () => void;
  setCurrency: (currency: 'USD' | 'VND') => void;
  setLanguage: (language: 'vi' | 'en') => void;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Products
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkDeleteProducts: (ids: string[]) => void;

  // Categories
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Cart
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;

  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  toggleCustomerStatus: (id: string) => void;

  // Discounts
  addDiscount: (discount: Omit<Discount, 'id' | 'usedCount'>) => void;
  updateDiscount: (id: string, updates: Partial<Discount>) => void;
  deleteDiscount: (id: string) => void;
  validateDiscount: (code: string, subtotal: number) => {
    valid: boolean;
    discount?: Discount;
    discountAmount: number;
    error?: string;
  };

  // Reviews
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'status'>) => void;
  updateReviewStatus: (id: string, status: 'approved' | 'pending' | 'hidden') => void;
  deleteReview: (id: string) => void;

  // Inventory
  adjustStock: (productId: string, sizeLabel: string, change: number, reason: string) => void;

  // Settings
  updateSettings: (updates: Partial<StoreSettings>) => void;

  // Auth / Session
  loginAsDemo: () => void;
  loginWithEmail: (email: string) => boolean;
  register: (name: string, email: string, phone: string) => Customer;
  logout: () => void;
  updateProfile: (updates: Partial<Customer>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;

  // Hellobee Network & Commission System
  hellobeeMembers: HellobeeMember[];
  commissions: CommissionTransaction[];
  payouts: PayoutRequest[];
  activeMemberId: string;
  setActiveMemberId: (id: string) => void;
  registerHellobeeMember: (data: {
    name: string;
    email: string;
    phone?: string;
    role: HellobeeRole;
    sponsorCode?: string;
  }) => HellobeeMember;
  recordReferralOrder: (
    orderId: string,
    orderNumber: string,
    orderAmount: number,
    buyerName: string,
    referralCode?: string
  ) => {
    success: boolean;
    commissionsAwarded: CommissionTransaction[];
    upgrades: { memberName: string; oldRank: string; newRank: string }[];
  };
  requestPayout: (
    memberId: string,
    amount: number,
    bankName: string,
    bankAccountNumber: string,
    bankAccountName: string
  ) => PayoutRequest;
  updatePayoutStatus: (payoutId: string, status: PayoutStatus) => void;
}

export const useCommerceStore = create<CommerceState>((set, get) => ({
  isHydrated: false,
  products: initialProducts,
  categories: initialCategories,
  cart: [],
  wishlist: [],
  orders: initialOrders,
  customers: initialCustomers,
  discounts: initialDiscounts,
  reviews: initialReviews,
  inventoryMovements: initialInventoryMovements,
  settings: initialSettings,
  currentUser: null,
  currency: 'USD',
  language: 'en',
  isCartDrawerOpen: false,

  // Hellobee initial state
  hellobeeMembers: initialHellobeeMembers,
  commissions: initialCommissionTransactions,
  payouts: initialPayoutRequests,
  activeMemberId: 'usr_owner_01', // Default to Managing Owner
  setActiveMemberId: (activeMemberId) => {
    set({ activeMemberId });
    setStorageItem(STORAGE_KEYS.activeMemberId, activeMemberId);
  },

  setCurrency: (currency) => {
    set({ currency });
    setStorageItem(STORAGE_KEYS.currency, currency);
  },
  setLanguage: (language) => {
    set({ language });
    setStorageItem(STORAGE_KEYS.language, language);
  },
  setIsCartDrawerOpen: (isCartDrawerOpen) => set({ isCartDrawerOpen }),

  initHydrate: () => {
    if (typeof window === 'undefined') return;

    const products = getStorageItem<Product[]>(STORAGE_KEYS.products, initialProducts);
    const categories = getStorageItem<Category[]>(STORAGE_KEYS.categories, initialCategories);
    const cart = getStorageItem<CartItem[]>(STORAGE_KEYS.cart, []);
    const wishlist = getStorageItem<string[]>(STORAGE_KEYS.wishlist, ['kangen-k8', 'kangen-sd501']);
    const orders = getStorageItem<Order[]>(STORAGE_KEYS.orders, initialOrders);
    const customers = getStorageItem<Customer[]>(STORAGE_KEYS.customers, initialCustomers);
    const discounts = getStorageItem<Discount[]>(STORAGE_KEYS.discounts, initialDiscounts);
    const reviews = getStorageItem<Review[]>(STORAGE_KEYS.reviews, initialReviews);
    const inventory = getStorageItem<InventoryMovement[]>(STORAGE_KEYS.inventory, initialInventoryMovements);
    const settings = getStorageItem<StoreSettings>(STORAGE_KEYS.settings, initialSettings);
    const sessionUser = getStorageItem<Customer | null>(STORAGE_KEYS.session, initialCustomers[0]);
    const currency = getStorageItem<'USD' | 'VND'>(STORAGE_KEYS.currency, 'USD');
    const language = getStorageItem<'vi' | 'en'>(STORAGE_KEYS.language, 'en');
    const hellobeeMembers = getStorageItem<HellobeeMember[]>(
      STORAGE_KEYS.hellobeeMembers,
      initialHellobeeMembers
    );
    const commissions = getStorageItem<CommissionTransaction[]>(
      STORAGE_KEYS.commissions,
      initialCommissionTransactions
    );
    const payouts = getStorageItem<PayoutRequest[]>(
      STORAGE_KEYS.payouts,
      initialPayoutRequests
    );
    const activeMemberId = getStorageItem<string>(
      STORAGE_KEYS.activeMemberId,
      'usr_owner_01'
    );

    set({
      isHydrated: true,
      products,
      categories,
      cart,
      wishlist,
      orders,
      customers,
      discounts,
      reviews,
      inventoryMovements: inventory,
      settings,
      currentUser: sessionUser,
      currency: 'USD',
      language: 'en',
      hellobeeMembers,
      commissions,
      payouts,
      activeMemberId,
    });
  },

  resetDemoData: () => {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    }
    const defaultUser = initialCustomers[0];
    set({
      products: initialProducts,
      categories: initialCategories,
      cart: [],
      wishlist: ['kangen-k8', 'kangen-sd501'],
      orders: initialOrders,
      customers: initialCustomers,
      discounts: initialDiscounts,
      reviews: initialReviews,
      inventoryMovements: initialInventoryMovements,
      settings: initialSettings,
      currentUser: defaultUser,
      currency: 'USD',
      language: 'en',
      hellobeeMembers: initialHellobeeMembers,
      commissions: initialCommissionTransactions,
      payouts: initialPayoutRequests,
      activeMemberId: 'usr_owner_01',
    });
    setStorageItem(STORAGE_KEYS.products, initialProducts);
    setStorageItem(STORAGE_KEYS.categories, initialCategories);
    setStorageItem(STORAGE_KEYS.orders, initialOrders);
    setStorageItem(STORAGE_KEYS.customers, initialCustomers);
    setStorageItem(STORAGE_KEYS.discounts, initialDiscounts);
    setStorageItem(STORAGE_KEYS.reviews, initialReviews);
    setStorageItem(STORAGE_KEYS.inventory, initialInventoryMovements);
    setStorageItem(STORAGE_KEYS.settings, initialSettings);
    setStorageItem(STORAGE_KEYS.session, defaultUser);
  },

  // PRODUCTS
  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: generateId('prod'),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [newProduct, ...state.products];
      setStorageItem(STORAGE_KEYS.products, updated);
      return { products: updated };
    });
  },

  updateProduct: (id, updates) => {
    set((state) => {
      const updated = state.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
      setStorageItem(STORAGE_KEYS.products, updated);

      // Also sync cart if title or price changed
      const updatedCart = state.cart.map((item) => {
        if (item.productId === id) {
          return {
            ...item,
            productName: updates.name ?? item.productName,
            price: updates.price ?? item.price,
            originalPrice: updates.originalPrice ?? item.originalPrice,
          };
        }
        return item;
      });
      setStorageItem(STORAGE_KEYS.cart, updatedCart);

      return { products: updated, cart: updatedCart };
    });
  },

  deleteProduct: (id) => {
    set((state) => {
      const updated = state.products.filter((p) => p.id !== id);
      const updatedCart = state.cart.filter((item) => item.productId !== id);
      const updatedWishlist = state.wishlist.filter((pid) => pid !== id);

      setStorageItem(STORAGE_KEYS.products, updated);
      setStorageItem(STORAGE_KEYS.cart, updatedCart);
      setStorageItem(STORAGE_KEYS.wishlist, updatedWishlist);

      return {
        products: updated,
        cart: updatedCart,
        wishlist: updatedWishlist,
      };
    });
  },

  bulkDeleteProducts: (ids) => {
    const idSet = new Set(ids);
    set((state) => {
      const updated = state.products.filter((p) => !idSet.has(p.id));
      const updatedCart = state.cart.filter((item) => !idSet.has(item.productId));
      const updatedWishlist = state.wishlist.filter((pid) => !idSet.has(pid));

      setStorageItem(STORAGE_KEYS.products, updated);
      setStorageItem(STORAGE_KEYS.cart, updatedCart);
      setStorageItem(STORAGE_KEYS.wishlist, updatedWishlist);

      return {
        products: updated,
        cart: updatedCart,
        wishlist: updatedWishlist,
      };
    });
  },

  // CATEGORIES
  addCategory: (categoryData) => {
    const newCategory: Category = {
      ...categoryData,
      id: generateId('cat'),
    };
    set((state) => {
      const updated = [...state.categories, newCategory];
      setStorageItem(STORAGE_KEYS.categories, updated);
      return { categories: updated };
    });
  },

  updateCategory: (id, updates) => {
    set((state) => {
      const updated = state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
      setStorageItem(STORAGE_KEYS.categories, updated);
      return { categories: updated };
    });
  },

  deleteCategory: (id) => {
    set((state) => {
      const updated = state.categories.filter((c) => c.id !== id);
      setStorageItem(STORAGE_KEYS.categories, updated);
      return { categories: updated };
    });
  },

  // CART
  addToCart: (item) => {
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (c) => c.productId === item.productId && c.size === item.size && c.color.id === item.color.id
      );

      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = state.cart.map((c, idx) => {
          if (idx === existingIndex) {
            const newQty = Math.min(c.quantity + item.quantity, c.stock);
            return { ...c, quantity: newQty };
          }
          return c;
        });
      } else {
        updated = [...state.cart, item];
      }

      setStorageItem(STORAGE_KEYS.cart, updated);
      return { cart: updated, isCartDrawerOpen: true };
    });
  },

  updateCartQuantity: (cartItemId, quantity) => {
    set((state) => {
      let updated: CartItem[];
      if (quantity <= 0) {
        updated = state.cart.filter((c) => c.id !== cartItemId);
      } else {
        updated = state.cart.map((c) => {
          if (c.id === cartItemId) {
            const safeQty = Math.min(quantity, c.stock);
            return { ...c, quantity: safeQty };
          }
          return c;
        });
      }
      setStorageItem(STORAGE_KEYS.cart, updated);
      return { cart: updated };
    });
  },

  removeFromCart: (cartItemId) => {
    set((state) => {
      const updated = state.cart.filter((c) => c.id !== cartItemId);
      setStorageItem(STORAGE_KEYS.cart, updated);
      return { cart: updated };
    });
  },

  clearCart: () => {
    setStorageItem(STORAGE_KEYS.cart, []);
    set({ cart: [] });
  },

  // WISHLIST
  toggleWishlist: (productId) => {
    set((state) => {
      const exists = state.wishlist.includes(productId);
      const updated = exists
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId];
      setStorageItem(STORAGE_KEYS.wishlist, updated);
      return { wishlist: updated };
    });
  },

  isInWishlist: (productId) => {
    return get().wishlist.includes(productId);
  },

  // ORDERS
  createOrder: (orderData) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    const state = get();

    // Deduct variant and size stock from products
    const updatedProducts = state.products.map((p) => {
      let productModified = false;
      const updatedSizes = p.sizes.map((s) => {
        const itemOrdered = newOrder.items.find((it) => it.productId === p.id && it.size === s.label);
        if (itemOrdered) {
          productModified = true;
          return { ...s, stock: Math.max(0, s.stock - itemOrdered.quantity) };
        }
        return s;
      });

      if (!productModified) return p;

      const totalStock = updatedSizes.reduce((sum, sz) => sum + sz.stock, 0);
      return {
        ...p,
        sizes: updatedSizes,
        status: totalStock === 0 ? 'out_of_stock' : p.status,
      };
    });

    // Record inventory movements
    const movements: InventoryMovement[] = newOrder.items.map((it) => ({
      id: generateId('inv'),
      productId: it.productId,
      productName: it.productName,
      variantInfo: `${it.colorName} / ${it.size}`,
      change: -it.quantity,
      previousStock: 0,
      newStock: 0,
      reason: `Order ${newOrder.id} placed`,
      date: newOrder.createdAt,
    }));

    // Update discount usage if code was used
    let updatedDiscounts = state.discounts;
    if (newOrder.discountCode) {
      updatedDiscounts = state.discounts.map((d) =>
        d.code.toUpperCase() === newOrder.discountCode?.toUpperCase()
          ? { ...d, usedCount: d.usedCount + 1 }
          : d
      );
      setStorageItem(STORAGE_KEYS.discounts, updatedDiscounts);
    }

    const updatedOrders = [newOrder, ...state.orders];
    const updatedMovements = [...movements, ...state.inventoryMovements];

    setStorageItem(STORAGE_KEYS.orders, updatedOrders);
    setStorageItem(STORAGE_KEYS.products, updatedProducts);
    setStorageItem(STORAGE_KEYS.inventory, updatedMovements);
    setStorageItem(STORAGE_KEYS.cart, []);

    // Update customer totalOrders and totalSpent if known
    let updatedCustomers = state.customers;
    const custIdx = state.customers.findIndex((c) => c.email.toLowerCase() === newOrder.customerEmail.toLowerCase());
    if (custIdx > -1) {
      updatedCustomers = state.customers.map((c, i) =>
        i === custIdx
          ? {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + newOrder.total,
            }
          : c
      );
      setStorageItem(STORAGE_KEYS.customers, updatedCustomers);
    }

    set({
      orders: updatedOrders,
      products: updatedProducts,
      inventoryMovements: updatedMovements,
      discounts: updatedDiscounts,
      customers: updatedCustomers,
      cart: [],
    });

    // If referral code is used, process commissions and rank updates
    if (newOrder.referralCode) {
      get().recordReferralOrder(
        newOrder.id,
        newOrder.id,
        newOrder.total,
        newOrder.customerName,
        newOrder.referralCode
      );
    }

    return newOrder;
  },

  updateOrderStatus: (orderId, status, note) => {
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;

      // Handle stock restoration if order was just cancelled
      let updatedProducts = state.products;
      let updatedMovements = state.inventoryMovements;

      if (status === 'Cancelled' && order.status !== 'Cancelled') {
        updatedProducts = state.products.map((p) => {
          let modified = false;
          const updatedSizes = p.sizes.map((s) => {
            const item = order.items.find((it) => it.productId === p.id && it.size === s.label);
            if (item) {
              modified = true;
              return { ...s, stock: s.stock + item.quantity };
            }
            return s;
          });
          if (!modified) return p;
          return {
            ...p,
            sizes: updatedSizes,
            status: p.status === 'out_of_stock' ? 'active' : p.status,
          };
        });

        const cancelMovements: InventoryMovement[] = order.items.map((it) => ({
          id: generateId('inv'),
          productId: it.productId,
          productName: it.productName,
          variantInfo: `${it.colorName} / ${it.size}`,
          change: +it.quantity,
          previousStock: 0,
          newStock: 0,
          reason: `Restock from cancelled order ${order.id}`,
          date: new Date().toISOString(),
        }));

        updatedMovements = [...cancelMovements, ...state.inventoryMovements];
        setStorageItem(STORAGE_KEYS.products, updatedProducts);
        setStorageItem(STORAGE_KEYS.inventory, updatedMovements);
      }

      const updatedOrders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              notes: note ? (o.notes ? `${o.notes}\n${note}` : note) : o.notes,
              statusHistory: [
                ...(o.statusHistory || []),
                { status, timestamp: new Date().toISOString(), note },
              ],
            }
          : o
      );

      setStorageItem(STORAGE_KEYS.orders, updatedOrders);
      return {
        orders: updatedOrders,
        products: updatedProducts,
        inventoryMovements: updatedMovements,
      };
    });
  },

  updatePaymentStatus: (orderId, paymentStatus) => {
    set((state) => {
      const updatedOrders = state.orders.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o));
      setStorageItem(STORAGE_KEYS.orders, updatedOrders);
      return { orders: updatedOrders };
    });
  },

  // CUSTOMERS
  addCustomer: (data) => {
    const newCust: Customer = {
      ...data,
      id: generateId('cust'),
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0,
    };
    set((state) => {
      const updated = [newCust, ...state.customers];
      setStorageItem(STORAGE_KEYS.customers, updated);
      return { customers: updated };
    });
  },

  updateCustomer: (id, updates) => {
    set((state) => {
      const updated = state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c));
      setStorageItem(STORAGE_KEYS.customers, updated);
      return { customers: updated };
    });
  },

  toggleCustomerStatus: (id) => {
    set((state) => {
      const updated = state.customers.map((c) =>
        c.id === id ? { ...c, status: (c.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' } : c
      );
      setStorageItem(STORAGE_KEYS.customers, updated);
      return { customers: updated };
    });
  },

  // DISCOUNTS
  addDiscount: (data) => {
    const newDisc: Discount = {
      ...data,
      id: generateId('disc'),
      usedCount: 0,
    };
    set((state) => {
      const updated = [newDisc, ...state.discounts];
      setStorageItem(STORAGE_KEYS.discounts, updated);
      return { discounts: updated };
    });
  },

  updateDiscount: (id, updates) => {
    set((state) => {
      const updated = state.discounts.map((d) => (d.id === id ? { ...d, ...updates } : d));
      setStorageItem(STORAGE_KEYS.discounts, updated);
      return { discounts: updated };
    });
  },

  deleteDiscount: (id) => {
    set((state) => {
      const updated = state.discounts.filter((d) => d.id !== id);
      setStorageItem(STORAGE_KEYS.discounts, updated);
      return { discounts: updated };
    });
  },

  validateDiscount: (code, subtotal) => {
    const state = get();
    const cleanCode = code.trim().toUpperCase();
    const discount = state.discounts.find((d) => d.code.toUpperCase() === cleanCode);

    if (!discount) {
      return { valid: false, discountAmount: 0, error: 'Promo code not recognized.' };
    }

    if (!discount.isActive) {
      return { valid: false, discountAmount: 0, error: 'This promo code is currently inactive.' };
    }

    const now = new Date().getTime();
    if (new Date(discount.startDate).getTime() > now || new Date(discount.endDate).getTime() < now) {
      return { valid: false, discountAmount: 0, error: 'This promo code has expired.' };
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return { valid: false, discountAmount: 0, error: 'Promo code usage limit has been reached.' };
    }

    if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        error: `Requires a minimum purchase of $${discount.minOrderAmount}.`,
      };
    }

    let calculatedDiscount = 0;
    if (discount.type === 'percentage') {
      calculatedDiscount = (subtotal * discount.value) / 100;
      if (discount.maxDiscount && calculatedDiscount > discount.maxDiscount) {
        calculatedDiscount = discount.maxDiscount;
      }
    } else {
      calculatedDiscount = Math.min(discount.value, subtotal);
    }

    return {
      valid: true,
      discount,
      discountAmount: Number(calculatedDiscount.toFixed(2)),
    };
  },

  // REVIEWS
  addReview: (data) => {
    const newRev: Review = {
      ...data,
      id: generateId('rev'),
      status: 'pending', // Requires admin approval per spec
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [newRev, ...state.reviews];
      setStorageItem(STORAGE_KEYS.reviews, updated);
      return { reviews: updated };
    });
  },

  updateReviewStatus: (id, status) => {
    set((state) => {
      const updated = state.reviews.map((r) => (r.id === id ? { ...r, status } : r));
      setStorageItem(STORAGE_KEYS.reviews, updated);
      return { reviews: updated };
    });
  },

  deleteReview: (id) => {
    set((state) => {
      const updated = state.reviews.filter((r) => r.id !== id);
      setStorageItem(STORAGE_KEYS.reviews, updated);
      return { reviews: updated };
    });
  },

  // INVENTORY
  adjustStock: (productId, sizeLabel, change, reason) => {
    set((state) => {
      const product = state.products.find((p) => p.id === productId);
      if (!product) return state;

      let previousStock = 0;
      let newStock = 0;

      const updatedSizes = product.sizes.map((s) => {
        if (s.label === sizeLabel) {
          previousStock = s.stock;
          newStock = Math.max(0, s.stock + change);
          return { ...s, stock: newStock };
        }
        return s;
      });

      const totalStock = updatedSizes.reduce((sum, sz) => sum + sz.stock, 0);

      const updatedProducts = state.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              sizes: updatedSizes,
              status: totalStock === 0 ? 'out_of_stock' : p.status,
            }
          : p
      );

      const newMovement: InventoryMovement = {
        id: generateId('inv'),
        productId,
        productName: product.name,
        variantInfo: sizeLabel,
        change,
        previousStock,
        newStock,
        reason,
        date: new Date().toISOString(),
      };

      const updatedMovements = [newMovement, ...state.inventoryMovements];

      setStorageItem(STORAGE_KEYS.products, updatedProducts);
      setStorageItem(STORAGE_KEYS.inventory, updatedMovements);

      return {
        products: updatedProducts,
        inventoryMovements: updatedMovements,
      };
    });
  },

  // SETTINGS
  updateSettings: (updates) => {
    set((state) => {
      const updated = { ...state.settings, ...updates };
      setStorageItem(STORAGE_KEYS.settings, updated);
      return { settings: updated };
    });
  },

  // AUTH / SESSION
  loginAsDemo: () => {
    const demo = initialCustomers[0];
    setStorageItem(STORAGE_KEYS.session, demo);
    set({ currentUser: demo });
  },

  loginWithEmail: (email) => {
    const state = get();
    const clean = email.trim().toLowerCase();
    const customer = state.customers.find((c) => c.email.toLowerCase() === clean);
    if (customer) {
      setStorageItem(STORAGE_KEYS.session, customer);
      set({ currentUser: customer });
      return true;
    }
    return false;
  },

  register: (name, email, phone) => {
    const newCust: Customer = {
      id: generateId('cust'),
      name,
      email,
      phone,
      status: 'active',
      addresses: [],
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0,
    };
    set((state) => {
      const updated = [newCust, ...state.customers];
      setStorageItem(STORAGE_KEYS.customers, updated);
      setStorageItem(STORAGE_KEYS.session, newCust);
      return { customers: updated, currentUser: newCust };
    });
    return newCust;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.session);
    }
    set({ currentUser: null });
  },

  updateProfile: (updates) => {
    set((state) => {
      if (!state.currentUser) return state;
      const updatedUser = { ...state.currentUser, ...updates };
      const updatedCustomers = state.customers.map((c) => (c.id === updatedUser.id ? updatedUser : c));
      setStorageItem(STORAGE_KEYS.session, updatedUser);
      setStorageItem(STORAGE_KEYS.customers, updatedCustomers);
      return { currentUser: updatedUser, customers: updatedCustomers };
    });
  },

  addAddress: (addressData) => {
    set((state) => {
      if (!state.currentUser) return state;
      const newAddr: Address = {
        ...addressData,
        id: generateId('addr'),
      };
      const addresses = [...state.currentUser.addresses, newAddr];
      const updatedUser = { ...state.currentUser, addresses };
      const updatedCustomers = state.customers.map((c) => (c.id === updatedUser.id ? updatedUser : c));
      setStorageItem(STORAGE_KEYS.session, updatedUser);
      setStorageItem(STORAGE_KEYS.customers, updatedCustomers);
      return { currentUser: updatedUser, customers: updatedCustomers };
    });
  },

  deleteAddress: (addressId) => {
    set((state) => {
      if (!state.currentUser) return state;
      const addresses = state.currentUser.addresses.filter((a) => a.id !== addressId);
      const updatedUser = { ...state.currentUser, addresses };
      const updatedCustomers = state.customers.map((c) => (c.id === updatedUser.id ? updatedUser : c));
      setStorageItem(STORAGE_KEYS.session, updatedUser);
      setStorageItem(STORAGE_KEYS.customers, updatedCustomers);
      return { currentUser: updatedUser, customers: updatedCustomers };
    });
  },

  setDefaultAddress: (addressId) => {
    set((state) => {
      if (!state.currentUser) return state;
      const addresses = state.currentUser.addresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));
      const updatedUser = { ...state.currentUser, addresses };
      const updatedCustomers = state.customers.map((c) => (c.id === updatedUser.id ? updatedUser : c));
      setStorageItem(STORAGE_KEYS.session, updatedUser);
      setStorageItem(STORAGE_KEYS.customers, updatedCustomers);
      return { currentUser: updatedUser, customers: updatedCustomers };
    });
  },

  // HELLOBEE REFERRAL & COMMISSION ENGINE
  registerHellobeeMember: (data) => {
    const state = get();
    const isOwner = data.role === 'OWNER';
    const prefix = isOwner ? 'HB-OWNER' : 'HB-EMP';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedReferralCode = `${prefix}-${randomSuffix}`;

    // Find sponsor if provided
    let sponsor = null;
    if (data.sponsorCode) {
      sponsor = state.hellobeeMembers.find(
        (m) => m.referralCode.toUpperCase() === data.sponsorCode?.trim().toUpperCase()
      );
    }

    const newMember: HellobeeMember = {
      id: generateId(isOwner ? 'owner' : 'emp'),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      referralCode: generatedReferralCode,
      referredById: sponsor ? sponsor.id : null,
      sponsorCode: sponsor ? sponsor.referralCode : null,
      ownerId: isOwner ? null : sponsor?.role === 'OWNER' ? sponsor.id : sponsor?.ownerId || null,
      rank: '1A',
      validOrdersCount: 0,
      personalSalesVolume: 0,
      networkSalesVolume: 0,
      directInviteCount: 0,
      totalCommissionEarned: 0,
      availableBalance: 0,
      hasPurchasedFiltrationDevice: false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Update sponsor directInviteCount if applicable
    let updatedMembers = [newMember, ...state.hellobeeMembers];
    if (sponsor) {
      updatedMembers = updatedMembers.map((m) =>
        m.id === sponsor.id ? { ...m, directInviteCount: m.directInviteCount + 1 } : m
      );
    }

    setStorageItem(STORAGE_KEYS.hellobeeMembers, updatedMembers);
    set({ hellobeeMembers: updatedMembers, activeMemberId: newMember.id });
    return newMember;
  },

  recordReferralOrder: (orderId, orderNumber, orderAmount, buyerName, referralCode) => {
    if (!referralCode) {
      return { success: false, commissionsAwarded: [], upgrades: [] };
    }

    const state = get();
    const cleanCode = referralCode.trim().toUpperCase();
    const beneficiary = state.hellobeeMembers.find(
      (m) => m.referralCode.toUpperCase() === cleanCode
    );

    if (!beneficiary) {
      return { success: false, commissionsAwarded: [], upgrades: [] };
    }

    const commissionsAwarded: CommissionTransaction[] = [];
    const upgrades: { memberName: string; oldRank: string; newRank: string }[] = [];

    let updatedMembers = [...state.hellobeeMembers];

    // Case 1: Referral Code belongs to an Employee
    if (beneficiary.role === 'EMPLOYEE') {
      // 1. Direct 10% commission on order amount ($150 on $1,500)
      const empCommissionAmount = Math.round(orderAmount * 0.1);
      const empCommission: CommissionTransaction = {
        id: generateId('comm'),
        orderId,
        orderNumber,
        orderAmount,
        buyerName,
        beneficiaryId: beneficiary.id,
        beneficiaryName: beneficiary.name,
        beneficiaryRole: 'EMPLOYEE',
        commissionType: 'DIRECT_10_PERCENT',
        rate: 0.1,
        amount: empCommissionAmount,
        status: 'APPROVED',
        notes: `10% Direct commission on order ${orderNumber}`,
        createdAt: new Date().toISOString(),
      };
      commissionsAwarded.push(empCommission);

      // Increment employee order count & volume, evaluate Rank advancement (1A -> 5A)
      const newOrdersCount = beneficiary.validOrdersCount + 1;
      let newRank: RankLevel = beneficiary.rank;

      if (newOrdersCount >= 625) {
        newRank = '5A';
      } else if (newOrdersCount >= 125) {
        newRank = '4A';
      } else if (newOrdersCount >= 25) {
        newRank = '3A';
      } else if (newOrdersCount >= 5) {
        newRank = '2A';
      }

      if (newRank !== beneficiary.rank) {
        upgrades.push({
          memberName: beneficiary.name,
          oldRank: beneficiary.rank,
          newRank,
        });
      }

      updatedMembers = updatedMembers.map((m) => {
        if (m.id === beneficiary.id) {
          return {
            ...m,
            validOrdersCount: newOrdersCount,
            personalSalesVolume: m.personalSalesVolume + orderAmount,
            networkSalesVolume: m.networkSalesVolume + orderAmount,
            totalCommissionEarned: m.totalCommissionEarned + empCommissionAmount,
            availableBalance: m.availableBalance + empCommissionAmount,
            rank: newRank,
          };
        }
        return m;
      });

      // 2. Owner 1% override on Employee's total order ($15 on $1,500)
      const ownerId = beneficiary.ownerId;
      if (ownerId) {
        const owner = updatedMembers.find((m) => m.id === ownerId);
        if (owner) {
          const ownerOverrideAmount = Math.round(orderAmount * 0.01);
          const ownerCommission: CommissionTransaction = {
            id: generateId('comm'),
            orderId,
            orderNumber,
            orderAmount,
            buyerName,
            beneficiaryId: owner.id,
            beneficiaryName: owner.name,
            beneficiaryRole: 'OWNER',
            commissionType: 'OWNER_OVERRIDE_1_PERCENT',
            rate: 0.01,
            amount: ownerOverrideAmount,
            status: 'APPROVED',
            notes: `1% Owner override on Employee ${beneficiary.name} invoice`,
            createdAt: new Date().toISOString(),
          };
          commissionsAwarded.push(ownerCommission);

          updatedMembers = updatedMembers.map((m) => {
            if (m.id === owner.id) {
              return {
                ...m,
                networkSalesVolume: m.networkSalesVolume + orderAmount,
                totalCommissionEarned: m.totalCommissionEarned + ownerOverrideAmount,
                availableBalance: m.availableBalance + ownerOverrideAmount,
              };
            }
            return m;
          });
        }
      }
    } else if (beneficiary.role === 'OWNER') {
      // Case 2: Referral Code belongs directly to an Owner -> 10% direct commission
      const ownerDirectAmount = Math.round(orderAmount * 0.1);
      const ownerCommission: CommissionTransaction = {
        id: generateId('comm'),
        orderId,
        orderNumber,
        orderAmount,
        buyerName,
        beneficiaryId: beneficiary.id,
        beneficiaryName: beneficiary.name,
        beneficiaryRole: 'OWNER',
        commissionType: 'DIRECT_10_PERCENT',
        rate: 0.1,
        amount: ownerDirectAmount,
        status: 'APPROVED',
        notes: `10% Direct Owner commission on order ${orderNumber}`,
        createdAt: new Date().toISOString(),
      };
      commissionsAwarded.push(ownerCommission);

      updatedMembers = updatedMembers.map((m) => {
        if (m.id === beneficiary.id) {
          return {
            ...m,
            validOrdersCount: m.validOrdersCount + 1,
            personalSalesVolume: m.personalSalesVolume + orderAmount,
            networkSalesVolume: m.networkSalesVolume + orderAmount,
            totalCommissionEarned: m.totalCommissionEarned + ownerDirectAmount,
            availableBalance: m.availableBalance + ownerDirectAmount,
          };
        }
        return m;
      });
    }

    const allCommissions = [...commissionsAwarded, ...state.commissions];
    setStorageItem(STORAGE_KEYS.hellobeeMembers, updatedMembers);
    setStorageItem(STORAGE_KEYS.commissions, allCommissions);

    set({
      hellobeeMembers: updatedMembers,
      commissions: allCommissions,
    });

    return {
      success: true,
      commissionsAwarded,
      upgrades,
    };
  },

  requestPayout: (memberId, amount, bankName, bankAccountNumber, bankAccountName) => {
    const state = get();
    const member = state.hellobeeMembers.find((m) => m.id === memberId);
    if (!member) throw new Error('Member not found');
    if (member.availableBalance < amount) throw new Error('Insufficient balance');

    const newPayout: PayoutRequest = {
      id: generateId('payout'),
      memberId,
      memberName: member.name,
      memberRole: member.role,
      amount,
      bankName,
      bankAccountNumber,
      bankAccountName,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };

    const updatedMembers = state.hellobeeMembers.map((m) =>
      m.id === memberId ? { ...m, availableBalance: Math.max(0, m.availableBalance - amount) } : m
    );

    const updatedPayouts = [newPayout, ...state.payouts];
    setStorageItem(STORAGE_KEYS.hellobeeMembers, updatedMembers);
    setStorageItem(STORAGE_KEYS.payouts, updatedPayouts);

    set({
      hellobeeMembers: updatedMembers,
      payouts: updatedPayouts,
    });

    return newPayout;
  },

  updatePayoutStatus: (payoutId, status) => {
    const state = get();
    const updatedPayouts = state.payouts.map((p) =>
      p.id === payoutId
        ? {
            ...p,
            status,
            processedAt: new Date().toISOString(),
          }
        : p
    );
    setStorageItem(STORAGE_KEYS.payouts, updatedPayouts);
    set({ payouts: updatedPayouts });
  },
}));
