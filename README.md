# COS MINIMAL PREMIUM — FASHION E-COMMERCE

A modern, minimalist fashion e-commerce prototype inspired by the visual language of **COS**. Built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Zustand** with browser **Local Storage** persistence.

---

## 1. Project Overview & Architecture

This application consists of two integrated areas sharing the same in-memory state and browser local storage:

1. **Customer Storefront:**
   - **Editorial Homepage (`/`):** Hero campaign banner, featured categories, new arrivals capsule, architectural tailoring banner, best-sellers, brand philosophy, and bulletin newsletter.
   - **Shop (`/shop`):** Responsive grid (4-col desktop, 3-col tablet, 2-col mobile), multi-faceted filtering (category, gender, price slider, size, color), sorting (newest, popularity, price asc/desc), dynamic count, and pagination.
   - **Product Detail (`/product/[slug]`):** Full gallery preview, swatches, size selector with inventory checks, size & fit guide modal, quantity controls, accordion specs, customer review submission, and related products.
   - **Shopping Bag (`/cart`):** Variant lines, quantity adjustments, live promo code engine, free shipping threshold indicator, and summary breakdown.
   - **Checkout Simulation (`/checkout`):** Address input, multi-step validation, delivery tier selection, simulated payment gateways (Card, Bank Transfer, COD), inventory stock deduction, and order placement.
   - **Order Confirmation (`/order-success`):** Printable invoice receipt and delivery estimate.
   - **Wishlist (`/wishlist`):** Favorite items saved to local storage with quick-add.
   - **Customer Portal (`/account`, `/orders`, `/login`, `/register`):** Profile manager, multi-address book, and order status tracking.

2. **Admin Management Panel (`/admin`):**
   - **Dashboard (`/admin`):** Dynamically calculated KPIs (Total Revenue, Orders, Products, Customers), Recharts revenue curve and order distribution, low-stock notifications, and recent orders.
   - **Products (`/admin/products`):** Full CRUD with image URLs, SKUs, pricing, multi-size stock quantities, badges, search, category filter, and bulk deletion.
   - **Categories (`/admin/categories`):** Full CRUD for catalog taxonomy with product counts.
   - **Orders (`/admin/orders`):** Order status workflow (Pending &rarr; Confirmed &rarr; Processing &rarr; Shipped &rarr; Delivered), cancellation with automatic stock restoration, payment status toggle, and internal notes.
   - **Customers (`/admin/customers`):** Directory, lifetime spending aggregation, status toggles, and order history.
   - **Inventory (`/admin/inventory`):** Stock monitoring by size variant, threshold warnings, restock adjustments with audit reason logs.
   - **Discounts (`/admin/discounts`):** Coupon code engine (percentage or fixed amount, minimum spend, expiration dates, usage limits).
   - **Reviews (`/admin/reviews`):** Feedback moderation queue (only approved reviews display on storefront).
   - **Settings (`/admin/settings`):** Global store parameters, shipping fee, free shipping tier, announcement bar text, and one-click demo data factory reset.

---

## 2. Demo Credentials

### Customer Account
- **Email:** `customer@example.com`
- **Password:** `customer123`
*(A quick one-click demo login button is provided on `/login`)*

### Admin Portal
- Accessible directly at `/admin` or via the top navigation bar **"Admin"** pill.

---

## 3. Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (custom COS monochrome palette + warm beige accents)
- **Icons:** Lucide React
- **State Management:** Zustand
- **Persistence:** Browser Local Storage (versioned keys with safe hydration)
- **Data Visualization:** Recharts
- **Notifications:** Sonner

---

## 4. Local Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open browser at
http://localhost:3000

# 4. Create production build
npm run build

# 5. Start production server
npm run start
```

---

## 5. Vercel Deployment Instructions

1. Push this repository to GitHub or GitLab.
2. Log into [Vercel](https://vercel.com).
3. Click **"Add New Project"** and select this repository.
4. Framework Preset will be automatically detected as **Next.js**.
5. No backend environment variables or databases are required.
6. Click **"Deploy"**.

> **Note on Persistence:** Changes made in the admin panel or storefront persist in the individual visitor's browser LocalStorage on that device.

---

## 6. Implementation Verification Report

| Feature Area | Status | Verification Notes |
|---|---|---|
| COS Editorial Design Direction | Verified | Clean typography, `#111111` primary, `#F5F4F0` surface, generous whitespace |
| 24+ Curated Products | Verified | High-definition fashion photography, rich details, sizes & colors |
| 6 Categories | Verified | New Arrivals, Shirts, Trousers, Dresses, Outerwear, Accessories |
| 20+ Mock Orders | Verified | Realistic statuses (Pending to Delivered), items, addresses |
| Storefront Search & Filters | Verified | Instant modal search + multi-faceted `/shop` filters |
| Cart & Checkout Flow | Verified | Stock revalidation, discount code engine, stock deduction |
| Order Confirmation & History | Verified | Detailed invoice view and order tracking modal |
| Admin Dashboard KPIs & Charts | Verified | Dynamically calculated from live store orders, Recharts graphs |
| Admin Product CRUD | Verified | Create, edit, delete, bulk delete, variant stock |
| Admin Category CRUD | Verified | Taxonomy management with product count |
| Admin Order Management | Verified | Status workflow + stock restoration on cancellation |
| Admin Inventory Journal | Verified | Size variant restock with audit movement history |
| Admin Discount Voucher Engine | Verified | Percentage/fixed codes, minimum order validation |
| Admin Review Moderation | Verified | Approval workflow, only approved reviews show publicly |
| Admin Store Settings | Verified | Live announcement bar update + demo factory reset |
