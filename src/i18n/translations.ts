import type { DeepPartial, Language, Translations } from './types';
import { en } from './locales/en';
import { pt } from './locales/pt';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { zhHK } from './locales/zh-HK';
import { hi } from './locales/hi';
import { id } from './locales/id';
import { it } from './locales/it';
import { ja } from './locales/ja';
import { ms } from './locales/ms';
import { es } from './locales/es';
import { mn } from './locales/mn';
import { fil } from './locales/fil';
import { ru } from './locales/ru';
import { ko } from './locales/ko';
import { zhTW } from './locales/zh-TW';
import { th } from './locales/th';
import { ar } from './locales/ar';
import { km } from './locales/km';
import { ro } from './locales/ro';
import { tr } from './locales/tr';

export type { Language, Translations } from './types';

type Dict = Record<string, unknown>;

// Keys a locale has not translated yet fall back to English.
function withFallback(base: Translations, override: DeepPartial<Translations>): Translations {
  const merge = (a: Dict, b: Dict): Dict => {
    const out: Dict = { ...a };
    for (const key of Object.keys(b)) {
      const value = b[key];
      if (value && typeof value === 'object') out[key] = merge((a[key] as Dict) ?? {}, value as Dict);
      else if (value !== undefined) out[key] = value;
    }
    return out;
  };
  return merge(base as unknown as Dict, override as Dict) as unknown as Translations;
}

const partials: Record<Exclude<Language, 'en'>, DeepPartial<Translations>> = {
  pt, fr, de, 'zh-HK': zhHK, hi, id, it, ja, ms, es, mn, fil, ru, ko, 'zh-TW': zhTW, th, ar, km, ro, tr,
};

export const translations = {
  en,
  ...Object.fromEntries(
    Object.entries(partials).map(([code, partial]) => [code, withFallback(en, partial)])
  ),
} as Record<Language, Translations>;

export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}
