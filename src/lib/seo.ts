import { Product } from '@/types';

export const SITE_URL = 'https://enagic-kangenwater.vn';
export const SITE_NAME = 'Enagic® Kangen Water® Vietnam';
export const ENAGIC_OFFICIAL_URL = 'https://www.enagic.com/vi_VN/';

export function safeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Enagic International - Kangen Water® Vietnam',
    alternateName: ['Enagic Vietnam', 'Kangen Water Vietnam', 'Enagic K8', 'Enagic USA'],
    url: SITE_URL,
    logo: `${SITE_URL}/logo-enagic.png`,
    sameAs: [
      ENAGIC_OFFICIAL_URL,
      'https://www.enagic.com',
      'https://www.facebook.com/kangenwatervietnam.official',
      'https://www.youtube.com/@EnagicGlobal',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84-1900-866-814',
      contactType: 'customer service & technical installation',
      areaServed: ['VN', 'US', 'JP', 'GLOBAL'],
      availableLanguage: ['Vietnamese', 'English', 'Japanese'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh',
      addressLocality: 'Hồ Chí Minh',
      addressCountry: 'VN',
    },
  };
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Nhà sản xuất máy điện giải ion kiềm y tế Kangen® độc quyền toàn cầu từ năm 1974. Thay đổi nguồn nước, thay đổi cuộc sống®.',
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
        name: 'Nước Kangen® là gì và có tác dụng gì đối với sức khỏe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nước Kangen® (nghĩa là "Trở về nguyên thủy" trong tiếng Nhật) là nước điện giải ion kiềm giàu phân tử Hydro hoạt tính (H2), có độ kiềm tự nhiên pH 8.5 - 9.5 và chỉ số chống oxy hóa ORP âm sâu (lên đến -850mV). Nước Kangen giúp trung hòa axit dư thừa, trung hòa gốc tự do, thẩm thấu nhanh vào từng tế bào để cấp nước sâu và đào thải độc tố hiệu quả.',
        },
      },
      {
        '@type': 'Question',
        name: 'Tại sao máy điện giải Enagic Kangen được chứng nhận thiết bị y tế tại Nhật Bản?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tập đoàn Enagic là nhà sản xuất máy điện giải ion kiềm duy nhất trên thế giới sở hữu nhà máy sản xuất khép kín OEM đạt chứng nhận thiết bị y tế quốc tế ISO 13485 và chứng nhận thiết bị y tế của Bộ Y Tế & Phúc Lợi Nhật Bản (Số 27BZ006010). Các tấm điện cực được đúc từ Titan y tế nguyên khối nhúng Bạch kim (Platinum) 99.97% tinh khiết, đảm bảo không thôi nhiễm độc tố và được hơn 6,500 bác sĩ hiệp hội JAPA Nhật Bản khuyên dùng.',
        },
      },
      {
        '@type': 'Question',
        name: 'Máy Enagic Kangen tạo ra được 5 loại nước nào?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '1. Nước Kiềm Mạnh (pH 11.5): Bóc tách thuốc trừ sâu, chất bảo quản trên rau củ.\n2. Nước Kangen Uống (pH 8.5 - 9.5): Nước uống giàu Hydro chống oxy hóa, pha trà, nấu ăn.\n3. Nước Trung Tính (pH 7.0): Uống thuốc tây, pha sữa bột cho trẻ em.\n4. Nước Làm Đẹp (pH 6.0): Se khít lỗ chân lông, săn chắc làn da, dưỡng tóc.\n5. Nước Axit Mạnh (pH 2.5): Diệt khuẩn 99.99% vết thương, sát trùng dụng cụ y tế và đồ dùng nhà bếp.',
        },
      },
      {
        '@type': 'Question',
        name: 'Máy Kangen LeveLuk K8 khác gì so với LeveLuk SD501?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LeveLuk K8 sở hữu 8 tấm điện cực Titan phủ Bạch kim (so với 7 tấm của SD501), mang lại chỉ số chống oxy hóa mạnh hơn (ORP tới -850mV). K8 còn được trang bị màn hình cảm ứng LCD hiển thị màu, giọng nói hướng dẫn 8 ngôn ngữ, chế độ tự động làm sạch và bộ nguồn đa điện áp 100-240V sử dụng trên toàn cầu.',
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
