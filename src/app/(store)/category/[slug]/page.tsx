import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopClient } from '@/components/shop/ShopClient';
import { CATALOG_REVALIDATE_SECONDS, getCategories, getProducts } from '@/lib/catalog';
import { SITE_NAME, buildBreadcrumbsSchema, buildItemListSchema, safeJsonLd } from '@/lib/seo';

interface Props {
  params: { slug: string };
}

export const revalidate = CATALOG_REVALIDATE_SECONDS;

export async function generateStaticParams() {
  return (await getCategories()).map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = (await getCategories()).find((c) => c.slug === params.slug);
  if (!category) return { title: 'Category Not Found', robots: { index: false } };

  return {
    title: category.name,
    description: category.description,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} | ${SITE_NAME}`,
      description: category.description,
      url: `/category/${category.slug}`,
      siteName: SITE_NAME,
      type: 'website',
      images: category.image ? [{ url: category.image, alt: category.name }] : undefined,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const category = categories.find((c) => c.slug === params.slug);

  if (!category) notFound();

  const categoryProducts = products.filter((p) => p.categoryId === category.id);

  const breadcrumbSchema = buildBreadcrumbsSchema([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: category.name, url: `/category/${category.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(buildItemListSchema(category.name, categoryProducts)) }}
      />
      <ShopClient products={products} categories={categories} fixedCategory={category} />
    </>
  );
}
