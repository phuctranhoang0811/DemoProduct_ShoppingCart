import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { initialProducts } from '@/data/products';
import { initialCategories } from '@/data/categories';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import {
  SITE_URL,
  SITE_NAME,
  buildProductSchema,
  buildBreadcrumbsSchema,
  safeJsonLd,
} from '@/lib/seo';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return initialProducts.map((p) => ({
    slug: p.slug,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const product = initialProducts.find((p) => p.slug === params.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested garment could not be found.',
    };
  }

  const category = initialCategories.find((c) => c.id === product.categoryId);
  const primaryImage = product.images[0] || '';

  return {
    title: product.name,
    description: product.description,
    keywords: [
      product.name,
      category?.name || 'Fashion',
      'COS Minimal',
      product.materials || 'Sustainable natural fibers',
      product.gender || 'Unisex',
      'Scandinavian clothing',
    ],
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description: product.description,
      url: `${SITE_URL}/product/${product.slug}`,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'article',
      images: [
        {
          url: primaryImage,
          width: 1000,
          height: 1333,
          alt: `${product.name} — COS Minimal Tailoring`,
        },
        ...product.images.slice(1).map((img, i) => ({
          url: img,
          width: 1000,
          height: 1333,
          alt: `${product.name} perspective ${i + 2}`,
        })),
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${SITE_NAME}`,
      description: product.description,
      images: [primaryImage],
    },
  };
}

export default function ProductDetailPage({ params }: Props) {
  const product = initialProducts.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const category = initialCategories.find((c) => c.id === product.categoryId);

  const productSchema = buildProductSchema(product);
  const breadcrumbSchema = buildBreadcrumbsSchema([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: category?.name || 'Collection', url: `/shop?category=${product.categoryId}` },
    { name: product.name, url: `/product/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(productSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(breadcrumbSchema),
        }}
      />
      <ProductDetailClient slug={params.slug} />
    </>
  );
}
