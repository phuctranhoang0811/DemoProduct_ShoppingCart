/// <reference types="vitest/globals" />
import { vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { useCommerceStore } from '../src/stores/useCommerceStore';
import { normalizeAddressCountryBody } from '../src/lib/session';

describe('Store Security, Promo Persistence, and Referral Regression Tests', () => {
  beforeEach(() => {
    useCommerceStore.getState().resetDemoData();
  });

  it('starts with no pre-authenticated session user', () => {
    expect(useCommerceStore.getState().currentUser).toBeNull();
  });

  it('persists applied promo code across cart and clears it on checkout', () => {
    const store = useCommerceStore.getState();
    store.setAppliedDiscountCode('welcome10');
    expect(useCommerceStore.getState().appliedDiscountCode).toBe('WELCOME10');

    const discountCheck = store.validateDiscount('WELCOME10', 5890);
    expect(discountCheck.valid).toBe(true);
    expect(discountCheck.discountAmount).toBe(50);

    const order = store.createOrder({
      customerName: 'Test Buyer',
      customerEmail: 'buyer@example.com',
      customerPhone: '+1 (415) 555-0199',
      shippingAddress: {
        street: '100 Market St',
        ward: '',
        district: 'CA',
        city: 'San Francisco',
      },
      deliveryMethod: 'Standard',
      paymentMethod: 'cod',
      paymentStatus: 'Unpaid',
      status: 'Pending',
      items: [
        {
          productId: 'kangen-k8',
          productName: 'Enagic LeveLuk K8',
          slug: 'enagic-leveluk-k8',
          image: '/images/products/k8.webp',
          price: 5890,
          colorName: 'White',
          size: 'Standard',
          quantity: 1,
        },
      ],
      subtotal: 5890,
      discountAmount: discountCheck.discountAmount,
      discountCode: 'WELCOME10',
      shippingFee: 0,
      total: 5840,
    });

    expect(order.discountCode).toBe('WELCOME10');
    expect(order.discountAmount).toBe(50);
    expect(order.total).toBe(5840);
    expect(useCommerceStore.getState().appliedDiscountCode).toBeNull();
  });

  it('links referral code during registration and credits consultant upon checkout', () => {
    const store = useCommerceStore.getState();
    const customer = store.register('Ref Customer', 'ref.cust@example.com', '+1 (415) 555-0144', 'hbee03');

    expect(customer.referralCode).toBe('HBEE03');
    expect(customer.role).toBe('customer');

    const order = useCommerceStore.getState().createOrder({
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingAddress: {
        street: '200 Pine St',
        ward: '',
        district: 'WA',
        city: 'Seattle',
      },
      deliveryMethod: 'Standard',
      paymentMethod: 'cod',
      paymentStatus: 'Unpaid',
      status: 'Pending',
      items: [
        {
          productId: 'kangen-air-500',
          productName: 'Kangen Air 500',
          slug: 'kangen-air-500',
          image: '/images/products/kangen-air.webp',
          price: 500,
          colorName: 'White',
          size: 'Single Unit',
          quantity: 1,
        },
      ],
      subtotal: 500,
      discountAmount: 0,
      shippingFee: 0,
      total: 500,
    });

    expect(order.referralCode).toBe('HBEE03');
  });

  it('defaults wishlist to empty array on clean or reset state', () => {
    expect(useCommerceStore.getState().wishlist).toEqual([]);
  });

  it('preserves postalCode on local orders', () => {
    const order = useCommerceStore.getState().createOrder({
      customerName: 'Zip Buyer',
      customerEmail: 'zip@example.com',
      customerPhone: '+1 (415) 555-0188',
      shippingAddress: {
        street: '742 Market Street',
        ward: 'Suite 402',
        district: 'CA',
        city: 'San Francisco',
        postalCode: '94105',
      },
      deliveryMethod: 'Standard',
      paymentMethod: 'cod',
      paymentStatus: 'Unpaid',
      status: 'Pending',
      items: [],
      subtotal: 100,
      discountAmount: 0,
      shippingFee: 0,
      total: 100,
    });

    expect(order.shippingAddress.postalCode).toBe('94105');
  });

  it('normalizes address country payloads to ISO-2 codes for DB compatibility', () => {
    expect(normalizeAddressCountryBody({ street: '100 Main', country: 'United States' })).toEqual({
      street: '100 Main',
      country: 'US',
    });
    expect(normalizeAddressCountryBody({ country: 'USA' })).toEqual({ country: 'US' });
    expect(normalizeAddressCountryBody({ country: 'us' })).toEqual({ country: 'US' });
    expect(normalizeAddressCountryBody({ country: '' })).toEqual({ country: null });
  });
});
