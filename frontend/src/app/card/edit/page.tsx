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
import { getApiBaseUrl } from '@/lib/api-client';
import type { LinkItem, LinkType, NfcCard } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { Plus, Trash2, ArrowLeft, CreditCard, Zap, Camera } from 'lucide-react';
import Link from 'next/link';

const linkTypeKeys: { value: LinkType; key: string }[] = [
  { value: 'twitter', key: 'linkType.twitter' },
  { value: 'telegram', key: 'linkType.telegram' },
  { value: 'github', key: 'linkType.github' },
  { value: 'linkedin', key: 'linkType.linkedin' },
  { value: 'discord', key: 'linkType.discord' },
  { value: 'website', key: 'linkType.website' },
  { value: 'email', key: 'linkType.email' },
  { value: 'custom', key: 'linkType.custom' },
];

export default function EditCardPage() {
  const { accountId, isSignedIn } = useWallet();
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
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
        setAvatar(profile.avatar);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accountId) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('accountId', accountId);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/upload/avatar`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.avatarUrl) setAvatar(data.avatarUrl);
    } catch { /* ignore */ }
  };

  const handleSave = async () => {
    if (!accountId || !name.trim()) return;

    const profile = {
      name: name.trim(),
      title: title.trim(),
      organization: organization.trim(),
      avatar,
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
        <p className="text-text-secondary">{t('create.walletRequired')}</p>
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
        <h1 className="text-lg font-bold">{t('edit.title')}</h1>
      </div>

      {/* Avatar Upload */}
      <div className="flex justify-center">
        <label className="relative cursor-pointer group">
          {avatar ? (
            <img
              src={avatar.startsWith('http') ? avatar : `${getApiBaseUrl()}${avatar}`}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-near-green to-nc-blue flex items-center justify-center text-3xl font-bold text-black">
              {name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={20} className="text-white" />
          </div>
          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
        </label>
      </div>

      <div className="flex flex-col gap-4">
        <Input label={t('create.nameLabel')} value={name} onChange={(e) => setName(e.target.value)} />
        <Input label={t('create.titleLabel')} value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label={t('create.orgLabel')} value={organization} onChange={(e) => setOrganization(e.target.value)} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">{t('create.links')}</h2>
          <button onClick={addLink} className="flex items-center gap-1 text-xs text-near-green hover:opacity-80 cursor-pointer">
            <Plus size={14} />
            {t('create.addLink')}
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
                {linkTypeKeys.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.key)}
                  </option>
                ))}
              </select>
              <button onClick={() => removeLink(i)} className="text-text-tertiary hover:text-danger cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>
            <Input placeholder={t('create.labelPlaceholder')} value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)} />
            <Input placeholder={t('create.urlPlaceholder')} value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} />
          </div>
        ))}
      </div>

      {/* NFC Card Settings */}
      {primaryCard && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <CreditCard size={14} />
            {t('edit.nfcSettings')}
          </h2>
          <Card className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={14} className={primaryCard.isPartyMode ? 'text-near-green' : 'text-text-tertiary'} />
                  <span className="text-sm text-text-primary">{t('edit.partyMode')}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  primaryCard.isPartyMode
                    ? 'bg-near-green-dim text-near-green'
                    : 'bg-bg-input text-text-tertiary'
                }`}>
                  {primaryCard.isPartyMode ? t('edit.on') : t('edit.off')}
                </span>
              </div>
              {primaryCard.isPartyMode && primaryCard.partyLinkLabel && (
                <p className="text-xs text-text-secondary">
                  {t('edit.redirect', { label: primaryCard.partyLinkLabel || '' })}
                </p>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowPartyConfig(true)}
                className="w-full"
              >
                <Zap size={12} />
                {t('edit.configureParty')}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Button onClick={handleSave} disabled={!name.trim()} className="w-full">
        {t('edit.saveChanges')}
      </Button>
    </div>
  );
}
