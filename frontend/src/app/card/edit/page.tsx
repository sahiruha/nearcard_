'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';
import { PartyModeSettings } from '@/components/card/PartyModeSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { getProfile, saveProfile, encodeProfileForUrl } from '@/lib/profile';
import { getCardsByAccount, updatePartyMode, updateDefaultUrl } from '@/lib/card-binding';
import type { LinkItem, LinkType, NfcCard } from '@/lib/types';
import { Plus, Trash2, ArrowLeft, CreditCard, Zap } from 'lucide-react';
import Link from 'next/link';

const linkTypeOptions: { value: LinkType; label: string }[] = [
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
  { value: 'custom', label: 'Custom' },
];

export default function EditCardPage() {
  const { accountId, isSignedIn } = useWallet();
  const router = useRouter();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [nfcCards, setNfcCards] = useState<NfcCard[]>([]);
  const [showPartyConfig, setShowPartyConfig] = useState(false);

  const primaryCard = nfcCards[0] || null;

  const loadNfcCards = useCallback(async () => {
    if (!accountId) return;
    const cards = await getCardsByAccount(accountId);
    setNfcCards(cards);
  }, [accountId]);

  useEffect(() => {
    if (accountId) {
      const profile = getProfile(accountId);
      if (profile) {
        setName(profile.name);
        setTitle(profile.title);
        setOrganization(profile.organization);
        setLinks(profile.links);
      }
      setLoaded(true);
      loadNfcCards();
    }
  }, [accountId, loadNfcCards]);

  const addLink = () => {
    setLinks([...links, { type: 'custom', label: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof LinkItem, value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const handleSave = async () => {
    if (!accountId || !name.trim()) return;

    const profile = {
      name: name.trim(),
      title: title.trim(),
      organization: organization.trim(),
      nearAccount: accountId,
      links: links.filter((l) => l.url.trim()),
    };

    saveProfile(accountId, profile);

    // NFCカードが紐付いている場合、default_urlを更新
    if (primaryCard) {
      const encoded = encodeProfileForUrl(profile);
      const defaultUrl = `${window.location.origin}/card/view/?id=${accountId}&d=${encoded}`;
      await updateDefaultUrl(primaryCard.cardId, accountId, defaultUrl);
    }

    router.push('/card');
  };

  const handlePartyLinkSave = async (link: LinkItem) => {
    if (!primaryCard || !accountId) return;

    await updatePartyMode(
      primaryCard.cardId,
      accountId,
      true,
      link.url,
      link.label || link.type
    );
    setShowPartyConfig(false);
    await loadNfcCards();
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-text-secondary">Please connect your wallet first.</p>
      </div>
    );
  }

  if (!loaded) return null;

  // パーティーモード設定画面
  if (showPartyConfig) {
    return (
      <div className="flex flex-col gap-6">
        <PartyModeSettings
          links={links.filter((l) => l.url.trim())}
          currentUrl={primaryCard?.partyLinkUrl || null}
          onSave={handlePartyLinkSave}
          onBack={() => setShowPartyConfig(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/card" className="text-text-tertiary hover:text-text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold">Edit Profile</h1>
      </div>

      <div className="flex flex-col gap-4">
        <Input label="Name *" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Organization" value={organization} onChange={(e) => setOrganization(e.target.value)} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Links</h2>
          <button onClick={addLink} className="flex items-center gap-1 text-xs text-near-green hover:opacity-80 cursor-pointer">
            <Plus size={14} />
            Add Link
          </button>
        </div>

        {links.map((link, i) => (
          <div key={i} className="flex flex-col gap-2 p-3 bg-bg-card border border-border rounded-[var(--radius-lg)]">
            <div className="flex items-center gap-2">
              <select
                value={link.type}
                onChange={(e) => updateLink(i, 'type', e.target.value)}
                className="flex-1 px-3 py-2 bg-bg-input border border-border rounded-[var(--radius-md)] text-xs text-text-primary"
              >
                {linkTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button onClick={() => removeLink(i)} className="text-text-tertiary hover:text-danger cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>
            <Input placeholder="Label" value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)} />
            <Input placeholder="URL" value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} />
          </div>
        ))}
      </div>

      {/* NFC Card Settings */}
      {primaryCard && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <CreditCard size={14} />
            NFC Card Settings
          </h2>
          <Card className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={14} className={primaryCard.isPartyMode ? 'text-near-green' : 'text-text-tertiary'} />
                  <span className="text-sm text-text-primary">Party Mode</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  primaryCard.isPartyMode
                    ? 'bg-near-green-dim text-near-green'
                    : 'bg-bg-input text-text-tertiary'
                }`}>
                  {primaryCard.isPartyMode ? 'ON' : 'OFF'}
                </span>
              </div>
              {primaryCard.isPartyMode && primaryCard.partyLinkLabel && (
                <p className="text-xs text-text-secondary">
                  Redirect: {primaryCard.partyLinkLabel}
                </p>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowPartyConfig(true)}
                className="w-full"
              >
                <Zap size={12} />
                Configure Party Mode
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Button onClick={handleSave} disabled={!name.trim()} className="w-full">
        Save Changes
      </Button>
    </div>
  );
}
