import { Hono } from 'hono';
import type { Env, CardRow } from '../types';

const app = new Hono<{ Bindings: Env }>();

function isValidRedirectUrl(url: string, frontendUrl: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    return true;
  } catch {
    return false;
  }
}

// GET /c/:cardId — NFCタップ時のリダイレクト
app.get('/c/:cardId', async (c) => {
  const cardId = c.req.param('cardId');
  if (!cardId) return c.text('Card ID is required', 400);

  const card = await c.env.DB.prepare(
    'SELECT * FROM cards WHERE card_id = ?'
  ).bind(cardId).first<CardRow>();

  const frontendUrl = c.env.FRONTEND_URL;

  // カード未登録 or 未紐付け → 登録ページへ
  if (!card || !card.account_id) {
    return c.redirect(
      `${frontendUrl}/c/register/?cardId=${encodeURIComponent(cardId)}`
    );
  }

  // パーティーモードON + 有効なURL → ソーシャルURLへ直接リダイレクト
  if (card.is_party_mode && card.party_link_url && isValidRedirectUrl(card.party_link_url, frontendUrl)) {
    return c.redirect(card.party_link_url);
  }

  // 通常モード → default_urlへリダイレクト
  if (card.default_url && isValidRedirectUrl(card.default_url, frontendUrl)) {
    return c.redirect(card.default_url);
  }

  // default_urlが未設定の場合はフロントエンドのカードビューへ
  return c.redirect(
    `${frontendUrl}/card/view/?id=${encodeURIComponent(card.account_id)}`
  );
});

export default app;
