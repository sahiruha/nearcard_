'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCardByCardId, linkCard } from '@/lib/card-binding';
import { getProfile, encodeProfileForUrl } from '@/lib/profile';
import { useI18n } from '@/lib/i18n';
import { CreditCard, Link2, AlertTriangle, CheckCircle } from 'lucide-react';

type PageState = 'loading' | 'need-wallet' | 'ready' | 'already-linked' | 'success' | 'error';

function CardRegisterContent() {
  const searchParams = useSearchParams();
  const cardId = searchParams.get('cardId');
  const { accountId, isSignedIn, isLoading: walletLoading, signIn } = useWallet();
  const { t } = useI18n();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (!cardId) {
      setPageState('error');
      setErrorMessage(t('register.noCardId'));
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
          setErrorMessage(t('register.alreadyLinkedOther'));
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
      setErrorMessage(result.error || t('register.linkFailed'));
    }

    setLinking(false);
  };

  if (pageState === 'loading' || walletLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-text-secondary">{t('common.loading')}</div>
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
          <h1 className="text-xl font-bold text-text-primary mb-2">{t('common.error')}</h1>
          <p className="text-sm text-text-secondary max-w-xs">{errorMessage}</p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/card')}>
          {t('register.backToCard')}
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
          <h1 className="text-xl font-bold text-text-primary mb-2">{t('register.title')}</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            {t('register.connectDesc')}
          </p>
        </div>
        {cardId && (
          <Card className="p-4 w-full max-w-xs">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-text-tertiary" />
              <div>
                <p className="text-xs text-text-secondary">{t('register.cardId')}</p>
                <p className="text-sm text-text-primary font-mono">{cardId}</p>
              </div>
            </div>
          </Card>
        )}
        <Button onClick={() => signIn()}>
          {t('common.connectWallet')}
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
          <h1 className="text-xl font-bold text-text-primary mb-2">{t('register.alreadyLinked')}</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            {t('register.alreadyLinkedDesc')}
          </p>
        </div>
        <Button onClick={() => router.push('/card')}>
          {t('register.goToCard')}
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
          <h1 className="text-xl font-bold text-text-primary mb-2">{t('register.cardLinked')}</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            {t('register.cardLinkedDesc')}
          </p>
        </div>
        <Button onClick={() => router.push('/card')}>
          {t('register.goToCard')}
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
        <h1 className="text-xl font-bold text-text-primary mb-2">{t('register.linkTitle')}</h1>
        <p className="text-sm text-text-secondary max-w-xs">
          {t('register.linkDesc')}
        </p>
      </div>

      <Card className="p-4 w-full max-w-xs">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-text-tertiary" />
            <div>
              <p className="text-xs text-text-secondary">{t('register.cardId')}</p>
              <p className="text-sm text-text-primary font-mono">{cardId}</p>
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-near-green" />
              <div>
                <p className="text-xs text-text-secondary">{t('register.account')}</p>
                <p className="text-sm text-text-primary">{accountId}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Button onClick={handleLink} loading={linking}>
        <Link2 size={16} />
        {t('register.linkButton')}
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
