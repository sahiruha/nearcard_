'use client';

import { Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface PartyModeToggleProps {
  isEnabled: boolean;
  linkLabel: string | null;
  onToggle: (enabled: boolean) => void;
  onConfigure: () => void;
}

export function PartyModeToggle({ isEnabled, linkLabel, onToggle, onConfigure }: PartyModeToggleProps) {
  const { t } = useI18n();

  return (
    <div
      className={`p-4 rounded-[var(--radius-lg)] border transition-all duration-200 ${
        isEnabled
          ? 'bg-[#00ec9712] border-near-green-mid'
          : 'bg-bg-card border-border'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isEnabled ? 'bg-near-green-dim' : 'bg-bg-input'
            }`}
          >
            <Zap size={16} className={isEnabled ? 'text-near-green' : 'text-text-tertiary'} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{t('party.title')}</p>
            <p className="text-xs text-text-secondary">
              {isEnabled
                ? linkLabel
                  ? t('party.active', { label: linkLabel })
                  : t('party.selectLink')
                : t('party.off')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEnabled && (
            <button
              onClick={onConfigure}
              className="text-xs text-near-green hover:opacity-80 cursor-pointer"
            >
              {t('party.change')}
            </button>
          )}
          {/* Toggle switch */}
          <button
            onClick={() => onToggle(!isEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
              isEnabled ? 'bg-near-green' : 'bg-bg-input border border-border'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200 ${
                isEnabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-text-tertiary'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
