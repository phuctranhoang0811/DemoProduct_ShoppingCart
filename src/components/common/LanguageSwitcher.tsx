'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { COUNTRIES, flagUrl } from '@/i18n/languages';

const COUNTRY_STORAGE_KEY = 'hellobee_country';

interface LanguageSwitcherProps {
  dark?: boolean;
  align?: 'left' | 'right';
  panelClassName?: string;
}

export function LanguageSwitcher({
  dark = false,
  align = 'right',
  panelClassName = 'w-[min(520px,calc(100vw-2rem))]',
}: LanguageSwitcherProps) {
  const { t, language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCountryCode(window.localStorage.getItem(COUNTRY_STORAGE_KEY));
  }, []);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // The saved country only counts while it still maps to the active language.
  const activeCountry =
    COUNTRIES.find((c) => c.code === countryCode && c.language === language) ??
    COUNTRIES.find((c) => c.language === language) ??
    COUNTRIES[0];

  const choose = (code: string, lang: (typeof COUNTRIES)[number]['language']) => {
    setOpen(false);
    setCountryCode(code);
    window.localStorage.setItem(COUNTRY_STORAGE_KEY, code);
    setLanguage(lang);
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.header.changeLanguage}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 text-[10px] font-bold rounded-full border transition-colors btn-tactile ${
          dark
            ? 'border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
            : 'border-[#E5E5E5] bg-[#F5F4F0] text-[#333333] hover:bg-[#EAE8E3]'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flagUrl(activeCountry.code)}
          alt=""
          width={20}
          height={14}
          className="w-5 h-3.5 rounded-[3px] object-cover"
        />
        <span>{activeCountry.code}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t.header.language}
          className={`absolute top-full mt-2 z-50 rounded-2xl border border-[#E5E5E5] bg-[#F3F4F6] p-4 shadow-xl ${panelClassName} ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <ul className="flex flex-wrap justify-center gap-3">
            {COUNTRIES.map((c) => {
              const selected = c.code === activeCountry.code;
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => choose(c.code, c.language)}
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={selected}
                    className={`relative block w-12 h-8 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.3)] transition-transform hover:scale-110 focus-visible:scale-110 outline-none focus-visible:ring-2 focus-visible:ring-[var(--honey-strong)] ${
                      selected ? 'ring-2 ring-[var(--honey-strong)]' : ''
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flagUrl(c.code)} alt="" width={48} height={32} loading="lazy" className="w-full h-full object-cover" />
                    {selected && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <Check className="w-4 h-4 text-white" />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
