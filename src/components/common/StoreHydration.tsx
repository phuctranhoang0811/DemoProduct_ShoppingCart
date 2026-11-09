'use client';

import { useEffect } from 'react';
import { useCommerceStore } from '@/stores/useCommerceStore';

export function StoreHydration() {
  useEffect(() => {
    useCommerceStore.getState().initHydrate();
  }, []);

  return null;
}
