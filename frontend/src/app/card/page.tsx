'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';
import { CardPreview } from '@/components/card/CardPreview';
import { LinkBlock } from '@/components/card/LinkBlock';
import { PartyModeToggle } from '@/components/card/PartyModeToggle';
import { PartyModeSettings } from '@/components/card/PartyModeSettings';
import { NfcCardManager } from '@/components/card/NfcCardManager';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getProfile } from '@/lib/profile';
import { getSbtsByOwner } from '@/lib/near';
import { getCardsByAccount, updatePartyMode } from '@/lib/card-binding';
import type { Profile, ConnectionSBT, NfcCard, LinkItem } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { Plus, Share2, Edit, Shield, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';

export default function MyCardPage() {
  const { accountId, isSignedIn, isLoading, signIn } = useWallet();
  const { t } = useI18n();
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

    // ONにする時、リンクが未設定ならリンク選択画面を開く
    if (enabled && !primaryCard.partyLinkUrl) {
      setShowPartySettings(true);
      return;
    }

    await updatePartyMode(
      primaryCard.cardId,
      accountId,
      enabled,
      enabled ? primaryCard.partyLinkUrl : primaryCard.partyLinkUrl,
      enabled ? primaryCard.partyLinkLabel : primaryCard.partyLinkLabel
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
        <div className="animate-pulse text-text-secondary">{t('common.loading')}</div>
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
          <h1 className="text-xl font-bold text-text-primary mb-2">{t('card.title')}</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            {t('card.connectDescription')}
          </p>
        </div>
        <Button onClick={() => signIn()}>
          {t('card.connectToStart')}
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
          <h1 className="text-xl font-bold text-text-primary mb-2">{t('card.createTitle')}</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            {t('card.createDescription')}
          </p>
        </div>
        <Button onClick={() => router.push('/card/create')}>
          <Plus size={16} />
          {t('card.createProfile')}
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
    <div className="flex flex-col gap-5">
      {/* My Card with glow effect */}
      <div
        className="relative overflow-hidden bg-bg-card border border-border rounded-[var(--radius-xl)] p-6 text-center"
      >
        {/* Radial glow background */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-60%',
            left: '-20%',
            width: '140%',
            height: '100%',
            background: 'radial-gradient(ellipse, var(--near-green-dim) 0%, transparent 70%)',
          }}
        />

        <div className="relative">
          <CardPreview profile={profile} showLinks={false} />
        </div>

        {/* Divider + Link Hub */}
        {profile.links.length > 0 && (
          <div className="relative mt-4">
            <div className="h-px bg-border mb-4" />
            <div className="text-left">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-text-tertiary mb-3">
                {t('card.linkHub')}
              </div>
              <div className="flex flex-col gap-1.5">
                {profile.links.map((link, i) => (
                  <LinkBlock key={i} link={link} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="flex-1" onClick={() => router.push('/share')}>
          <Share2 size={16} />
          {t('card.share')}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => router.push('/card/edit')}>
          <Edit size={16} />
          {t('card.edit')}
        </Button>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-bg-card border border-border rounded-[var(--radius-md)] p-3 text-center">
          <div className="text-xl font-bold text-text-primary">{sbts.length}</div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wide mt-1">{t('card.connections')}</div>
        </div>
        <div className="bg-bg-card border border-border rounded-[var(--radius-md)] p-3 text-center">
          <div className="text-xl font-bold text-text-primary">{nfcCards.length}</div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wide mt-1">{t('card.nfcCards')}</div>
        </div>
        <div className="bg-bg-card border border-border rounded-[var(--radius-md)] p-3 text-center">
          <div className="text-xl font-bold text-near-green">
            +{(sbts.length * 0.01).toFixed(2)}
          </div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wide mt-1">{t('card.near')}</div>
        </div>
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
                {t('card.nfcCardsCount', { count: nfcCards.length })}
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
