import { apiFetch, getApiBaseUrl } from './api-client';
import type { Profile } from './types';

const PROFILE_KEY_PREFIX = 'nearcard_profile_';

export function saveProfile(accountId: string, profile: Profile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_KEY_PREFIX + accountId, JSON.stringify(profile));

  // fire-and-forget: D1にも保存
  saveProfileAsync(accountId, profile).catch(() => {});
}

export function getProfile(accountId: string): Profile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(PROFILE_KEY_PREFIX + accountId);
  if (!data) return null;
  try {
    return JSON.parse(data) as Profile;
  } catch {
    return null;
  }
}

/** D1バックエンドにプロフィールを保存 */
export async function saveProfileAsync(accountId: string, profile: Profile): Promise<void> {
  await apiFetch(`/api/profiles/${encodeURIComponent(accountId)}`, {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}

/** D1バックエンドからプロフィールを取得 */
export async function getProfileAsync(accountId: string): Promise<Profile | null> {
  const url = `${getApiBaseUrl()}/api/profiles/${encodeURIComponent(accountId)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data as Profile | null;
}

export function encodeProfileForUrl(profile: Profile): string {
  return btoa(
    encodeURIComponent(JSON.stringify(profile))
  );
}

export function decodeProfileFromUrl(encoded: string): Profile | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded))) as Profile;
  } catch {
    return null;
  }
}

export function generateVCard(profile: Profile): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name}`,
  ];

  if (profile.title) {
    lines.push(`TITLE:${profile.title}`);
  }
  if (profile.organization) {
    lines.push(`ORG:${profile.organization}`);
  }

  for (const link of profile.links) {
    if (link.type === 'email') {
      lines.push(`EMAIL:${link.url.replace('mailto:', '')}`);
    } else if (link.url) {
      lines.push(`URL;type=${link.type}:${link.url}`);
    }
  }

  if (profile.nearAccount) {
    lines.push(`NOTE:NEAR Account: ${profile.nearAccount}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(profile: Profile): void {
  const vcard = generateVCard(profile);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${profile.name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
