import { Product } from '@/types';

export const SITE_URL = 'https://enagic-kangenwater.vn';
export const SITE_NAME = 'Enagic® Kangen Water®';
export const ENAGIC_OFFICIAL_URL = 'https://www.enagic.com/';

export function safeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Enagic International - Kangen Water®',
    alternateName: ['Enagic', 'Kangen Water', 'Enagic K8', 'Enagic USA', 'Enagic Japan'],
    url: SITE_URL,
    logo: `${SITE_URL}/logo-enagic.png`,
    sameAs: [
      ENAGIC_OFFICIAL_URL,
      'https://www.enagic.com',
      'https://www.facebook.com/kangenwater.official',
      'https://www.youtube.com/@EnagicGlobal',
    ],
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
    description: 'Global pioneer in medical-grade water ionizers and electrolyzed water systems since 1974. Change Your Water, Change Your Life®.',
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

export function buildProductSchema(product: Product, reviewsCount: number = 6, averageRating: number = 4.9) {
  const inStock = product.sizes.some((s) => s.stock > 0);

  return {
    '@context': 'https://schema.org',
    '@type': ['Product', 'MedicalDevice'],
    name: product.name,
    alternateName: product.nameVi || product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    mpn: product.sku,
    manufacturer: {
      '@type': 'Organization',
      name: 'Enagic International Co., Ltd. (Osaka, Japan)',
    },
    brand: {
      '@type': 'Brand',
      name: 'Enagic® Kangen Water®',
    },
    medicalSpecialty: 'Preventive Medicine & Cellular Hydration',
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviewsCount,
      bestRating: '5',
      worstRating: '1',
    },
  };
}

export function buildFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Kangen Water® and how does it support wellness?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Kangen Water® ("Return to Origin" in Japanese) is ionized alkaline water rich in active molecular hydrogen (H2), featuring a natural alkaline pH of 8.5 - 9.5 and negative oxidation-reduction potential (ORP down to -850mV). It helps neutralize excess acidity, fight free radicals, and hydrate cells efficiently.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why are Enagic Kangen ionizers certified as medical devices in Japan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Enagic is an OEM manufacturer certified under ISO 13485 medical device standards and certified by the Japanese Ministry of Health, Labour and Welfare (License No. 27BZ006010). Its solid medical-grade titanium electrode plates are dipped in 99.97% pure platinum, endorsed by over 6,500 JAPA medical specialists.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the 5 types of water produced by Enagic Kangen machines?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '1. Strong Kangen Water (pH 11.5): Food preparation, oil emulsification, and produce cleaning.\n2. Kangen Water® (pH 8.5 - 9.5): Antioxidant-rich daily drinking water, tea brewing, and cooking.\n3. Clean Water (pH 7.0): Taking medication and baby formula preparation.\n4. Beauty Water (pH 6.0): Facial toning, skin tightening, and haircare.\n5. Strong Acidic Water (pH 2.5): Sanitizing surfaces, kitchenware, and hygiene cleansing.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between Kangen LeveLuk K8 and LeveLuk SD501?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LeveLuk K8 features 8 solid platinum-dipped titanium electrode plates (versus 7 on SD501), generating higher antioxidant potential (ORP up to -850mV). The K8 also includes a full-color LCD touchscreen, voice prompts in 8 languages, automatic cleaning, and a worldwide multi-voltage power supply (100-240V).',
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
