export type Language = 'vi' | 'en';

export interface Translations {
  brand: {
    name: string;
    tagline: string;
    subTagline: string;
    announcement: string;
    medicalBadge: string;
    isoBadge: string;
    wqaBadge: string;
    madeInJapan: string;
  };
  nav: {
    home: string;
    products: string;
    waterTypes: string;
    technology: string;
    certifications: string;
    accessories: string;
    about: string;
    searchPlaceholder: string;
    shoppingBag: string;
    savedItems: string;
    adminPortal: string;
    consultation: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustPlates: string;
    trustOrp: string;
    trustWarranty: string;
    trustMedical: string;
  };
  trustBar: {
    item1Title: string;
    item1Desc: string;
    item2Title: string;
    item2Desc: string;
    item3Title: string;
    item3Desc: string;
    item4Title: string;
    item4Desc: string;
  };
  watersSection: {
    badge: string;
    title: string;
    subtitle: string;
    water1Title: string;
    water1Ph: string;
    water1Desc: string;
    water1Usage: string;
    water2Title: string;
    water2Ph: string;
    water2Desc: string;
    water2Usage: string;
    water3Title: string;
    water3Ph: string;
    water3Desc: string;
    water3Usage: string;
    water4Title: string;
    water4Ph: string;
    water4Desc: string;
    water4Usage: string;
    water5Title: string;
    water5Ph: string;
    water5Desc: string;
    water5Usage: string;
  };
  showcase: {
    newArrivalsBadge: string;
    newArrivalsTitle: string;
    bestSellersBadge: string;
    bestSellersTitle: string;
    viewAll: string;
    viewPiece: string;
    quickAdd: string;
    consultSpecialist: string;
    techSpecs: string;
    electrodes: string;
    phRange: string;
    orpLevel: string;
    warranty: string;
    origin: string;
    japanQuality: string;
  };
  shop: {
    pageTitle: string;
    pageSubtitle: string;
    filters: string;
    activeFilters: string;
    resetFilters: string;
    categories: string;
    allCategories: string;
    priceRange: string;
    maxPrice: string;
    electrodesFilter: string;
    sortBy: string;
    sortNewest: string;
    sortPopular: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    showingResults: string;
    noResultsTitle: string;
    noResultsDesc: string;
    clearFilters: string;
  };
  productDetail: {
    home: string;
    inStock: string;
    lowStock: string;
    addToCart: string;
    requestQuote: string;
    consultMedicalDoctor: string;
    freeInstallation: string;
    fiveYearWarranty: string;
    japanCertified: string;
    specsTitle: string;
    waterTypesProduced: string;
    includedAccessories: string;
    reviewsTitle: string;
    customerReviews: string;
    writeReview: string;
    sizeGuide: string;
    packages: string;
  };
  cart: {
    title: string;
    emptyTitle: string;
    emptyDesc: string;
    startShopping: string;
    subtotal: string;
    shipping: string;
    shippingFree: string;
    total: string;
    checkout: string;
    viewBag: string;
    promoPlaceholder: string;
    applyCode: string;
    freeDeliveryUnlocked: string;
    addMoreForFree: string;
    sslSecurity: string;
    remove: string;
  };
  checkout: {
    title: string;
    step1: string;
    step2: string;
    step3: string;
    fullName: string;
    phone: string;
    email: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    paymentCod: string;
    paymentBank: string;
    paymentInstallment: string;
    notes: string;
    placeOrder: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
  };
  footer: {
    aboutTitle: string;
    aboutDesc: string;
    productsTitle: string;
    customerCareTitle: string;
    contactTitle: string;
    hotline: string;
    email: string;
    address: string;
    rights: string;
    medicalDisclaimer: string;
  };
}

