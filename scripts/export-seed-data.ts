// Dumps the storefront mock data (src/data) to JSON for the Laravel seeders.
// Run from the repo root: npx tsx scripts/export-seed-data.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { initialCategories } from '../src/data/categories';
import { initialCustomers } from '../src/data/customers';
import { initialDiscounts } from '../src/data/discounts';
import { MEMBER_EVENTS } from '../src/data/events';
import {
  initialCommissionTransactions,
  initialCoreHellobeeMembers,
  initialPayoutRequests,
} from '../src/data/hellobeeMembers';
import { initialInventoryMovements } from '../src/data/inventory';
import { initialOrders } from '../src/data/orders';
import { initialProducts } from '../src/data/products';
import { initialReviews } from '../src/data/reviews';
import { initialSettings } from '../src/data/settings';

const outDir = join(process.cwd(), 'backend/database/seeders/data');
mkdirSync(outDir, { recursive: true });

const datasets: Record<string, unknown> = {
  categories: initialCategories,
  products: initialProducts,
  reviews: initialReviews,
  customers: initialCustomers,
  discounts: initialDiscounts,
  orders: initialOrders,
  inventory_movements: initialInventoryMovements,
  settings: initialSettings,
  events: MEMBER_EVENTS,
  hellobee_members: initialCoreHellobeeMembers,
  commission_transactions: initialCommissionTransactions,
  payout_requests: initialPayoutRequests,
};

for (const [name, data] of Object.entries(datasets)) {
  writeFileSync(join(outDir, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${name}: ${Array.isArray(data) ? data.length : 1}`);
}
