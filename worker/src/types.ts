export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  FRONTEND_URL: string;
}

export interface CardRow {
  id: string;
  card_id: string;
  account_id: string | null;
  display_name: string | null;
  default_url: string | null;
  is_party_mode: number; // SQLite: 0 or 1
  party_link_url: string | null;
  party_link_label: string | null;
  linked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CardLinkHistoryRow {
  id: string;
  card_id: string;
  account_id: string;
  action: 'link' | 'unlink';
  created_at: string;
}

export interface ProfileRow {
  id: string;
  account_id: string;
  name: string;
  title: string;
  organization: string;
  avatar_url: string | null;
  near_account: string | null;
  links: string; // JSON string
  created_at: string;
  updated_at: string;
}
