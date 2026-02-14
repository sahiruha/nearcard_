'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { unlinkCard } from '@/lib/card-binding';
import type { NfcCard } from '@/lib/types';
import { CreditCard, Unlink, Zap, Loader2 } from 'lucide-react';

interface NfcCardManagerProps {
  cards: NfcCard[];
  accountId: string;
  onCardUnlinked: () => void;
}

export function NfcCardManager({ cards, accountId, onCardUnlinked }: NfcCardManagerProps) {
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleUnlink = async (cardId: string) => {
    setUnlinkingId(cardId);
    const result = await unlinkCard(cardId, accountId);
    if (result.success) {
      onCardUnlinked();
    }
    setUnlinkingId(null);
    setConfirmId(null);
  };

  if (cards.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <CreditCard size={18} className="text-text-tertiary" />
          <div>
            <p className="text-sm text-text-secondary">No NFC cards linked</p>
            <p className="text-xs text-text-tertiary">
              Tap an NFC card to start linking it to your account.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {cards.map((card) => (
        <Card key={card.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-near-green-dim flex items-center justify-center">
                <CreditCard size={14} className="text-near-green" />
              </div>
              <div>
                <p className="text-sm font-mono text-text-primary">
                  {card.cardId.length > 16
                    ? `${card.cardId.slice(0, 8)}...${card.cardId.slice(-4)}`
                    : card.cardId}
                </p>
                <div className="flex items-center gap-2">
                  {card.isPartyMode && (
                    <span className="flex items-center gap-1 text-xs text-near-green">
                      <Zap size={10} />
                      Party
                    </span>
                  )}
                  {card.linkedAt && (
                    <span className="text-xs text-text-tertiary">
                      Linked {new Date(card.linkedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              {confirmId === card.cardId ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleUnlink(card.cardId)}
                    loading={unlinkingId === card.cardId}
                    className="!border-danger !text-danger"
                  >
                    {unlinkingId === card.cardId ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Unlink size={12} />
                    )}
                    Unlink
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(card.cardId)}
                  className="text-text-tertiary hover:text-danger transition-colors cursor-pointer"
                >
                  <Unlink size={14} />
                </button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
