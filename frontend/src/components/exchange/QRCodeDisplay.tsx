'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Copy, Check } from 'lucide-react';

interface QRCodeDisplayProps {
  url: string;
}

export function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white rounded-[var(--radius-xl)]">
        <QRCode value={url} size={220} level="M" />
      </div>
      <button
        onClick={copyUrl}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary bg-bg-card border border-border rounded-[var(--radius-lg)] hover:bg-bg-card-hover hover:border-border-light transition-all cursor-pointer"
      >
        {copied ? (
          <>
            <Check size={14} className="text-near-green" />
            <span className="text-near-green">Copied!</span>
          </>
        ) : (
          <>
            <Copy size={14} />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
