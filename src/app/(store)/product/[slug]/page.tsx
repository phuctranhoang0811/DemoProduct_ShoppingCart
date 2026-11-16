import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import { CATALOG_REVALIDATE_SECONDS, getProductDetail, getProducts } from '@/lib/catalog';
import { SITE_NAME, buildBreadcrumbsSchema, buildProductSchema, safeJsonLd } from '@/lib/seo';

interface Props {
  params: { slug: string };
}

export const revalidate = CATALOG_REVALIDATE_SECONDS;

export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getProductDetail(params.slug);
  if (!detail) return { title: 'Product Not Found', robots: { index: false } };

  const { product, category } = detail;
  const images = product.images.map((url) => ({ url, alt: product.name }));

  return {
    title: product.name,
    description: product.description,
    keywords: [product.name, category?.name, 'Enagic', 'Kangen Water', `SKU ${product.sku}`].filter(
      (k): k is string => Boolean(k),
    ),
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description: product.description,
      url: `/product/${product.slug}`,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${SITE_NAME}`,
      description: product.description,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const detail = await getProductDetail(params.slug);
  if (!detail) notFound();

  const { product, category, reviews } = detail;

  const relatedProducts = (await getProducts())
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  const breadcrumbSchema = buildBreadcrumbsSchema([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    ...(category ? [{ name: category.name, url: `/category/${category.slug}` }] : []),
    { name: product.name, url: `/product/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(buildProductSchema(product, reviews)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <ProductDetailClient product={product} reviews={reviews} relatedProducts={relatedProducts} />
    </>
  );
}
