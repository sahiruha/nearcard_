'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/providers/WalletProvider';
import { QRCodeDisplay } from '@/components/exchange/QRCodeDisplay';
import { Card } from '@/components/ui/Card';
import { getProfile, encodeProfileForUrl } from '@/lib/profile';
import type { Profile } from '@/lib/types';
import { QrCode } from 'lucide-react';

export default function SharePage() {
  const { accountId, isSignedIn } = useWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (accountId) {
      const p = getProfile(accountId);
      setProfile(p);
      if (p && typeof window !== 'undefined') {
        const encoded = encodeProfileForUrl(p);
        const url = `${window.location.origin}/card/view/?id=${accountId}&d=${encoded}`;
        setShareUrl(url);
      }
    }
  }, [accountId]);

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-text-secondary">Connect your wallet to share your card.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-text-secondary">Create your profile first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-lg font-bold text-text-primary mb-1">Share Your Card</h1>
        <p className="text-sm text-text-secondary">
          Scan the QR code or share the link
        </p>
      </div>

      <Card className="p-6 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-near-green-dim border border-near-green-mid flex items-center justify-center mb-4">
          <QrCode size={24} className="text-near-green" />
        </div>
        {shareUrl && <QRCodeDisplay url={shareUrl} />}
      </Card>

      <div className="text-center">
        <p className="text-xs text-text-tertiary">
          Recipients can view your card without an account (Level 0).
          <br />
          They can connect a wallet to exchange cards and receive SBT + 0.01 NEAR.
        </p>
      </div>
    </div>
  );
}
