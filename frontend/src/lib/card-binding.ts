import { supabase } from './supabase';
import type { NfcCard } from './types';

// DB row → NfcCard マッピング
function toNfcCard(row: Record<string, unknown>): NfcCard {
  return {
    id: row.id as string,
    cardId: row.card_id as string,
    accountId: (row.account_id as string) || null,
    displayName: (row.display_name as string) || null,
    defaultUrl: (row.default_url as string) || null,
    isPartyMode: (row.is_party_mode as boolean) || false,
    partyLinkUrl: (row.party_link_url as string) || null,
    partyLinkLabel: (row.party_link_label as string) || null,
    linkedAt: (row.linked_at as string) || null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** NFCカードIDでカード情報を取得 */
export async function getCardByCardId(cardId: string): Promise<NfcCard | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('card_id', cardId)
    .single();

  if (error || !data) return null;
  return toNfcCard(data);
}

/** アカウントに紐付いた全カードを取得 */
export async function getCardsByAccount(accountId: string): Promise<NfcCard[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('account_id', accountId)
    .order('linked_at', { ascending: false });

  if (error || !data) return [];
  return data.map(toNfcCard);
}

/** カードをアカウントに紐付け（未紐付けの場合のみ） */
export async function linkCard(
  cardId: string,
  accountId: string,
  defaultUrl: string
): Promise<{ success: boolean; error?: string }> {
  // まず既存のカードを確認
  const existing = await getCardByCardId(cardId);

  if (existing && existing.accountId) {
    if (existing.accountId === accountId) {
      return { success: false, error: 'このカードは既にあなたのアカウントに紐付いています。' };
    }
    return { success: false, error: 'このカードは既に別のアカウントに紐付いています。' };
  }

  if (existing) {
    // 既存レコードを更新（未紐付けの場合のみ）
    const { error } = await supabase
      .from('cards')
      .update({
        account_id: accountId,
        default_url: defaultUrl,
        linked_at: new Date().toISOString(),
      })
      .eq('card_id', cardId)
      .is('account_id', null);

    if (error) return { success: false, error: error.message };
  } else {
    // 新規レコードを作成
    const { error } = await supabase
      .from('cards')
      .insert({
        card_id: cardId,
        account_id: accountId,
        default_url: defaultUrl,
        linked_at: new Date().toISOString(),
      });

    if (error) return { success: false, error: error.message };
  }

  // 監査ログに記録
  await supabase.from('card_link_history').insert({
    card_id: cardId,
    account_id: accountId,
    action: 'link',
  });

  return { success: true };
}

/** カード紐付けを解除（所有者のみ） */
export async function unlinkCard(
  cardId: string,
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('cards')
    .update({
      account_id: null,
      display_name: null,
      default_url: null,
      is_party_mode: false,
      party_link_url: null,
      party_link_label: null,
      linked_at: null,
    })
    .eq('card_id', cardId)
    .eq('account_id', accountId);

  if (error) return { success: false, error: error.message };

  // 監査ログに記録
  await supabase.from('card_link_history').insert({
    card_id: cardId,
    account_id: accountId,
    action: 'unlink',
  });

  return { success: true };
}

/** パーティーモード設定を更新 */
export async function updatePartyMode(
  cardId: string,
  accountId: string,
  isPartyMode: boolean,
  partyLinkUrl: string | null,
  partyLinkLabel: string | null
): Promise<{ success: boolean; error?: string }> {
  // URLバリデーション: https://のみ許可
  if (isPartyMode && partyLinkUrl && !partyLinkUrl.startsWith('https://')) {
    return { success: false, error: 'パーティーモードのリンクはhttps://で始まる必要があります。' };
  }

  const { error } = await supabase
    .from('cards')
    .update({
      is_party_mode: isPartyMode,
      party_link_url: partyLinkUrl,
      party_link_label: partyLinkLabel,
    })
    .eq('card_id', cardId)
    .eq('account_id', accountId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** デフォルトURLを更新 */
export async function updateDefaultUrl(
  cardId: string,
  accountId: string,
  defaultUrl: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('cards')
    .update({ default_url: defaultUrl })
    .eq('card_id', cardId)
    .eq('account_id', accountId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
