'use client';

import { useEffect } from 'react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { LANGUAGES } from '@/i18n/languages';

export function StoreHydration() {
  const language = useCommerceStore((state) => state.language);

  useEffect(() => {
    useCommerceStore.getState().initHydrate();
  }, []);

  useEffect(() => {
    const option = LANGUAGES.find((l) => l.code === language);
    document.documentElement.lang = language;
    document.documentElement.dir = option?.dir ?? 'ltr';
  }, [language]);

  return null;
}
