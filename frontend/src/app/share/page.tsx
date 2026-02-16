'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/providers/WalletProvider';
import { QRCodeDisplay } from '@/components/exchange/QRCodeDisplay';
import { Card } from '@/components/ui/Card';
import { getProfile, encodeProfileForUrl } from '@/lib/profile';
import { getCardsByAccount } from '@/lib/card-binding';
import { getApiBaseUrl } from '@/lib/api-client';
import type { Profile, NfcCard } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { QrCode, CreditCard, Zap, Copy, Check } from 'lucide-react';

export default function SharePage() {
  const { accountId, isSignedIn } = useWallet();
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [nfcCards, setNfcCards] = useState<NfcCard[]>([]);
  const [copied, setCopied] = useState(false);

  const primaryCard = nfcCards[0] || null;
  const apiUrl = getApiBaseUrl();
  const nfcUrl = primaryCard
    ? `${apiUrl}/c/${primaryCard.cardId}`
    : null;

  useEffect(() => {
    if (accountId) {
      const p = getProfile(accountId);
      setProfile(p);
      if (p && typeof window !== 'undefined') {
        const encoded = encodeProfileForUrl(p);
        const url = `${window.location.origin}/card/view/?id=${accountId}&d=${encoded}`;
        setShareUrl(url);
      }
      getCardsByAccount(accountId).then(setNfcCards).catch(() => {});
    }
  }, [accountId]);

  const copyNfcUrl = async () => {
    if (!nfcUrl) return;
    await navigator.clipboard.writeText(nfcUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-text-secondary">{t('share.connectFirst')}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-text-secondary">{t('share.createFirst')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-lg font-bold text-text-primary mb-1">{t('share.title')}</h1>
        <p className="text-sm text-text-secondary">
          {t('share.subtitle')}
        </p>
      </div>

      <Card className="p-6 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-near-green-dim border border-near-green-mid flex items-center justify-center mb-4">
          <QrCode size={24} className="text-near-green" />
        </div>
        {shareUrl && <QRCodeDisplay url={shareUrl} />}
      </Card>

      {/* NFC Card Info */}
      {primaryCard && nfcUrl && (
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-near-green-dim flex items-center justify-center">
              <CreditCard size={14} className="text-near-green" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary">{t('share.nfcCard')}</p>
              <div className="flex items-center gap-1">
                {primaryCard.isPartyMode && (
                  <Zap size={10} className="text-near-green" />
                )}
                <p className="text-xs text-text-secondary">
                  {primaryCard.isPartyMode
                    ? t('share.partyMode', { label: primaryCard.partyLinkLabel || 'Active' })
                    : t('share.normalMode')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-bg-input rounded-[var(--radius-md)] overflow-hidden">
              <p className="text-xs text-text-tertiary truncate font-mono">{nfcUrl}</p>
            </div>
            <button
              onClick={copyNfcUrl}
              className="p-2 text-text-tertiary hover:text-near-green transition-colors cursor-pointer"
            >
              {copied ? <Check size={16} className="text-near-green" /> : <Copy size={16} />}
            </button>
          </div>
        </Card>
      )}

      <div className="text-center">
        <p className="text-xs text-text-tertiary">
          {t('share.level0')}
          <br />
          {t('share.level0sbt')}
        </p>
      </div>
    </div>
  );
}
