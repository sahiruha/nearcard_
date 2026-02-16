'use client';

import type { Profile } from '@/lib/types';
import { getApiBaseUrl } from '@/lib/api-client';
import { LinkList } from './LinkList';

interface CardPreviewProps {
  profile: Profile;
  showLinks?: boolean;
}

export function CardPreview({ profile, showLinks = true }: CardPreviewProps) {
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = profile.avatar
    ? (profile.avatar.startsWith('http') ? profile.avatar : `${getApiBaseUrl()}${profile.avatar}`)
    : null;

  const titleLine = [profile.title, profile.organization].filter(Boolean).join(' @ ');

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar with glow ring */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={profile.name}
          className="w-20 h-20 rounded-full object-cover shrink-0"
          style={{ boxShadow: '0 0 0 3px var(--near-green-dim), 0 0 20px var(--near-green-dim)' }}
        />
      ) : (
        <div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-near-green to-nc-blue flex items-center justify-center text-3xl font-bold text-black shrink-0"
          style={{ boxShadow: '0 0 0 3px var(--near-green-dim), 0 0 20px var(--near-green-dim)' }}
        >
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary">{profile.name}</h2>
        {titleLine && (
          <p className="text-[13px] text-text-secondary mt-1">{titleLine}</p>
        )}
        {profile.nearAccount && (
          <p className="text-xs text-near-green font-medium mt-1.5 font-mono">
            {profile.nearAccount}
          </p>
        )}
      </div>

      {/* Links */}
      {showLinks && profile.links.length > 0 && (
        <div className="w-full mt-2">
          <LinkList links={profile.links} />
        </div>
      )}
    </div>
  );
}
