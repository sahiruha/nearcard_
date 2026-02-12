'use client';

import type { LinkItem } from '@/lib/types';
import { Globe, Twitter, Send, Github, Linkedin, Mail, Link as LinkIcon } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  website: Globe,
  twitter: Twitter,
  telegram: Send,
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  custom: LinkIcon,
};

export function LinkBlock({ link }: { link: LinkItem }) {
  const Icon = iconMap[link.type] || LinkIcon;
  const href = link.type === 'email' && !link.url.startsWith('mailto:')
    ? `mailto:${link.url}`
    : link.url;

  return (
    <a
      href={href}
      target={link.type === 'email' ? undefined : '_blank'}
      rel="noopener noreferrer"
      className="flex items-center gap-3 w-full px-4 py-3.5 bg-bg-card border border-border rounded-[var(--radius-lg)] transition-all duration-200 hover:bg-bg-card-hover hover:border-border-light hover:-translate-y-0.5 group"
    >
      <div className="w-9 h-9 rounded-[var(--radius-md)] bg-bg-elevated border border-border flex items-center justify-center text-text-secondary group-hover:text-near-green group-hover:border-near-green-mid transition-colors">
        <Icon size={16} />
      </div>
      <span className="text-sm font-medium text-text-primary flex-1">{link.label}</span>
      <svg className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}
