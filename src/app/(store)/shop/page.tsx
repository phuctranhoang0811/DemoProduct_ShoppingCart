import { ShopClient } from '@/components/shop/ShopClient';
import { CATALOG_REVALIDATE_SECONDS, getCategories, getProducts } from '@/lib/catalog';

export const revalidate = CATALOG_REVALIDATE_SECONDS;

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return <ShopClient products={products} categories={categories} />;
}
