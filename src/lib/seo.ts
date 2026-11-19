import type { Product, Review } from '@/types';

// Canonical origin. Set NEXT_PUBLIC_SITE_URL once a custom domain is live; until then the
// Vercel production domain is used so canonicals and the sitemap match the deployed host.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
).replace(/\/+$/, '');
export const SITE_NAME = 'Hello Bee';

export function safeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hello Bee',
    alternateName: ['Hello Bee', 'Hellobee', 'Hello Bee Network'],
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-866-814',
      contactType: 'customer service & technical support',
      areaServed: ['US', 'CA', 'EU', 'JP', 'GLOBAL'],
      availableLanguage: ['English', 'Japanese'],
    },
  };
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Official Hello Bee wellness devices, medical-grade water ionizers, air purifiers, and member community.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

interface RatedProduct extends Product {
  rating?: { count: number; average: number | null };
}

export function buildProductSchema(product: RatedProduct, reviews: Review[] = []) {
  const inStock = product.sizes.some((s) => s.stock > 0);
  const rating = product.rating;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Hello Bee',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    // Ratings are only published when real approved reviews back them.
    ...(rating && rating.count > 0 && rating.average !== null
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.average,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.slice(0, 10).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.customerName },
            datePublished: r.createdAt.slice(0, 10),
            reviewBody: r.comment,
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          })),
        }
      : {}),
  };
}

export function buildItemListSchema(name: string, products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: `${SITE_URL}/product/${product.slug}`,
    })),
  };
}

export function buildFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Hello Bee ionized alkaline water and how does it support wellness?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hello Bee ionized alkaline water is rich in active molecular hydrogen (H2), featuring an alkaline pH of 8.5 - 9.5 and negative oxidation-reduction potential (ORP down to -850mV) to support daily hydration.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why are Hello Bee water ionizers certified as medical-grade devices?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hello Bee partners with ISO 13485 certified OEM manufacturing facilities featuring solid medical-grade titanium electrode plates dipped in 99.97% pure platinum.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the 5 types of water produced by Hello Bee LeveLuk systems?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '1. Strong Alkaline Water (pH 11.5): Food preparation and produce cleaning.\n2. Alkaline Water (pH 8.5 - 9.5): Antioxidant-rich daily drinking water and cooking.\n3. Clean Water (pH 7.0): Taking medication and baby formula preparation.\n4. Beauty Water (pH 6.0): Facial toning and haircare.\n5. Strong Acidic Water (pH 2.5): Sanitizing surfaces and kitchenware.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between Hello Bee LeveLuk K8 and LeveLuk SD501?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LeveLuk K8 features 8 solid platinum-dipped titanium electrode plates (versus 7 on SD501), generating higher antioxidant potential (ORP up to -850mV) with a full-color LCD touchscreen and multi-voltage power supply (100-240V).',
        },
      },
    ],
  };
}

export function buildBreadcrumbsSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
