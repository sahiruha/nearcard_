export interface Profile {
  name: string;
  title: string;
  organization: string;
  avatar?: string;
  nearAccount?: string;
  links: LinkItem[];
}

export interface LinkItem {
  type: LinkType;
  label: string;
  url: string;
}

export type LinkType =
  | 'website'
  | 'twitter'
  | 'telegram'
  | 'github'
  | 'linkedin'
  | 'email'
  | 'custom';

export interface ConnectionSBT {
  token_id: number;
  party_a: string;
  party_b: string;
  timestamp_ns: string;
  event_name: string;
}

export interface ExchangeResult {
  sbt_a_id: number;
  sbt_b_id: number;
  tx_hash: string;
  party_a: string;
  party_b: string;
  event_name: string;
  transfer_amount: string;
}
