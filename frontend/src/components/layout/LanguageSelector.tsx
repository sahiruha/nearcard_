'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n, type Locale } from '@/lib/i18n';
import { Globe } from 'lucide-react';

const localeOptions: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
  { value: 'ko', label: '한국어' },
];

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = localeOptions.find((o) => o.value === locale);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary hover:text-text-primary transition-colors rounded-md hover:bg-bg-card cursor-pointer"
      >
        <Globe size={14} />
        <span>{current?.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-bg-card border border-border rounded-[var(--radius-md)] shadow-lg overflow-hidden z-50 min-w-[100px]">
          {localeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setLocale(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${
                opt.value === locale
                  ? 'text-near-green bg-near-green-dim'
                  : 'text-text-secondary hover:bg-bg-input hover:text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
