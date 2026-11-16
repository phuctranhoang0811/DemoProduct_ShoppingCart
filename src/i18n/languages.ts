import type { Language } from './types';

export const DEFAULT_LANGUAGE: Language = 'en';

export interface LanguageOption {
  code: Language;
  label: string;
  dir: 'ltr' | 'rtl';
}

export interface CountryOption {
  code: string;
  name: string;
  language: Language;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'pt', label: 'Português', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', dir: 'ltr' },
  { code: 'zh-HK', label: '繁體中文（香港）', dir: 'ltr' },
  { code: 'hi', label: 'हिन्दी', dir: 'ltr' },
  { code: 'id', label: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'it', label: 'Italiano', dir: 'ltr' },
  { code: 'ja', label: '日本語', dir: 'ltr' },
  { code: 'ms', label: 'Bahasa Melayu', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'mn', label: 'Монгол', dir: 'ltr' },
  { code: 'fil', label: 'Filipino', dir: 'ltr' },
  { code: 'ru', label: 'Русский', dir: 'ltr' },
  { code: 'ko', label: '한국어', dir: 'ltr' },
  { code: 'zh-TW', label: '繁體中文（台灣）', dir: 'ltr' },
  { code: 'th', label: 'ไทย', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'km', label: 'ខ្មែរ', dir: 'ltr' },
  { code: 'ro', label: 'Română', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe', dir: 'ltr' },
];

// Order matches the flag picker rows in the UI.
export const COUNTRIES: CountryOption[] = [
  { code: 'AU', name: 'Australia', language: 'en' },
  { code: 'BR', name: 'Brasil', language: 'pt' },
  { code: 'CA', name: 'Canada', language: 'en' },
  { code: 'FR', name: 'France', language: 'fr' },
  { code: 'DE', name: 'Deutschland', language: 'de' },
  { code: 'HK', name: '香港', language: 'zh-HK' },
  { code: 'IN', name: 'भारत', language: 'hi' },
  { code: 'ID', name: 'Indonesia', language: 'id' },
  { code: 'IT', name: 'Italia', language: 'it' },
  { code: 'JP', name: '日本', language: 'ja' },
  { code: 'MY', name: 'Malaysia', language: 'ms' },
  { code: 'MX', name: 'México', language: 'es' },
  { code: 'MN', name: 'Монгол', language: 'mn' },
  { code: 'PY', name: 'Paraguay', language: 'es' },
  { code: 'PH', name: 'Pilipinas', language: 'fil' },
  { code: 'PT', name: 'Portugal', language: 'pt' },
  { code: 'RU', name: 'Россия', language: 'ru' },
  { code: 'SG', name: 'Singapore', language: 'en' },
  { code: 'KR', name: '대한민국', language: 'ko' },
  { code: 'TW', name: '台灣', language: 'zh-TW' },
  { code: 'TH', name: 'ประเทศไทย', language: 'th' },
  { code: 'AE', name: 'الإمارات', language: 'ar' },
  { code: 'US', name: 'United States', language: 'en' },
  { code: 'KH', name: 'កម្ពុជា', language: 'km' },
  { code: 'RO', name: 'România', language: 'ro' },
  { code: 'TR', name: 'Türkiye', language: 'tr' },
];

export const flagUrl = (countryCode: string) =>
  `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
