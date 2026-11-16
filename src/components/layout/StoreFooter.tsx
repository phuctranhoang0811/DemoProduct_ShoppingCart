'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';

const SHOP_LINKS = [
  { label: 'All Products', href: '/shop' },
  { label: 'Tax Calculator', href: '/calculator' },
  { label: 'Hellobee Network', href: '/hellobee' },
  { label: 'Events', href: '/events' },
];

const CARE_LINKS = [
  { label: 'My Account', href: '/account' },
  { label: 'Order History', href: '/orders' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Cart', href: '/cart' },
];

export function StoreFooter() {
  const { t } = useTranslation();
  const f = t.footer;

  return (
    <footer className="bg-[#111111] text-white/70 border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 lg:col-span-1 space-y-3">
          <h3 className="text-white font-semibold">{f.aboutTitle}</h3>
          <p className="text-xs leading-relaxed">{f.aboutDesc}</p>
        </div>

        <nav aria-label="Shop" className="space-y-3">
          <h3 className="text-white font-semibold">{f.productsTitle}</h3>
          <ul className="space-y-1">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-block py-1.5 text-xs hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Customer care" className="space-y-3">
          <h3 className="text-white font-semibold">{f.customerCareTitle}</h3>
          <ul className="space-y-1">
            {CARE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-block py-1.5 text-xs hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 lg:col-span-1 space-y-2 text-xs">
          <h3 className="text-white font-semibold text-sm">{f.contactTitle}</h3>
          <p>{f.hotline}</p>
          <p>{f.email}</p>
          <p>{f.address}</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-1.5 text-[11px] text-white/60">
          <p>{f.rights}</p>
          <p>{f.medicalDisclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
