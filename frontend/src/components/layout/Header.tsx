'use client';

import Link from 'next/link';
import { ConnectButton } from '@/components/wallet/ConnectButton';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-bg-primary/85 backdrop-blur-xl border-b border-border">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/card" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-near-green flex items-center justify-center">
            <span className="text-black font-bold text-xs">NC</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            NEAR<span className="text-near-green">Card</span>
          </span>
        </Link>
        <ConnectButton />
      </div>
    </header>
  );
}
