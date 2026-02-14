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

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={profile.name}
          className="w-20 h-20 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-near-green to-nc-blue flex items-center justify-center text-3xl font-bold text-black shrink-0">
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary">{profile.name}</h2>
        {profile.title && (
          <p className="text-sm text-text-secondary mt-0.5">{profile.title}</p>
        )}
        {profile.organization && (
          <p className="text-xs text-text-tertiary mt-0.5">{profile.organization}</p>
        )}
        {profile.nearAccount && (
          <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 text-[11px] font-semibold bg-near-green-dim text-near-green border border-near-green-mid rounded-full">
            {profile.nearAccount}
          </span>
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
