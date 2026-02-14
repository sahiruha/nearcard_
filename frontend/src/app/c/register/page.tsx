'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCardByCardId, linkCard } from '@/lib/card-binding';
import { getProfile, encodeProfileForUrl } from '@/lib/profile';
import { CreditCard, Link2, AlertTriangle, CheckCircle } from 'lucide-react';

type PageState = 'loading' | 'need-wallet' | 'ready' | 'already-linked' | 'success' | 'error';

function CardRegisterContent() {
  const searchParams = useSearchParams();
  const cardId = searchParams.get('cardId');
  const { accountId, isSignedIn, isLoading: walletLoading, signIn } = useWallet();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (!cardId) {
      setPageState('error');
      setErrorMessage('Card ID is not specified.');
      return;
    }

    if (walletLoading) return;

    if (!isSignedIn) {
      setPageState('need-wallet');
      return;
    }

    getCardByCardId(cardId).then((card) => {
      if (card && card.accountId) {
        if (card.accountId === accountId) {
          setPageState('already-linked');
        } else {
          setPageState('error');
          setErrorMessage('This card is already linked to another account.');
        }
      } else {
        setPageState('ready');
      }
    }).catch(() => {
      setPageState('ready');
    });
  }, [cardId, accountId, isSignedIn, walletLoading]);

  const handleLink = async () => {
    if (!cardId || !accountId) return;

    setLinking(true);

    const profile = getProfile(accountId);
    let defaultUrl = `${window.location.origin}/card/view/?id=${accountId}`;
    if (profile) {
      const encoded = encodeProfileForUrl(profile);
      defaultUrl = `${window.location.origin}/card/view/?id=${accountId}&d=${encoded}`;
    }

    const result = await linkCard(cardId, accountId, defaultUrl);

    if (result.success) {
      setPageState('success');
    } else {
      setPageState('error');
      setErrorMessage(result.error || 'Failed to link the card.');
    }

    setLinking(false);
  };

  if (pageState === 'loading' || walletLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#ff444622] border border-[#ff444666] flex items-center justify-center">
          <AlertTriangle size={32} className="text-danger" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Error</h1>
          <p className="text-sm text-text-secondary max-w-xs">{errorMessage}</p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/card')}>
          Back to My Card
        </Button>
      </div>
    );
  }

  if (pageState === 'need-wallet') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-near-green-dim border border-near-green-mid flex items-center justify-center">
          <CreditCard size={32} className="text-near-green" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary mb-2">NFC Card Registration</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            Connect your wallet to link this NFC card to your account.
          </p>
        </div>
        {cardId && (
          <Card className="p-4 w-full max-w-xs">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-text-tertiary" />
              <div>
                <p className="text-xs text-text-secondary">Card ID</p>
                <p className="text-sm text-text-primary font-mono">{cardId}</p>
              </div>
            </div>
          </Card>
        )}
        <Button onClick={() => signIn()}>
          Connect Wallet
        </Button>
      </div>
    );
  }

  if (pageState === 'already-linked') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-near-green-dim border border-near-green-mid flex items-center justify-center">
          <CheckCircle size={32} className="text-near-green" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Already Linked</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            This card is already linked to your account.
          </p>
        </div>
        <Button onClick={() => router.push('/card')}>
          Go to My Card
        </Button>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-near-green-dim border border-near-green-mid flex items-center justify-center">
          <CheckCircle size={32} className="text-near-green" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Card Linked!</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            Your NFC card has been linked. Tapping it will now show your profile.
          </p>
        </div>
        <Button onClick={() => router.push('/card')}>
          Go to My Card
        </Button>
      </div>
    );
  }

  // pageState === 'ready'
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-near-green-dim border border-near-green-mid flex items-center justify-center">
        <Link2 size={32} className="text-near-green" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-text-primary mb-2">Link NFC Card</h1>
        <p className="text-sm text-text-secondary max-w-xs">
          Link this NFC card to your NEAR account. Share your profile with a tap.
        </p>
      </div>

      <Card className="p-4 w-full max-w-xs">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-text-tertiary" />
            <div>
              <p className="text-xs text-text-secondary">Card ID</p>
              <p className="text-sm text-text-primary font-mono">{cardId}</p>
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-near-green" />
              <div>
                <p className="text-xs text-text-secondary">Account</p>
                <p className="text-sm text-text-primary">{accountId}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Button onClick={handleLink} loading={linking}>
        <Link2 size={16} />
        Link This Card
      </Button>
    </div>
  );
}

export default function CardRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-text-secondary">Loading...</div>
        </div>
      }
    >
      <CardRegisterContent />
    </Suspense>
  );
}
