'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';
import { CardPreview } from '@/components/card/CardPreview';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getProfile } from '@/lib/profile';
import { getTransferAmount } from '@/lib/near';
import type { Profile } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { ArrowRightLeft, Shield, Coins } from 'lucide-react';

function ExchangeConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accountId, isSignedIn, isLoading, signIn, callMethod } = useWallet();
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transferAmount, setTransferAmount] = useState<string>('0');
  const [exchanging, setExchanging] = useState(false);
  const targetAccountId = searchParams.get('id') || '';

  useEffect(() => {
    if (!targetAccountId) return;
    const stored = getProfile(targetAccountId);
    if (stored) setProfile(stored);

    getTransferAmount()
      .then((amount) => setTransferAmount(amount))
      .catch(() => {});
  }, [targetAccountId]);

  const handleExchange = async () => {
    if (!accountId || !targetAccountId) return;
    setExchanging(true);

    try {
      const result = await callMethod({
        methodName: 'exchange_cards',
        args: {
          party_b: targetAccountId,
          event_name: 'Direct Exchange',
        },
        gas: '30000000000000',
        deposit: '0',
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'lastExchange',
          JSON.stringify({
            party_a: accountId,
            party_b: targetAccountId,
            event_name: 'Direct Exchange',
            transfer_amount: transferAmount,
            tx_hash: (result as { transaction?: { hash?: string } })?.transaction?.hash || '',
          }),
        );
      }

      router.push('/exchange/complete/');
    } catch (err) {
      console.error('Exchange failed:', err);
      setExchanging(false);
    }
  };

  const formatNear = (yocto: string) => {
    const near = Number(yocto) / 1e24;
    return near.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-text-secondary">{t('common.loading')}</div>
      </div>
    );
  }

  if (!targetAccountId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-text-secondary">{t('exchange.noTarget')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-lg font-bold text-text-primary mb-1">{t('exchange.title')}</h1>
        <p className="text-sm text-text-secondary">
          {t('exchange.subtitle')}
        </p>
      </div>

      {profile && (
        <Card className="p-6">
          <CardPreview profile={profile} showLinks={false} />
        </Card>
      )}

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">{t('exchange.whatHappens')}</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-near-green-dim border border-near-green-mid flex items-center justify-center shrink-0">
              <Shield size={14} className="text-near-green" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{t('exchange.sbtTitle')}</p>
              <p className="text-xs text-text-secondary">
                {t('exchange.sbtDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-near-green-dim border border-near-green-mid flex items-center justify-center shrink-0">
              <Coins size={14} className="text-near-green" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {t('exchange.nearReceived', { amount: formatNear(transferAmount) })}
              </p>
              <p className="text-xs text-text-secondary">
                {t('exchange.nearReceivedDesc', { account: targetAccountId, amount: formatNear(transferAmount) })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {isSignedIn ? (
        accountId === targetAccountId ? (
          <p className="text-center text-sm text-danger">
            {t('exchange.selfError')}
          </p>
        ) : (
          <Button onClick={handleExchange} loading={exchanging} className="w-full">
            <ArrowRightLeft size={16} />
            {t('exchange.title')}
          </Button>
        )
      ) : (
        <Button onClick={signIn} className="w-full">
          {t('exchange.connectToExchange')}
        </Button>
      )}
    </div>
  );
}

export default function ExchangeConfirmPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-text-secondary">Loading...</div></div>}>
      <ExchangeConfirmContent />
    </Suspense>
  );
}
