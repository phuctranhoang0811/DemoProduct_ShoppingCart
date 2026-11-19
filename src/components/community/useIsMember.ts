import { useCommerceStore } from '@/stores/useCommerceStore';
import { useCommunityStore } from '@/stores/useCommunityStore';

// A member bought a system (network member), joined with an admin code, or is staff.
export function useIsMember() {
  const user = useCommerceStore((s) => s.currentUser);
  const network = useCommerceStore((s) => s.hellobeeMembers);
  const joined = useCommunityStore((s) => s.members);

  if (!user) return { user: null, isMember: false };

  const email = user.email.toLowerCase();
  const isMember =
    user.role === 'admin' ||
    user.role === 'employee' ||
    Boolean(joined[email]) ||
    network.some((m) => m.email.toLowerCase() === email && m.hasPurchasedFiltrationDevice);

  return { user, isMember };
}
