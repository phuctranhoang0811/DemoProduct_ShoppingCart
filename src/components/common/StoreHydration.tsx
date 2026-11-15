'use client';

import { useEffect } from 'react';
import '@/lib/admin-client';
import { syncSession } from '@/lib/auth-client';
import { useCommerceStore } from '@/stores/useCommerceStore';

export function StoreHydration() {
  useEffect(() => {
    useCommerceStore.getState().initHydrate();
    void syncSession();
  }, []);

  return null;
}
