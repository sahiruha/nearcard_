'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CardPreview } from '@/components/card/CardPreview';
import { LinkList } from '@/components/card/LinkList';
import { Button } from '@/components/ui/Button';
import { decodeProfileFromUrl, downloadVCard, getProfile, getProfileAsync } from '@/lib/profile';
import type { Profile } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { Download, ArrowRightLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';

function PublicCardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, accountId } = useWallet();
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const targetAccountId = searchParams.get('id') || '';

  useEffect(() => {
    if (!targetAccountId) {
      setLoading(false);
      return;
    }

    const encoded = searchParams.get('d');
    if (encoded) {
      const decoded = decodeProfileFromUrl(encoded);
      if (decoded) {
        setProfile(decoded);
        setLoading(false);
        return;
      }
    }

    const stored = getProfile(targetAccountId);
    if (stored) {
      setProfile(stored);
      setLoading(false);
      return;
    }

    getProfileAsync(targetAccountId).then((p) => {
      if (p) setProfile(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [targetAccountId, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-text-secondary">{t('common.loading')}</div>
      </div>
    );
  }

  if (!targetAccountId || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-lg font-semibold text-text-primary">{t('view.cardNotFound')}</p>
        <p className="text-sm text-text-secondary">
          {t('view.cardNotFoundDesc')}
        </p>
      </div>
    );
  }

  const isSelf = accountId === targetAccountId;

  return (
    <div className="flex flex-col gap-5">
      {/* Landing Hero */}
      <div className="text-center pt-2">
        <p className="text-[13px] text-text-secondary">
          {t('view.receivedCard', { name: profile.nearAccount || targetAccountId })}
        </p>
      </div>

      {/* Profile Card */}
      <CardPreview profile={profile} showLinks={false} />

      {/* Badges */}
      <div className="flex gap-1.5 justify-center flex-wrap">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-near-green-dim text-near-green border border-near-green-mid">
          {t('common.nearAccount')}
        </span>
      </div>

      {/* Links Section */}
      {profile.links.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold tracking-[1.5px] uppercase text-text-tertiary mb-3">
            {t('view.links', { name: profile.name.split(' ')[0] })}
          </div>
          <LinkList links={profile.links} />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2.5 mt-2">
        <Button onClick={() => downloadVCard(profile)} className="w-full">
          <Download size={16} />
          {t('view.saveContact')}
        </Button>

        {!isSelf && (
          <Button
            variant="secondary"
            onClick={() => router.push(`/exchange/confirm/?id=${targetAccountId}`)}
            className="w-full border-near-green text-near-green"
          >
            <ArrowRightLeft size={16} />
            {t('view.exchangeCards')}
          </Button>
        )}

        <p className="text-center text-[11px] text-text-tertiary mt-1">
          {t('view.exchangeHint')}
        </p>
      </div>
    </div>
  );
}

export default function PublicCardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-text-secondary">Loading...</div></div>}>
      <PublicCardContent />
    </Suspense>
  );
}