const enTranslations: Translations = {

    brand: {
      name: 'ENAGIC® KANGEN WATER®',
      tagline: 'CHANGE YOUR WATER, CHANGE YOUR LIFE®',
      subTagline: 'Change Your Water, Change Your Life®',
      announcement: 'EXCLUSIVE GLOBAL PRODUCER OF MEDICAL-GRADE KANGEN WATER® IONIZERS SINCE 1974 | ISO 13485 CERTIFIED',
      medicalBadge: 'Japan Medical Device (ISO 13485)',
      isoBadge: 'ISO 9001 & ISO 14001',
      wqaBadge: 'WQA Gold Seal Awarded',
      madeInJapan: '100% Made in Osaka, Japan',
    },
    nav: {
      home: 'Home',
      products: 'Ionizers',
      waterTypes: '5 Kangen Waters',
      technology: 'Electrode Tech',
      certifications: 'Certifications',
      accessories: 'Filters & Parts',
      about: 'About Enagic®',
      searchPlaceholder: 'Search LeveLuk K8, SD501, FC1 filter...',
      shoppingBag: 'Bag',
      savedItems: 'Saved',
      adminPortal: 'Admin',
      consultation: 'Free Consultation',
    },
    hero: {
      badge: 'Enagic® • Osaka Japan 1974',
      titleLine1: 'Change Your Water.',
      titleLine2: 'Change Your Life.®',
      subtitle: 'Original medical-grade water ionizers engineered with solid platinum-coated titanium plates in Osaka, Japan.',
      ctaPrimary: 'Shop All Ionizers',
      ctaSecondary: '5 Kangen Waters',
      trustPlates: '8 Titanium Plates',
      trustOrp: 'ORP to -850mV',
      trustWarranty: '5-Year Warranty',
      trustMedical: 'ISO 13485 Medical Device',
    },
    trustBar: {
      item1Title: 'Japanese Medical Device',
      item1Desc: 'ISO 13485 & JAPA doctor endorsed',
      item2Title: 'Platinum-Dipped Titanium',
      item2Desc: '99.97% solid medical titanium plates',
      item3Title: '5-Year Global Warranty',
      item3Desc: 'Worldwide warranty & factory support',
      item4Title: 'Complimentary Setup',
      item4Desc: 'In-home water testing & installation',
    },
    watersSection: {
      badge: 'Pillar of True Health',
      title: 'Discover the 5 Miraculous Kangen Waters®',
      subtitle: 'A single touch on the intuitive digital panel transforms ordinary tap water into 5 customized waters for cellular health, culinary excellence, natural skincare, and medical sanitization.',
      water1Title: 'Strong Kangen Water (pH 11.5)',
      water1Ph: 'pH 11.5',
      water1Desc: 'Potent non-chemical emulsifier. Dissolves agricultural chemicals, pesticides, and wax coatings on fruits and vegetables.',
      water1Usage: 'Food prep, produce washing, chemical-free kitchen degreasing',
      water2Title: 'Kangen Water® (pH 8.5 - 9.5)',
      water2Ph: 'pH 8.5 - 9.5',
      water2Desc: 'Daily drinking water packed with active molecular hydrogen, negative ORP antioxidant power, and micro-clustered hydration.',
      water2Usage: 'Daily hydration, brewing tea & coffee, cooking soups and rice',
      water3Title: 'Clean Neutral Water (pH 7.0)',
      water3Ph: 'pH 7.0',
      water3Desc: 'Purified through high-grade silver-impregnated activated carbon filter while maintaining natural neutral balance.',
      water3Usage: 'Taking prescription medications, preparing infant formula',
      water4Title: 'Beauty Water (pH 6.0)',
      water4Ph: 'pH 6.0',
      water4Desc: 'Slightly acidic astringent water that matches the natural pH of human skin, tightening pores and toning skin tone.',
      water4Usage: 'Facial mist toner, aftershave grooming, hair conditioning rinse',
      water5Title: 'Strong Acidic Water (pH 2.5)',
      water5Ph: 'pH 2.5',
      water5Desc: 'Contains natural Hypochlorous acid (HOCl) capable of neutralizing 99.99% of bacteria and pathogens within 30 seconds.',
      water5Usage: 'Wound disinfection, gargling, sanitizing knives & cutting boards',
    },
    showcase: {
      newArrivalsBadge: 'Flagship Collection 2026',
      newArrivalsTitle: 'Premier Kangen® Ionization Systems',
      bestSellersBadge: 'World Best-Seller',
      bestSellersTitle: 'Iconic Enagic® Health Technology',
      viewAll: 'View All Devices',
      viewPiece: 'View Details',
      quickAdd: 'Order Now',
      consultSpecialist: 'Consult Specialist',
      techSpecs: 'Technical Specifications',
      electrodes: 'Electrodes',
      phRange: 'pH Spectrum',
      orpLevel: 'Antioxidant ORP',
      warranty: 'Warranty',
      origin: 'Country of Origin',
      japanQuality: 'Osaka, Japan (OEM Medical Facility)',
    },
    shop: {
      pageTitle: 'Enagic® Water Ionizers & Genuine Accessories',
      pageSubtitle: 'Authentic Japanese Kangen Water ionizers, Anespa mineral spas, high-grade replacement filters, and maintenance accessories.',
      filters: 'Filters',
      activeFilters: 'Active:',
      resetFilters: 'Reset all filters',
      categories: 'Categories',
      allCategories: 'All Products',
      priceRange: 'Price Range',
      maxPrice: 'Max Price',
      electrodesFilter: 'Electrodes Count',
      sortBy: 'Sort by:',
      sortNewest: 'Newest Release',
      sortPopular: 'Most Popular',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      showingResults: 'Showing',
      noResultsTitle: 'No matching devices found',
      noResultsDesc: 'Try adjusting your price range or category filter criteria.',
      clearFilters: 'Clear Filters',
    },
    productDetail: {
      home: 'Home',
      inStock: 'Genuine Enagic Stock Available',
      lowStock: 'Limited Allocation Remaining',
      addToCart: 'Add to Cart',
      requestQuote: 'Request Quote & Water Test',
      consultMedicalDoctor: 'Book Specialist Consultation',
      freeInstallation: 'Complimentary delivery & certified master plumbing installation',
      fiveYearWarranty: '5-year international warranty & lifetime service support',
      japanCertified: 'Japan Medical Device License No. 27BZ006010',
      specsTitle: 'Engineered Medical Specifications',
      waterTypesProduced: '5 Waters Produced',
      includedAccessories: 'Included Accessories',
      reviewsTitle: 'Clinical & Customer Testimonials',
      customerReviews: 'Verified Reviews',
      writeReview: 'Submit Your Experience',
      sizeGuide: 'Installation & Bundle Packages',
      packages: 'Select Configuration Package',
    },
    cart: {
      title: 'Your Shopping Bag',
      emptyTitle: 'Your bag is empty',
      emptyDesc: 'Discover genuine Japanese Kangen Water ionizers and take your family health to the highest standard.',
      startShopping: 'Browse Devices',
      subtotal: 'Subtotal',
      shipping: 'Water Survey & Installation',
      shippingFree: 'Free Nationwide',
      total: 'Total',
      checkout: 'Proceed to Checkout',
      viewBag: 'View Full Bag Details',
      promoPlaceholder: 'Promotional Code (e.g. KANGEN2026)',
      applyCode: 'Apply',
      freeDeliveryUnlocked: 'You unlocked Free Nationwide Delivery & Installation!',
      addMoreForFree: 'Add more accessories for exclusive savings',
      sslSecurity: 'SSL Encrypted Medical Checkout by Enagic Global',
      remove: 'Remove',
    },
    checkout: {
      title: 'Complete Your Order & Installation Request',
      step1: '1. Contact Details',
      step2: '2. Delivery & Plumbing Address',
      step3: '3. Payment Selection',
      fullName: 'Full Name *',
      phone: 'Phone Number *',
      email: 'Email Address *',
      street: 'Street Address, Apartment, Suite *',
      ward: 'Ward *',
      district: 'District *',
      city: 'City / Province *',
      paymentCod: 'Cash on Delivery & Installation (COD)',
      paymentBank: 'Official Enagic Corporate Bank Transfer',
      paymentInstallment: '0% Interest Credit Card Installment',
      notes: 'Preferred installation date, water source notes...',
      placeOrder: 'Confirm Order',
      orderSuccessTitle: 'ORDER CONFIRMED!',
      orderSuccessDesc: 'Thank you for choosing genuine Kangen Water®. An Enagic specialist will contact you within 30 minutes to confirm your water survey and installation time.',
    },
    footer: {
      aboutTitle: 'Enagic® International',
      aboutDesc: 'Founded in 1974 in Tokyo, Japan. Enagic® is the only water filtration and alkaline ionizer manufacturer in the world with its own OEM medical device manufacturing facility.',
      productsTitle: 'Ionizer Models',
      customerCareTitle: 'Client Services',
      contactTitle: 'Enagic® Head Office',
      hotline: 'Specialist Hotline: +1 (800) 555-KANGEN',
      email: 'Email: support@hellobee.com',
      address: 'Enagic USA & Hellobee Network Global Headquarters',
      rights: '© 1974 - 2026 Enagic International. All rights reserved. KANGEN WATER® is a registered trademark.',
      medicalDisclaimer: 'Disclaimer: Kangen Water® is an ionized alkaline water supporting hydration and vitality. It is not intended to diagnose, cure or prevent diseases.',
    },
};

export const translations: Record<Language, Translations> = {
  vi: enTranslations,
  en: enTranslations,
};
