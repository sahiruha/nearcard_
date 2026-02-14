import { Hono } from 'hono';
import type { Env, CardRow } from '../types';

const app = new Hono<{ Bindings: Env }>();

// CardRow → JSON形式 (is_party_mode: number → boolean変換)
function formatCard(row: CardRow) {
  return {
    id: row.id,
    cardId: row.card_id,
    accountId: row.account_id,
    displayName: row.display_name,
    defaultUrl: row.default_url,
    isPartyMode: row.is_party_mode === 1,
    partyLinkUrl: row.party_link_url,
    partyLinkLabel: row.party_link_label,
    linkedAt: row.linked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/cards?cardId=xxx — NFCカードIDでカード情報を取得
app.get('/api/cards', async (c) => {
  const cardId = c.req.query('cardId');
  if (!cardId) return c.json({ error: 'cardId is required' }, 400);

  const card = await c.env.DB.prepare(
    'SELECT * FROM cards WHERE card_id = ?'
  ).bind(cardId).first<CardRow>();

  if (!card) return c.json(null);
  return c.json(formatCard(card));
});

// GET /api/cards/account/:accountId — アカウントの全カード取得
app.get('/api/cards/account/:accountId', async (c) => {
  const accountId = c.req.param('accountId');

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM cards WHERE account_id = ? ORDER BY linked_at DESC'
  ).bind(accountId).all<CardRow>();

  return c.json((results || []).map(formatCard));
});

// POST /api/cards/link — カードをアカウントに紐付け
app.post('/api/cards/link', async (c) => {
  const body = await c.req.json<{
    cardId: string;
    accountId: string;
    defaultUrl: string;
  }>();

  const { cardId, accountId, defaultUrl } = body;
  if (!cardId || !accountId || !defaultUrl) {
    return c.json({ success: false, error: 'Missing required fields' }, 400);
  }

  // 既存のカードを確認
  const existing = await c.env.DB.prepare(
    'SELECT * FROM cards WHERE card_id = ?'
  ).bind(cardId).first<CardRow>();

  if (existing && existing.account_id) {
    if (existing.account_id === accountId) {
      return c.json({ success: false, error: 'このカードは既にあなたのアカウントに紐付いています。' });
    }
    return c.json({ success: false, error: 'このカードは既に別のアカウントに紐付いています。' });
  }

  const now = new Date().toISOString();

  if (existing) {
    // 既存レコードを更新
    await c.env.DB.prepare(
      'UPDATE cards SET account_id = ?, default_url = ?, linked_at = ?, updated_at = ? WHERE card_id = ? AND account_id IS NULL'
    ).bind(accountId, defaultUrl, now, now, cardId).run();
  } else {
    // 新規レコードを作成
    await c.env.DB.prepare(
      'INSERT INTO cards (card_id, account_id, default_url, linked_at) VALUES (?, ?, ?, ?)'
    ).bind(cardId, accountId, defaultUrl, now).run();
  }

  // 監査ログに記録
  await c.env.DB.prepare(
    'INSERT INTO card_link_history (card_id, account_id, action) VALUES (?, ?, ?)'
  ).bind(cardId, accountId, 'link').run();

  return c.json({ success: true });
});

// PUT /api/cards/unlink — カード紐付けを解除
app.put('/api/cards/unlink', async (c) => {
  const body = await c.req.json<{ cardId: string; accountId: string }>();
  const { cardId, accountId } = body;

  await c.env.DB.prepare(
    `UPDATE cards SET account_id = NULL, display_name = NULL, default_url = NULL,
     is_party_mode = 0, party_link_url = NULL, party_link_label = NULL,
     linked_at = NULL, updated_at = datetime('now')
     WHERE card_id = ? AND account_id = ?`
  ).bind(cardId, accountId).run();

  // 監査ログに記録
  await c.env.DB.prepare(
    'INSERT INTO card_link_history (card_id, account_id, action) VALUES (?, ?, ?)'
  ).bind(cardId, accountId, 'unlink').run();

  return c.json({ success: true });
});

// PUT /api/cards/party-mode — パーティーモード設定更新
app.put('/api/cards/party-mode', async (c) => {
  const body = await c.req.json<{
    cardId: string;
    accountId: string;
    isPartyMode: boolean;
    partyLinkUrl: string | null;
    partyLinkLabel: string | null;
  }>();

  const { cardId, accountId, isPartyMode, partyLinkUrl, partyLinkLabel } = body;

  if (isPartyMode && partyLinkUrl && !partyLinkUrl.startsWith('https://')) {
    return c.json({ success: false, error: 'パーティーモードのリンクはhttps://で始まる必要があります。' });
  }

  await c.env.DB.prepare(
    `UPDATE cards SET is_party_mode = ?, party_link_url = ?, party_link_label = ?, updated_at = datetime('now')
     WHERE card_id = ? AND account_id = ?`
  ).bind(isPartyMode ? 1 : 0, partyLinkUrl, partyLinkLabel, cardId, accountId).run();

  return c.json({ success: true });
});

// PUT /api/cards/default-url — デフォルトURL更新
app.put('/api/cards/default-url', async (c) => {
  const body = await c.req.json<{
    cardId: string;
    accountId: string;
    defaultUrl: string;
  }>();

  const { cardId, accountId, defaultUrl } = body;

  await c.env.DB.prepare(
    `UPDATE cards SET default_url = ?, updated_at = datetime('now')
     WHERE card_id = ? AND account_id = ?`
  ).bind(defaultUrl, cardId, accountId).run();

  return c.json({ success: true });
});

export default app;
