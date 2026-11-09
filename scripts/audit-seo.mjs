const SITE_URL = 'https://demo-product-shopping-cart.vercel.app';

async function runAudit() {
  console.log(`\n🔍 Bắt đầu quét tự động toàn bộ website: ${SITE_URL}/sitemap.xml\n`);

  try {
    const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`);
    const sitemapXml = await sitemapRes.text();

    const urlMatches = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)];
    const urls = urlMatches.map(m => m[1]);

    console.log(`📌 Tìm thấy tổng cộng ${urls.length} URLs trong Sitemap.\n`);

    let passedCount = 0;
    const tableData = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const path = url.replace(SITE_URL, '') || '/';

      try {
        const res = await fetch(url);
        const html = await res.text();

        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1] : '';

        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
        const hasDesc = !!descMatch;

        const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
        const hasCanonical = !!canonMatch;

        const hasSchema = html.includes('application/ld+json');

        const isOk = res.status === 200 && !!title && hasDesc && hasCanonical && hasSchema;
        if (isOk) passedCount++;

        tableData.push({
          '#': i + 1,
          'Route': path.length > 35 ? path.substring(0, 32) + '...' : path,
          'Status': res.status,
          'Title': title ? '✅ ' + (title.length > 25 ? title.substring(0, 22) + '...' : title) : '❌ Thiếu',
          'Meta Desc': hasDesc ? '✅ OK' : '❌ Thiếu',
          'Canonical': hasCanonical ? '✅ OK' : '❌ Thiếu',
          'Schema JSON-LD': hasSchema ? '✅ OK' : '❌ Thiếu',
        });
      } catch (err) {
        tableData.push({
          '#': i + 1,
          'Route': path,
          'Status': 'ERROR',
          'Title': '❌',
          'Meta Desc': '❌',
          'Canonical': '❌',
          'Schema JSON-LD': '❌',
        });
      }
    }

    console.table(tableData);
    console.log(`\n🎉 KẾT QUẢ KIỂM TRA TOÀN DIỆN: ${passedCount}/${urls.length} trang ĐẠT CHUẨN SEO TUYỆT ĐỐI 100%!\n`);

  } catch (error) {
    console.error('Lỗi khi cào dữ liệu:', error);
  }
}

runAudit();
