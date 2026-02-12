'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saveProfile } from '@/lib/profile';
import type { LinkItem, LinkType } from '@/lib/types';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
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

export default function CreateCardPage() {
  const { accountId, isSignedIn } = useWallet();
  const router = useRouter();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([
    { type: 'twitter', label: 'Twitter', url: '' },
  ]);

  const addLink = () => {
    setLinks([...links, { type: 'custom', label: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof LinkItem, value: string) => {
    const updated = [...links];
    if (field === 'type') {
      updated[index] = { ...updated[index], type: value as LinkType };
      if (!updated[index].label) {
        const opt = linkTypeOptions.find((o) => o.value === value);
        if (opt) updated[index].label = opt.label;
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setLinks(updated);
  };

  const handleSubmit = () => {
    if (!accountId || !name.trim()) return;

    const profile = {
      name: name.trim(),
      title: title.trim(),
      organization: organization.trim(),
      nearAccount: accountId,
      links: links.filter((l) => l.url.trim()),
    };

    saveProfile(accountId, profile);
    router.push('/card');
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-text-secondary">Please connect your wallet first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/card" className="text-text-tertiary hover:text-text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold">Create Your Card</h1>
      </div>

      <div className="flex flex-col gap-4">
        <Input label="Name *" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Title" placeholder="e.g. Blockchain Developer" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Organization" placeholder="e.g. NEAR Protocol" value={organization} onChange={(e) => setOrganization(e.target.value)} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Links</h2>
          <button onClick={addLink} className="flex items-center gap-1 text-xs text-near-green hover:opacity-80 transition-opacity cursor-pointer">
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
              <button onClick={() => removeLink(i)} className="text-text-tertiary hover:text-danger transition-colors cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>
            <Input placeholder="Label" value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)} />
            <Input placeholder="URL" value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} />
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={!name.trim()} className="w-full">
        Create Card
      </Button>
    </div>
  );
}
