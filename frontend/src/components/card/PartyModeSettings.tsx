'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { LinkItem } from '@/lib/types';
import { ExternalLink, Check, Globe, ArrowLeft } from 'lucide-react';

interface PartyModeSettingsProps {
  links: LinkItem[];
  currentUrl: string | null;
  onSave: (link: LinkItem) => void;
  onBack: () => void;
}

export function PartyModeSettings({ links, currentUrl, onSave, onBack }: PartyModeSettingsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    if (!currentUrl) return -1;
    return links.findIndex((l) => l.url === currentUrl);
  });

  const selectedLink = selectedIndex >= 0 ? links[selectedIndex] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-text-tertiary hover:text-text-primary transition-colors cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Party Mode Link</h2>
          <p className="text-xs text-text-secondary">NFCタップ時のリダイレクト先を選択</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {links.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-text-secondary text-center">
              プロフィールにリンクを追加してから設定してください。
            </p>
          </Card>
        ) : (
          links.map((link, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border transition-all duration-200 text-left cursor-pointer ${
                selectedIndex === i
                  ? 'bg-[#00ec9712] border-near-green-mid'
                  : 'bg-bg-card border-border hover:border-border-light'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedIndex === i ? 'bg-near-green-dim' : 'bg-bg-input'
                }`}
              >
                {selectedIndex === i ? (
                  <Check size={14} className="text-near-green" />
                ) : (
                  <Globe size={14} className="text-text-tertiary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {link.label || link.type}
                </p>
                <p className="text-xs text-text-tertiary truncate">{link.url}</p>
              </div>
              <ExternalLink size={14} className="text-text-tertiary flex-shrink-0" />
            </button>
          ))
        )}
      </div>

      {selectedLink && (
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <ExternalLink size={14} className="text-near-green flex-shrink-0" />
            <p className="text-xs text-text-secondary truncate">
              Redirect to: <span className="text-text-primary">{selectedLink.url}</span>
            </p>
          </div>
        </Card>
      )}

      <Button
        onClick={() => selectedLink && onSave(selectedLink)}
        disabled={!selectedLink}
        className="w-full"
      >
        Save Party Mode Link
      </Button>
    </div>
  );
}
