# AGENTS.md — Developer & AI Agent Guidelines

> **Project**: Enagic® Kangen Water® & Hellobee Network E-Commerce Platform  
> **Framework**: Next.js 15 (App Router), React 19, Tailwind CSS, Zustand  
> **Production Deployment**: Vercel (`https://demo-product-shopping-cart.vercel.app`)

---

## 1. Language & Localization Policy (CRITICAL MANDATE)

> [!IMPORTANT]
> **Strict English-Only Mandate**: All project content must be written in **English exclusively**. Do **NOT** use Vietnamese anywhere in the repository.

- **UI & Text Content**: All headings, body copy, product names, descriptions, specifications, badges, buttons, placeholders, tooltips, and toasts must be in clear, professional English.
- **Data & Mock Seeds**: All categories, products, customer reviews, order histories, and settings in `src/data/` must be 100% in English.
- **Metadata & SEO**: Schema markup (`FAQPage`, `Product`, `Organization`, `BreadcrumbList`), OpenGraph tags, and page metadata in `src/lib/seo.ts` and `src/app/layout.tsx` must be in English.
- **No Vietnamese Fallbacks**: Do not introduce `language === 'vi'` branches or Vietnamese strings in components or translation dictionaries.

---

## 2. Code Style & Commenting Policy

- **Lean Codebase**: Do **NOT** over-comment code. Avoid descriptive comments explaining obvious code.
- **High-Signal Comments Only**: Leave comments solely for non-obvious logic, complex business rules (e.g. Hellobee 1A–5A commission matrix, statutory tax brackets), rationale, or critical security warnings.
- **Standard Formatting**: Use modern TypeScript with strict type safety, Tailwind CSS utility classes, and Lucide icons.

---

## 3. UI/UX & Component Architecture

### Store Header (3-Zone Layout)
- **Zone 1 (Left - Brand)**: Hellobee mascot logo with `KANGEN WATER®` brandmark.
- **Zone 2 (Center - Navigation)**: Centered menu links (`HOME`, `IONIZERS`, `ANESPA SPA`, `FILTERS & PARTS`, `TAX CALCULATOR`, `HELLOBEE NETWORK [1A–5A]`). All links must use `whitespace-nowrap shrink-0` to avoid text line-wrapping bugs.
- **Zone 3 (Right - Utilities)**: Divided utility section featuring interactive currency toggle (`$ USD` / `₫ VND`), instant search (`Cmd+K`), wishlist with badge, account popover, shopping bag with bounce micro-interaction, and portal access.

### Motion & Micro-Interactions
- **Tactile Buttons**: Use `.btn-tactile` (`active:scale-95 transition-all`) for responsive click feedback.
- **Interactive Cards**: Use `.card-interactive` on product cards for subtle elevation and border highlight.
- **Badge Animations**: Use `.animate-badge-pop` for count updates and `.animate-heart-pop` for wishlist toggles.
- **Back to Top**: Floating quick scroll button (`BackToTop.tsx`) with smooth window scrolling.

### Authentication & RBAC
- **Login Card**: Clean 440px card with 3 minimalist quick demo pills (`Admin`, `Staff`, `User`) linking directly to role workspaces. No redundant text or clutter.

---

## 4. Build & Vercel Deployment Rules

### Windows Junction Quirk
- The directory `C:\Users\phuct\Desktop\Demo_Product` is an NTFS Junction pointing to physical directory `c:\Users\phuct\Desktop\SDN302_SP26_SE184858`.
- Vercel CLI rejects deploying junctions directly (`"Symbolic links and special files are not supported"`).
- **Required Deploy Command**: Always deploy targeting the physical directory:
  ```bash
  npx vercel c:\Users\phuct\Desktop\SDN302_SP26_SE184858 --prod --yes
  ```

### PowerShell Path Quoting
- Paths containing route group parentheses (e.g. `src/app/(store)/login/page.tsx`) must be quoted in PowerShell commands:
  ```powershell
  git add "src/app/(store)/login/page.tsx"
  ```
