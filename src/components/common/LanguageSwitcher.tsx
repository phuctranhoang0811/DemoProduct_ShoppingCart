'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'vi', label: 'Tiếng Việt', short: 'VI' },
  { code: 'ja', label: '日本語', short: 'JA' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'ko', label: '한국어', short: 'KO' },
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate: { TranslateElement: new (opts: object, id: string) => void } };
  }
}

function readLang(): string {
  const m = document.cookie.match(/(?:^|; )googtrans=\/[^/]*\/([^;]+)/);
  return m ? decodeURIComponent(m[1]) : 'en';
}

function writeLang(code: string) {
  const value = code === 'en' ? '' : `/en/${code}`;
  const expires = code === 'en' ? 'Thu, 01 Jan 1970 00:00:00 GMT' : '';
  const host = window.location.hostname;
  document.cookie = `googtrans=${value}; path=/; expires=${expires}`;
  document.cookie = `googtrans=${value}; path=/; domain=${host}; expires=${expires}`;
}

// Google Translate rewrites text nodes, which breaks React's DOM bookkeeping unless these are guarded.
function guardReactDom() {
  const w = window as unknown as { __translateGuard?: boolean };
  if (w.__translateGuard) return;
  w.__translateGuard = true;
  const origRemove = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return origRemove.call(this, child) as T;
  };
  const origInsert = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return origInsert.call(this, node, ref) as T;
  };
}

function loadTranslator(onReady: () => void) {
  guardReactDom();
  const apply = () => {
    let tries = 0;
    const timer = window.setInterval(() => {
      const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (combo || ++tries > 50) {
        window.clearInterval(timer);
        if (combo) onReady();
      }
    }, 100);
  };
  if (document.getElementById('google-translate-script')) {
    apply();
    return;
  }
  window.googleTranslateElementInit = () => {
    new window.google!.translate.TranslateElement(
      { pageLanguage: 'en', includedLanguages: 'vi,ja,es,ko', autoDisplay: false },
      'google_translate_element'
    );
    apply();
  };
  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.body.appendChild(script);
}

function setComboLanguage(code: string) {
  const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (!combo) return;
  combo.value = code;
  combo.dispatchEvent(new Event('change'));
}

export function LanguageSwitcher({ dark = false, align = 'right' }: { dark?: boolean; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('en');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lang = readLang();
    setCurrent(lang);
    if (lang !== 'en') loadTranslator(() => undefined);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const choose = (code: string) => {
    setOpen(false);
    if (code === current) return;
    writeLang(code);
    setCurrent(code);
    // Restoring the original English text needs a clean reload; other languages translate in place.
    if (code === 'en') {
      window.location.reload();
      return;
    }
    loadTranslator(() => setComboLanguage(code));
  };

  const active = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative shrink-0 notranslate" translate="no">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        aria-expanded={open}
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full border transition-colors btn-tactile ${
          dark
            ? 'border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
            : 'border-[#E5E5E5] bg-[#F5F4F0] text-[#333333] hover:bg-[#EAE8E3]'
        }`}
      >
        <Globe className="w-3 h-3" />
        <span>{active.short}</span>
      </button>
      {open && (
        <ul
          className={`absolute top-full mt-2 w-40 bg-white text-[#111111] border border-[#E5E5E5] rounded-md shadow-xl py-1 z-50 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => choose(l.code)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[#F5F4F0]"
              >
                <span>{l.label}</span>
                {l.code === current && <Check className="w-3.5 h-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
