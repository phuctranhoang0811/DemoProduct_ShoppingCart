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

export const translations: Record<Language, Translations> = {
  vi: {
    brand: {
      name: 'ENAGIC® KANGEN WATER®',
      tagline: 'CHANGE YOUR WATER, CHANGE YOUR LIFE®',
      subTagline: 'Thay đổi nguồn nước, thay đổi cuộc sống®',
      announcement: 'ENAGIC® VIỆT NAM — NHÀ SẢN XUẤT MÁY ĐIỆN GIẢI CHUẨN THIẾT BỊ Y TẾ NHẬT BẢN TỪ NĂM 1974 | MIỄN PHÍ KHẢO SÁT & LẮP ĐẶT TOÀN QUỐC',
      medicalBadge: 'Thiết Bị Y Tế Nhật Bản (ISO 13485)',
      isoBadge: 'ISO 9001 & ISO 14001',
      wqaBadge: 'Con Dấu Vàng WQA Hoa Kỳ',
      madeInJapan: '100% Sản Xuất Tại Osaka, Nhật Bản',
    },
    nav: {
      home: 'Trang Chủ',
      products: 'Máy Điện Giải',
      waterTypes: '5 Loại Nước Kangen',
      technology: 'Công Nghệ Điện Cực',
      certifications: 'Chứng Nhận Y Tế',
      accessories: 'Lõi Lọc & Phụ Kiện',
      about: 'Về Enagic®',
      searchPlaceholder: 'Tìm kiếm máy LeveLuk K8, SD501, lõi lọc FC1...',
      shoppingBag: 'Giỏ Hàng',
      savedItems: 'Yêu Thích',
      adminPortal: 'Quản Trị',
      consultation: 'Tư Vấn Miễn Phí',
    },
    hero: {
      badge: 'Enagic® • Osaka Japan 1974',
      titleLine1: 'Thay Đổi Nguồn Nước.',
      titleLine2: 'Thay Đổi Cuộc Sống.®',
      subtitle: 'Máy điện giải ion kiềm y tế sản xuất tại Osaka, Nhật Bản với tấm điện cực Titan phủ Bạch Kim nguyên chất.',
      ctaPrimary: 'Khám Phá Dòng Máy',
      ctaSecondary: '5 Loại Nước Kangen',
      trustPlates: '8 Điện Cực Titan Bạch Kim',
      trustOrp: 'Chỉ Số ORP Đến -850mV',
      trustWarranty: 'Bảo Hành Chính Hãng 5 Năm',
      trustMedical: 'Thiết Bị Y Tế ISO 13485',
    },
    trustBar: {
      item1Title: 'Thiết Bị Y Tế Nhật Bản',
      item1Desc: 'Chứng nhận ISO 13485 & hiệp hội JAPA',
      item2Title: 'Titan Phủ Bạch Kim',
      item2Desc: 'Điện cực Titan y tế 99.97% nguyên chất',
      item3Title: 'Bảo Hành 5 Năm Toàn Cầu',
      item3Desc: 'Bảo trì định kỳ & hỗ trợ trọn đời',
      item4Title: 'Khảo Sát & Lắp Đặt Tận Nhà',
      item4Desc: 'Miễn phí lắp đặt kỹ thuật viên toàn quốc',
    },
    watersSection: {
      badge: 'Bí Quyết Sống Khỏe Trường Thọ',
      title: 'Khám Phá 5 Loại Nước Kangen® Kỳ Diệu',
      subtitle: 'Chỉ bằng một nút chạm trên bảng điều khiển thông minh, nước máy thông thường được chuyển hóa thành 5 nguồn nước quý giá phục vụ trọn vẹn đời sống sinh hoạt và sức khỏe.',
      water1Title: 'Nước Kangen Kiềm Mạnh (pH 11.5)',
      water1Ph: 'pH 11.5',
      water1Desc: 'Bóc tách thuốc trừ sâu, chất bảo quản và dầu bóng trên bề mặt rau củ quả. Làm sạch tự nhiên không hóa chất độc hại.',
      water1Usage: 'Rửa thực phẩm, ngâm rau quả tươi ngon, tẩy rửa an toàn',
      water2Title: 'Nước Uống Kangen® (pH 8.5 - 9.5)',
      water2Ph: 'pH 8.5 - 9.5',
      water2Desc: 'Nước uống giàu khoáng kiềm tự nhiên, phân tử nước siêu nhỏ và hydro hoạt tính chống oxy hóa tế bào mạnh mẽ.',
      water2Usage: 'Uống hằng ngày, pha trà, cà phê thơm đượm, nấu cơm và súp',
      water3Title: 'Nước Tinh Khiết Trung Tính (pH 7.0)',
      water3Ph: 'pH 7.0',
      water3Desc: 'Nước đã được lọc sạch tạp chất qua màng lọc than hoạt tính phủ bạc cao cấp nhưng giữ nguyên vẹn độ trung tính tự nhiên.',
      water3Usage: 'Uống thuốc tây, pha sữa bột dinh dưỡng cho trẻ nhỏ',
      water4Title: 'Nước Làm Đẹp Beauty Water (pH 6.0)',
      water4Ph: 'pH 6.0',
      water4Desc: 'Nước có tính axit nhẹ tương thích với độ pH tự nhiên của làn da, có tác dụng se khít lỗ chân lông, săn chắc cơ mặt.',
      water4Usage: 'Xịt khoáng dưỡng ẩm, rửa mặt, dưỡng tóc mềm bóng mượt',
      water5Title: 'Nước Axit Mạnh Khử Khuẩn (pH 2.5)',
      water5Ph: 'pH 2.5',
      water5Desc: 'Nước chứa axit Hypochlorous (HOCl) có khả năng diệt khuẩn 99.99% trong 30 giây, an toàn tuyệt đối cho người và vật nuôi.',
      water5Usage: 'Sát trùng vết thương, súc miệng, khử khuẩn dao thớt đồ dùng',
    },
    showcase: {
      newArrivalsBadge: 'Dòng Máy Mới Nhất 2026',
      newArrivalsTitle: 'Thiết Bị Điện Giải Kangen® Đỉnh Cao',
      bestSellersBadge: 'Bán Chạy Nhất Toàn Cầu',
      bestSellersTitle: 'Dòng Máy Biểu Tượng Của Enagic®',
      viewAll: 'Xem Tất Cả Thiết Bị',
      viewPiece: 'Xem Chi Tiết',
      quickAdd: 'Đặt Mua Ngay',
      consultSpecialist: 'Nhận Tư Vấn Chuyên Sâu',
      techSpecs: 'Thông số kỹ thuật',
      electrodes: 'Tấm điện cực',
      phRange: 'Dải pH tạo ra',
      orpLevel: 'Chỉ số ORP chống lão hóa',
      warranty: 'Chế độ bảo hành',
      origin: 'Xuất xứ',
      japanQuality: 'Osaka, Nhật Bản (OEM Medical Device)',
    },
    shop: {
      pageTitle: 'Danh Mục Thiết Bị Điện Giải & Phụ Kiện Enagic®',
      pageSubtitle: 'Tất cả sản phẩm máy tạo nước ion kiềm Kangen, máy tắm khoáng Anespa, lõi lọc và phụ kiện chính hãng Enagic Nhật Bản.',
      filters: 'Bộ Lọc',
      activeFilters: 'Đang chọn:',
      resetFilters: 'Xóa tất cả bộ lọc',
      categories: 'Nhóm Sản Phẩm',
      allCategories: 'Tất Cả Sản Phẩm',
      priceRange: 'Khoảng Giá',
      maxPrice: 'Mức giá tối đa',
      electrodesFilter: 'Số Tấm Điện Cực',
      sortBy: 'Sắp xếp:',
      sortNewest: 'Mới Nhất',
      sortPopular: 'Bán Chạy Nhất',
      sortPriceAsc: 'Giá: Thấp đến Cao',
      sortPriceDesc: 'Giá: Cao đến Thấp',
      showingResults: 'Hiển thị',
      noResultsTitle: 'Không tìm thấy sản phẩm phù hợp',
      noResultsDesc: 'Vui lòng thử điều chỉnh lại bộ lọc giá hoặc danh mục tìm kiếm.',
      clearFilters: 'Làm Mới Bộ Lọc',
    },
    productDetail: {
      home: 'Trang chủ',
      inStock: 'Có sẵn hàng chính hãng Enagic',
      lowStock: 'Số lượng thiết bị phân bổ giới hạn',
      addToCart: 'Thêm Vào Giỏ Hàng',
      requestQuote: 'Nhận Báo Giá & Khảo Sát Nước',
      consultMedicalDoctor: 'Đặt Lịch Tư Vấn Chuyên Sâu Cùng Bác Sĩ',
      freeInstallation: 'Miễn phí giao hàng & lắp đặt kỹ thuật viên Enagic tại nhà',
      fiveYearWarranty: 'Bảo hành chính hãng 5 năm toàn cầu & hỗ trợ trọn đời',
      japanCertified: 'Đạt chứng nhận thiết bị y tế Nhật Bản số 27BZ006010',
      specsTitle: 'Thông Số Kỹ Thuật Độc Quyền',
      waterTypesProduced: '5 Loại Nước Tạo Ra',
      includedAccessories: 'Phụ Kiện Kèm Theo Máy',
      reviewsTitle: 'Đánh Giá Của Khách Hàng & Chuyên Gia',
      customerReviews: 'Đánh giá thực tế',
      writeReview: 'Gửi Đánh Giá Của Bạn',
      sizeGuide: 'Cấu Hình Lắp Đặt & Phụ Kiện',
      packages: 'Lựa Chọn Gói Lắp Đặt',
    },
    cart: {
      title: 'Giỏ Hàng Của Bạn',
      emptyTitle: 'Giỏ hàng đang trống',
      emptyDesc: 'Khám phá các dòng máy tạo nước điện giải Kangen hàng đầu Nhật Bản để bắt đầu hành trình nâng tầm sức khỏe.',
      startShopping: 'Xem Các Dòng Máy',
      subtotal: 'Tạm Tính',
      shipping: 'Khảo Sát & Lắp Đặt Kỹ Thuật',
      shippingFree: 'Miễn Phí Toàn Quốc',
      total: 'Tổng Thanh Toán',
      checkout: 'Tiến Hành Đặt Hàng',
      viewBag: 'Xem Chi Tiết Giỏ Hàng',
      promoPlaceholder: 'Mã Ưu Đãi (Vd: KANGEN2026)',
      applyCode: 'Áp Dụng',
      freeDeliveryUnlocked: 'Bạn đã đủ điều kiện Miễn Phí Lắp Đặt Tận Nhà!',
      addMoreForFree: 'Thêm sản phẩm để nhận ưu đãi đặc biệt',
      sslSecurity: 'Thanh toán bảo mật chuẩn SSL y khoa Enagic Toàn Cầu',
      remove: 'Xóa',
    },
    checkout: {
      title: 'Xác Nhận Đơn Hàng & Lắp Đặt',
      step1: '1. Thông Tin Khách Hàng',
      step2: '2. Địa Chỉ Giao Hàng & Khảo Sát',
      step3: '3. Phương Thức Thanh Toán',
      fullName: 'Họ và tên quý khách *',
      phone: 'Số điện thoại liên hệ *',
      email: 'Địa chỉ Email *',
      street: 'Số nhà, tên đường, tòa nhà *',
      ward: 'Phường / Xã *',
      district: 'Quận / Huyện *',
      city: 'Tỉnh / Thành phố *',
      paymentCod: 'Thanh toán khi nhận hàng & lắp đặt (COD)',
      paymentBank: 'Chuyển khoản ngân hàng chính thức Enagic',
      paymentInstallment: 'Trả góp 0% lãi suất qua thẻ tín dụng',
      notes: 'Ghi chú thời gian thuận tiện khảo sát nguồn nước...',
      placeOrder: 'Xác Nhận Đặt Hàng',
      orderSuccessTitle: 'ĐẶT HÀNG THÀNH CÔNG!',
      orderSuccessDesc: 'Cảm ơn quý khách đã tin chọn giải pháp nước Kangen® chính hãng. Kỹ sư Enagic sẽ liên hệ trong vòng 30 phút để lên lịch khảo sát và lắp đặt.',
    },
    footer: {
      aboutTitle: 'Tập Đoàn Enagic® Quốc Tế',
      aboutDesc: 'Thành lập từ năm 1974 tại Tokyo, Nhật Bản. Enagic® là nhà sản xuất chuyên sâu duy nhất trên thế giới sở hữu quy trình khép kín OEM đạt chứng nhận thiết bị y tế cho máy điện giải ion kiềm.',
      productsTitle: 'Thiết Bị Điện Giải',
      customerCareTitle: 'Hỗ Trợ Khách Hàng',
      contactTitle: 'Trụ Sở Enagic®',
      hotline: 'Hotline Chuyên Gia: 1900 866 814',
      email: 'Email: support@enagic-kangen.vn',
      address: 'Văn phòng: Tòa nhà Landmark 81, TP. Hồ Chí Minh & Keangnam Landmark, Hà Nội',
      rights: '© 1974 - 2026 Enagic International. Bản quyền thuộc về Enagic®. KANGEN WATER® là thương hiệu đã đăng ký.',
      medicalDisclaimer: 'Khuyến cáo: Nước Kangen® là nước uống ion kiềm hỗ trợ tăng cường sức khỏe, không thay thế thuốc chữa bệnh.',
    },
  },
  en: {
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
      hotline: 'Specialist Hotline: 1900 866 814',
      email: 'Email: support@enagic-kangen.vn',
      address: 'Offices: Landmark 81 Tower, Ho Chi Minh City & Keangnam Landmark, Hanoi',
      rights: '© 1974 - 2026 Enagic International. All rights reserved. KANGEN WATER® is a registered trademark.',
      medicalDisclaimer: 'Disclaimer: Kangen Water® is an ionized alkaline water supporting hydration and vitality. It is not intended to diagnose, cure or prevent diseases.',
    },
  },
};

