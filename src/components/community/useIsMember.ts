import { useCommerceStore } from '@/stores/useCommerceStore';
import { useCommunityStore } from '@/stores/useCommunityStore';

// The product that unlocks membership (same id as the backend's activation product).
export const MEMBERSHIP_PRODUCT_ID = 'hellobee-filter-1500';

// A member bought a system (network member), joined with an admin code, or is staff.
export function useIsMember() {
  const user = useCommerceStore((s) => s.currentUser);
  const network = useCommerceStore((s) => s.hellobeeMembers);
  const joined = useCommunityStore((s) => s.members);
  const orders = useCommerceStore((s) => s.orders);

  if (!user) return { user: null, isMember: false };

  const email = user.email.toLowerCase();
  const isMember =
    user.role === 'admin' ||
    user.role === 'employee' ||
    Boolean(joined[email]) ||
    network.some((m) => m.email.toLowerCase() === email && m.hasPurchasedFiltrationDevice) ||
    orders.some(
      (o) =>
        o.status !== 'Cancelled' &&
        o.customerEmail.toLowerCase() === email &&
        o.items.some((i) => i.productId === MEMBERSHIP_PRODUCT_ID),
    );

  return { user, isMember };
}
