-- NFCカード紐付け管理テーブル (PostgreSQL→SQLite変換)
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  card_id TEXT UNIQUE NOT NULL,
  account_id TEXT,
  display_name TEXT,
  default_url TEXT,
  is_party_mode INTEGER DEFAULT 0,
  party_link_url TEXT,
  party_link_label TEXT,
  linked_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cards_card_id ON cards(card_id);
CREATE INDEX IF NOT EXISTS idx_cards_account_id ON cards(account_id);

-- 紐付け履歴（監査ログ）
CREATE TABLE IF NOT EXISTS card_link_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  card_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('link', 'unlink')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- プロフィールテーブル（新規: D1バックエンド保存用）
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  account_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  organization TEXT DEFAULT '',
  avatar_url TEXT,
  near_account TEXT,
  links TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_account_id ON profiles(account_id);
