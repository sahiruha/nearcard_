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
import { ArrowRightLeft, Shield, Coins } from 'lucide-react';

function ExchangeConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accountId, isSignedIn, isLoading, signIn, callMethod } = useWallet();
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
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!targetAccountId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-text-secondary">No target account specified.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-lg font-bold text-text-primary mb-1">Exchange Cards</h1>
        <p className="text-sm text-text-secondary">
          Connect on-chain with a Connection Proof SBT
        </p>
      </div>

      {profile && (
        <Card className="p-6">
          <CardPreview profile={profile} showLinks={false} />
        </Card>
      )}

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">What happens</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-near-green-dim border border-near-green-mid flex items-center justify-center shrink-0">
              <Shield size={14} className="text-near-green" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Connection Proof SBT</p>
              <p className="text-xs text-text-secondary">
                A Soulbound Token is minted for both of you as proof of connection.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-near-green-dim border border-near-green-mid flex items-center justify-center shrink-0">
              <Coins size={14} className="text-near-green" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {formatNear(transferAmount)} NEAR Received
              </p>
              <p className="text-xs text-text-secondary">
                {targetAccountId} receives {formatNear(transferAmount)} NEAR from the community pool.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {isSignedIn ? (
        accountId === targetAccountId ? (
          <p className="text-center text-sm text-danger">
            You cannot exchange cards with yourself.
          </p>
        ) : (
          <Button onClick={handleExchange} loading={exchanging} className="w-full">
            <ArrowRightLeft size={16} />
            Exchange Cards
          </Button>
        )
      ) : (
        <Button onClick={signIn} className="w-full">
          Connect Wallet to Exchange
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
