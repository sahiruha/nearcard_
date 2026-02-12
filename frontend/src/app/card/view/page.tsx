'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CardPreview } from '@/components/card/CardPreview';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { decodeProfileFromUrl, downloadVCard, getProfile } from '@/lib/profile';
import type { Profile } from '@/lib/types';
import { Download, ArrowRightLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';

function PublicCardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, accountId } = useWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const targetAccountId = searchParams.get('id') || '';

  useEffect(() => {
    if (!targetAccountId) return;
    const encoded = searchParams.get('d');
    if (encoded) {
      const decoded = decodeProfileFromUrl(encoded);
      if (decoded) {
        setProfile(decoded);
        return;
      }
    }
    const stored = getProfile(targetAccountId);
    if (stored) setProfile(stored);
  }, [targetAccountId, searchParams]);

  if (!targetAccountId || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-lg font-semibold text-text-primary">Card Not Found</p>
        <p className="text-sm text-text-secondary">
          This card may not exist or the link may be expired.
        </p>
      </div>
    );
  }

  const isSelf = accountId === targetAccountId;

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <CardPreview profile={profile} />
      </Card>

      <div className="flex flex-col gap-3">
        <Button variant="secondary" onClick={() => downloadVCard(profile)} className="w-full">
          <Download size={16} />
          Save Contact (.vcf)
        </Button>

        {!isSelf && (
          <Button
            onClick={() => router.push(`/exchange/confirm/?id=${targetAccountId}`)}
            className="w-full"
          >
            <ArrowRightLeft size={16} />
            Exchange Cards
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-text-tertiary">
        No account needed to view this card or save the contact.
      </p>
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
