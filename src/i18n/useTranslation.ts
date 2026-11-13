'use client';

import { useCommerceStore } from '@/stores/useCommerceStore';
import { translations, Language, Translations } from './translations';

export function useTranslation() {
  const language = useCommerceStore((state) => state.language) || 'en';
  const setLanguage = useCommerceStore((state) => state.setLanguage);

  const t: Translations = translations[language] || translations.en;

  return {
    t,
    language,
    setLanguage,
  };
}

