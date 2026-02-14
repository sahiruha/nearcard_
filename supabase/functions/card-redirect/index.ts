import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://nearcard.app';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // https://のみ許可
    if (parsed.protocol !== 'https:') return false;
    // 自身のEdge Functionへのリダイレクトループ防止
    if (parsed.hostname === new URL(SUPABASE_URL).hostname) return false;
    return true;
  } catch {
    return false;
  }
}

function redirect(url: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: url },
  });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // パスからcardIdを抽出: /card-redirect/{cardId} or /c/{cardId}
  // Edge Functionのパスは /card-redirect/xxx の形になる
  const cardId = pathParts[pathParts.length - 1];

  if (!cardId || cardId === 'card-redirect') {
    return new Response('Card ID is required', { status: 400 });
  }

  const { data: card, error } = await supabase
    .from('cards')
    .select('*')
    .eq('card_id', cardId)
    .single();

  // カード未登録 or 未紐付け → 登録ページへ
  if (error || !card || !card.account_id) {
    return redirect(`${FRONTEND_URL}/c/register/?cardId=${encodeURIComponent(cardId)}`);
  }

  // パーティーモードON + 有効なURL → ソーシャルURLへ直接リダイレクト
  if (card.is_party_mode && card.party_link_url && isValidRedirectUrl(card.party_link_url)) {
    return redirect(card.party_link_url);
  }

  // 通常モード → default_urlへリダイレクト
  if (card.default_url && isValidRedirectUrl(card.default_url)) {
    return redirect(card.default_url);
  }

  // default_urlが未設定の場合はフロントエンドのカードビューへ
  return redirect(`${FRONTEND_URL}/card/view/?id=${encodeURIComponent(card.account_id)}`);
});
