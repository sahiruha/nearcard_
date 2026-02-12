'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getExplorerUrl } from '@/lib/near';
import { CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react';

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

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="w-16 h-16 rounded-full bg-near-green-dim border border-near-green-mid flex items-center justify-center">
          <CheckCircle size={32} className="text-near-green" />
        </div>
        <h1 className="text-xl font-bold text-text-primary">Exchange Complete!</h1>
        <p className="text-sm text-text-secondary text-center">
          Connection Proof SBTs have been minted for both parties.
        </p>
      </div>

      {exchangeData && (
        <Card className="p-4 w-full">
          <div className="flex flex-col gap-3">
            {exchangeData.party_a && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary">From</span>
                <span className="text-sm text-text-primary font-medium truncate max-w-[200px]">
                  {exchangeData.party_a}
                </span>
              </div>
            )}
            {exchangeData.party_b && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary">To</span>
                <span className="text-sm text-text-primary font-medium truncate max-w-[200px]">
                  {exchangeData.party_b}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Event</span>
              <span className="text-sm text-text-primary">{exchangeData.event_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">NEAR Transferred</span>
              <span className="text-sm text-near-green font-semibold">
                {formatNear(exchangeData.transfer_amount)} NEAR
              </span>
            </div>
            {exchangeData.tx_hash && (
              <>
                <div className="border-t border-border my-1" />
                <a
                  href={getExplorerUrl(exchangeData.tx_hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-nc-blue hover:opacity-80 transition-opacity"
                >
                  <ExternalLink size={14} />
                  View on Explorer
                </a>
              </>
            )}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3 w-full">
        <Button onClick={() => router.push('/card')} className="w-full">
          <ArrowLeft size={16} />
          Back to My Card
        </Button>
      </div>
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
