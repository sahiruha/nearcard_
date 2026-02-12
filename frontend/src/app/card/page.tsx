'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';
import { CardPreview } from '@/components/card/CardPreview';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getProfile } from '@/lib/profile';
import { getSbtsByOwner } from '@/lib/near';
import type { Profile, ConnectionSBT } from '@/lib/types';
import { Plus, Share2, Edit, Shield } from 'lucide-react';

export default function MyCardPage() {
  const { accountId, isSignedIn, isLoading } = useWallet();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sbts, setSbts] = useState<ConnectionSBT[]>([]);

  useEffect(() => {
    if (accountId) {
      const p = getProfile(accountId);
      setProfile(p);
      getSbtsByOwner(accountId).then(setSbts).catch(() => {});
    }
  }, [accountId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-near-green-dim border border-near-green-mid flex items-center justify-center">
          <Shield size={32} className="text-near-green" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary mb-2">NEAR Digital Card</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            Connect your wallet to create and share your blockchain-powered digital business card.
          </p>
        </div>
        <Button onClick={() => router.push('/card')}>
          Connect Wallet to Start
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-near-green-dim border border-near-green-mid flex items-center justify-center">
          <Plus size={32} className="text-near-green" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Create Your Card</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            Set up your profile to start sharing your digital business card.
          </p>
        </div>
        <Button onClick={() => router.push('/card/create')}>
          <Plus size={16} />
          Create Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Card Preview */}
      <Card className="p-6">
        <CardPreview profile={profile} />
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="flex-1" onClick={() => router.push('/share')}>
          <Share2 size={16} />
          Share
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => router.push('/card/edit')}>
          <Edit size={16} />
          Edit
        </Button>
      </div>

      {/* Connection Stats */}
      {sbts.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-secondary">Connections (SBT)</p>
              <p className="text-2xl font-bold text-near-green">{sbts.length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary">Latest</p>
              <p className="text-sm text-text-primary">
                {sbts[sbts.length - 1]?.event_name || 'Direct'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
