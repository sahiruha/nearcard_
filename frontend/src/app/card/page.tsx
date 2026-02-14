'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';
import { CardPreview } from '@/components/card/CardPreview';
import { PartyModeToggle } from '@/components/card/PartyModeToggle';
import { PartyModeSettings } from '@/components/card/PartyModeSettings';
import { NfcCardManager } from '@/components/card/NfcCardManager';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getProfile } from '@/lib/profile';
import { getSbtsByOwner } from '@/lib/near';
import { getCardsByAccount, updatePartyMode } from '@/lib/card-binding';
import type { Profile, ConnectionSBT, NfcCard, LinkItem } from '@/lib/types';
import { Plus, Share2, Edit, Shield, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';

export default function MyCardPage() {
  const { accountId, isSignedIn, isLoading, signIn } = useWallet();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sbts, setSbts] = useState<ConnectionSBT[]>([]);
  const [nfcCards, setNfcCards] = useState<NfcCard[]>([]);
  const [showPartySettings, setShowPartySettings] = useState(false);
  const [showNfcCards, setShowNfcCards] = useState(false);

  // 現在パーティーモードが有効なカード（最初の1枚を使用）
  const primaryCard = nfcCards[0] || null;

  const loadNfcCards = useCallback(async () => {
    if (!accountId) return;
    const cards = await getCardsByAccount(accountId);
    setNfcCards(cards);
  }, [accountId]);

  useEffect(() => {
    if (accountId) {
      const p = getProfile(accountId);
      setProfile(p);
      getSbtsByOwner(accountId).then(setSbts).catch(() => {});
      loadNfcCards();
    }
  }, [accountId, loadNfcCards]);

  const handlePartyToggle = async (enabled: boolean) => {
    if (!primaryCard || !accountId) return;

    await updatePartyMode(
      primaryCard.cardId,
      accountId,
      enabled,
      primaryCard.partyLinkUrl,
      primaryCard.partyLinkLabel
    );
    await loadNfcCards();
  };

  const handlePartyLinkSave = async (link: LinkItem) => {
    if (!primaryCard || !accountId) return;

    await updatePartyMode(
      primaryCard.cardId,
      accountId,
      true,
      link.url,
      link.label || link.type
    );
    setShowPartySettings(false);
    await loadNfcCards();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-near-green-dim border border-near-green-mid flex items-center justify-center">
          <Shield size={32} className="text-near-green" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary mb-2">NEAR Digital Card</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            Connect your wallet to create and share your blockchain-powered digital business card.
          </p>
        </div>
        <Button onClick={() => signIn()}>
          Connect Wallet to Start
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-near-green-dim border border-near-green-mid flex items-center justify-center">
          <Plus size={32} className="text-near-green" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Create Your Card</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            Set up your profile to start sharing your digital business card.
          </p>
        </div>
        <Button onClick={() => router.push('/card/create')}>
          <Plus size={16} />
          Create Profile
        </Button>
      </div>
    );
  }

  // パーティーモード設定画面
  if (showPartySettings && profile.links.length > 0) {
    return (
      <div className="flex flex-col gap-6">
        <PartyModeSettings
          links={profile.links}
          currentUrl={primaryCard?.partyLinkUrl || null}
          onSave={handlePartyLinkSave}
          onBack={() => setShowPartySettings(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Card Preview */}
      <Card className="p-6">
        <CardPreview profile={profile} />
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="flex-1" onClick={() => router.push('/share')}>
          <Share2 size={16} />
          Share
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => router.push('/card/edit')}>
          <Edit size={16} />
          Edit
        </Button>
      </div>

      {/* Party Mode Toggle (NFCカードがある場合のみ表示) */}
      {primaryCard && (
        <PartyModeToggle
          isEnabled={primaryCard.isPartyMode}
          linkLabel={primaryCard.partyLinkLabel}
          onToggle={handlePartyToggle}
          onConfigure={() => setShowPartySettings(true)}
        />
      )}

      {/* Connection Stats */}
      {sbts.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-secondary">Connections (SBT)</p>
              <p className="text-2xl font-bold text-near-green">{sbts.length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary">Latest</p>
              <p className="text-sm text-text-primary">
                {sbts[sbts.length - 1]?.event_name || 'Direct'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* NFC Cards Section */}
      {nfcCards.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowNfcCards(!showNfcCards)}
            className="flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-text-tertiary" />
              <span className="text-xs font-semibold text-text-secondary">
                NFC Cards ({nfcCards.length})
              </span>
            </div>
            {showNfcCards ? (
              <ChevronUp size={14} className="text-text-tertiary" />
            ) : (
              <ChevronDown size={14} className="text-text-tertiary" />
            )}
          </button>
          {showNfcCards && (
            <NfcCardManager
              cards={nfcCards}
              accountId={accountId!}
              onCardUnlinked={loadNfcCards}
            />
          )}
        </div>
      )}
    </div>
  );
}
