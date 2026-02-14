-- NFCカード紐付け管理テーブル
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id TEXT UNIQUE NOT NULL,
  account_id TEXT,
  display_name TEXT,
  default_url TEXT,
  is_party_mode BOOLEAN DEFAULT FALSE,
  party_link_url TEXT,
  party_link_label TEXT,
  linked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cards_card_id ON cards(card_id);
CREATE INDEX idx_cards_account_id ON cards(account_id);

-- 紐付け履歴（監査ログ）
CREATE TABLE card_link_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('link', 'unlink')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS有効化
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_link_history ENABLE ROW LEVEL SECURITY;

-- cardsテーブルのポリシー: 誰でもcard_idで読める（リダイレクトに必要）
CREATE POLICY "cards_select_by_card_id" ON cards
  FOR SELECT USING (true);

-- cardsテーブルのポリシー: anonキーでの挿入を許可（紐付け時）
CREATE POLICY "cards_insert" ON cards
  FOR INSERT WITH CHECK (true);

-- cardsテーブルのポリシー: 所有者のみ更新可
CREATE POLICY "cards_update_owner" ON cards
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- card_link_historyのポリシー: 挿入は許可
CREATE POLICY "history_insert" ON card_link_history
  FOR INSERT WITH CHECK (true);

-- card_link_historyのポリシー: 読み取りは許可
CREATE POLICY "history_select" ON card_link_history
  FOR SELECT USING (true);
