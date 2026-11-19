'use client';

import { useEffect } from 'react';
import '@/lib/admin-client';
import { syncSession } from '@/lib/auth-client';
import { initCommunitySocket } from '@/lib/community-socket';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { LANGUAGES } from '@/i18n/languages';

export function StoreHydration() {
  const language = useCommerceStore((state) => state.language);

  useEffect(() => {
    useCommerceStore.getState().initHydrate();
    void syncSession();
    initCommunitySocket();
  }, []);

  useEffect(() => {
    const option = LANGUAGES.find((l) => l.code === language);
    document.documentElement.lang = language;
    document.documentElement.dir = option?.dir ?? 'ltr';
  }, [language]);

  return null;
}
