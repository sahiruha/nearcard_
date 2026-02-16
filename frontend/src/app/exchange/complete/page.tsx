'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { getExplorerUrl } from '@/lib/near';
import { useI18n } from '@/lib/i18n';
import { ArrowLeft, MessageCircle, Tag, StickyNote } from 'lucide-react';

interface ExchangeData {
  party_a: string;
  party_b: string;
  event_name: string;
  transfer_amount: string;
  tx_hash: string;
}

function ExchangeCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [exchangeData, setExchangeData] = useState<ExchangeData | null>(null);

  useEffect(() => {
    const txHash = searchParams.get('transactionHashes') || '';
    const stored = sessionStorage.getItem('lastExchange');
    if (stored) {
      const data = JSON.parse(stored) as ExchangeData;
      if (txHash) data.tx_hash = txHash;
      setExchangeData(data);
    } else if (txHash) {
      setExchangeData({
        party_a: '',
        party_b: '',
        event_name: 'Direct Exchange',
        transfer_amount: '10000000000000000000000',
        tx_hash: txHash,
      });
    }
  }, [searchParams]);

  const formatNear = (yocto: string) => {
    const near = Number(yocto) / 1e24;
    return near.toFixed(2);
  };

  const initialsOf = (id: string) =>
    id.replace('.near', '').replace('.testnet', '').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-5 items-center">
      {/* Sparkle header */}
      <div className="text-center pt-6 pb-2">
        <div className="text-5xl mb-3 animate-pulse">&#10024;</div>
        <h1
          className="text-2xl font-extrabold"
          style={{
            background: 'linear-gradient(135deg, var(--near-green), var(--blue))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t('complete.connected')}
        </h1>
        <p className="text-[13px] text-text-secondary mt-1">{t('complete.connectedSub')}</p>
      </div>

      {/* Handshake visual */}
      {exchangeData && (exchangeData.party_a || exchangeData.party_b) && (
        <div className="flex items-center justify-center gap-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-near-green to-nc-blue flex items-center justify-center text-base font-bold text-black">
            {initialsOf(exchangeData.party_a)}
          </div>
          <div className="w-10 h-0.5 rounded-full bg-gradient-to-r from-near-green to-nc-blue" />
          <span className="text-2xl">&#129309;</span>
          <div className="w-10 h-0.5 rounded-full bg-gradient-to-r from-nc-blue to-near-green" />
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-nc-purple to-near-green flex items-center justify-center text-base font-bold text-black">
            {initialsOf(exchangeData.party_b)}
          </div>
        </div>
      )}

      {/* SBT Card */}
      {exchangeData && (
        <div
          className="w-full rounded-[var(--radius-lg)] p-4 border border-near-green-mid"
          style={{
            background: 'linear-gradient(135deg, rgba(0,236,151,0.08), rgba(68,136,255,0.08))',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">&#127915;</span>
            <span className="text-[15px] font-bold text-near-green">{t('complete.sbt')}</span>
          </div>
          {exchangeData.event_name && (
            <div className="flex justify-between text-xs py-1">
              <span className="text-text-tertiary">{t('complete.location')}</span>
              <span className="text-text-secondary font-medium">{exchangeData.event_name}</span>
            </div>
          )}
          {exchangeData.tx_hash && (
            <div className="flex justify-between text-xs py-1">
              <span className="text-text-tertiary">{t('complete.tx')}</span>
              <a
                href={getExplorerUrl(exchangeData.tx_hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-near-green font-medium hover:opacity-80"
              >
                {exchangeData.tx_hash.slice(0, 4)}...{exchangeData.tx_hash.slice(-4)} &#8599;
              </a>
            </div>
          )}
        </div>
      )}

      {/* NEAR received badge */}
      {exchangeData && (
        <div className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-near-green-dim border border-near-green-mid rounded-[var(--radius-md)]">
          <span className="text-xl">&#9830;</span>
          <div>
            <div className="text-lg font-bold text-near-green">
              +{formatNear(exchangeData.transfer_amount)} NEAR
            </div>
            <div className="text-xs text-text-secondary">{t('complete.received')}</div>
          </div>
        </div>
      )}

      {/* What's Next */}
      <div className="w-full">
        <div className="text-[11px] font-semibold tracking-[1.5px] uppercase text-text-tertiary mb-3">
          {t('complete.whatsNext')}
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-bg-card border border-border rounded-[var(--radius-md)] text-xs font-medium text-text-secondary hover:border-near-green hover:text-near-green transition-all cursor-pointer">
            <MessageCircle size={14} />
            {t('complete.message')}
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-bg-card border border-border rounded-[var(--radius-md)] text-xs font-medium text-text-secondary hover:border-near-green hover:text-near-green transition-all cursor-pointer">
            <Tag size={14} />
            {t('complete.tag')}
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-bg-card border border-border rounded-[var(--radius-md)] text-xs font-medium text-text-secondary hover:border-near-green hover:text-near-green transition-all cursor-pointer">
            <StickyNote size={14} />
            {t('complete.note')}
          </button>
        </div>
      </div>

      {/* Back button */}
      <Button variant="secondary" onClick={() => router.push('/card')} className="w-full mt-2">
        <ArrowLeft size={16} />
        {t('complete.backHome')}
      </Button>
    </div>
  );
}

export default function ExchangeCompletePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-text-secondary">Loading...</div></div>}>
      <ExchangeCompleteContent />
    </Suspense>
  );
}
