'use client';

import { useWallet } from '@/components/providers/WalletProvider';
import { Button } from '@/components/ui/Button';
import { Wallet, LogOut } from 'lucide-react';

export function ConnectButton() {
  const { isSignedIn, accountId, isLoading, signIn, signOut } = useWallet();

  if (isLoading) {
    return (
      <Button variant="secondary" size="sm" disabled>
        <Wallet size={14} />
        Loading...
      </Button>
    );
  }

  if (isSignedIn && accountId) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-near-green font-medium px-2 py-1 bg-near-green-dim rounded-full border border-near-green-mid truncate max-w-[160px]">
          {accountId}
        </span>
        <button
          onClick={signOut}
          className="text-text-tertiary hover:text-danger transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <Button variant="primary" size="sm" onClick={signIn}>
      <Wallet size={14} />
      Connect Wallet
    </Button>
  );
}
