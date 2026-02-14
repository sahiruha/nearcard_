import { apiFetch } from './api-client';
import type { NfcCard } from './types';

/** NFCカードIDでカード情報を取得 */
export async function getCardByCardId(cardId: string): Promise<NfcCard | null> {
  const card = await apiFetch<NfcCard | null>(`/api/cards?cardId=${encodeURIComponent(cardId)}`);
  return card;
}

/** アカウントに紐付いた全カードを取得 */
export async function getCardsByAccount(accountId: string): Promise<NfcCard[]> {
  const cards = await apiFetch<NfcCard[]>(`/api/cards/account/${encodeURIComponent(accountId)}`);
  return cards || [];
}

/** カードをアカウントに紐付け（未紐付けの場合のみ） */
export async function linkCard(
  cardId: string,
  accountId: string,
  defaultUrl: string
): Promise<{ success: boolean; error?: string }> {
  return apiFetch<{ success: boolean; error?: string }>('/api/cards/link', {
    method: 'POST',
    body: JSON.stringify({ cardId, accountId, defaultUrl }),
  });
}

/** カード紐付けを解除（所有者のみ） */
export async function unlinkCard(
  cardId: string,
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  return apiFetch<{ success: boolean; error?: string }>('/api/cards/unlink', {
    method: 'PUT',
    body: JSON.stringify({ cardId, accountId }),
  });
}

/** パーティーモード設定を更新 */
export async function updatePartyMode(
  cardId: string,
  accountId: string,
  isPartyMode: boolean,
  partyLinkUrl: string | null,
  partyLinkLabel: string | null
): Promise<{ success: boolean; error?: string }> {
  return apiFetch<{ success: boolean; error?: string }>('/api/cards/party-mode', {
    method: 'PUT',
    body: JSON.stringify({ cardId, accountId, isPartyMode, partyLinkUrl, partyLinkLabel }),
  });
}

/** デフォルトURLを更新 */
export async function updateDefaultUrl(
  cardId: string,
  accountId: string,
  defaultUrl: string
): Promise<{ success: boolean; error?: string }> {
  return apiFetch<{ success: boolean; error?: string }>('/api/cards/default-url', {
    method: 'PUT',
    body: JSON.stringify({ cardId, accountId, defaultUrl }),
  });
}
