# NEAR Digital Card

NEAR Protocol上に構築されたブロックチェーンベースのデジタル名刺アプリです。名刺交換、リンク集約（Linktree的機能）、オンチェーン接続証明を組み合わせています。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 16 + React 19 + TypeScript |
| スタイリング | Tailwind CSS v4 + CSS Custom Properties（ダークテーマ） |
| ブロックチェーン | NEAR Protocol (testnet) |
| ウォレット接続 | @hot-labs/near-connect |
| コントラクト通信 | near-api-js |
| BaaS（NFCカード管理） | Supabase (PostgreSQL + Edge Functions) |
| ビルド形式 | 静的エクスポート (`output: "export"`) |

## ディレクトリ構成

```
nearcard/
├── frontend/                    # Next.jsフロントエンド
│   ├── src/
│   │   ├── app/                 # ページルーティング
│   │   │   ├── page.tsx         # ランディング（/cardにリダイレクト）
│   │   │   ├── card/
│   │   │   │   ├── page.tsx     # マイカード (B1) + パーティーモード
│   │   │   │   ├── create/      # プロフィール作成 (A3)
│   │   │   │   ├── edit/        # プロフィール編集 (D1) + NFC設定
│   │   │   │   └── view/        # 公開カードビュー (A1, Level 0)
│   │   │   ├── c/
│   │   │   │   └── register/    # NFCカード登録ページ
│   │   │   ├── share/           # QRコード共有 (C1) + NFCカードURL表示
│   │   │   └── exchange/
│   │   │       ├── confirm/     # 交換確認 (C2)
│   │   │       └── complete/    # 交換完了 (C3)
│   │   ├── components/
│   │   │   ├── card/
│   │   │   │   ├── CardPreview.tsx       # カード表示
│   │   │   │   ├── LinkList.tsx          # リンク一覧
│   │   │   │   ├── LinkBlock.tsx         # 個別リンク
│   │   │   │   ├── PartyModeToggle.tsx   # パーティーモードON/OFFトグル
│   │   │   │   ├── PartyModeSettings.tsx # パーティーモードリンク選択
│   │   │   │   └── NfcCardManager.tsx    # NFCカード管理パネル
│   │   │   ├── exchange/
│   │   │   ├── layout/
│   │   │   ├── wallet/
│   │   │   ├── ui/              # Button, Card, Input
│   │   │   └── providers/
│   │   │       └── WalletProvider.tsx
│   │   └── lib/
│   │       ├── types.ts         # 型定義
│   │       ├── near.ts          # NEARコントラクト通信
│   │       ├── profile.ts       # プロフィール管理（localStorage）
│   │       ├── supabase.ts      # Supabaseクライアント初期化
│   │       └── card-binding.ts  # NFCカード紐付けCRUD
│   ├── .env.local               # 環境変数
│   └── package.json
├── contract/                    # Rustスマートコントラクト (SBT)
├── supabase/
│   ├── migrations/
│   │   └── 001_create_cards.sql # DBテーブル定義
│   └── functions/
│       └── card-redirect/
│           └── index.ts         # NFCリダイレクトEdge Function
├── CLAUDE.md                    # プロジェクト仕様書
└── README.md                    # このファイル
```

## セットアップ手順

### 1. フロントエンド

```bash
cd frontend
npm install
```

### 2. 環境変数の設定

`frontend/.env.local` を編集:

```env
# NEAR
NEXT_PUBLIC_CONTRACT_ID=sbt.nearharu.testnet
NEXT_PUBLIC_NETWORK_ID=testnet

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabaseプロジェクトの作成

1. https://supabase.com にアクセスしてログイン
2. 「New Project」でプロジェクトを作成
3. ダッシュボードの **Settings > API** から以下を取得:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` に設定
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定

### 4. データベースのセットアップ

Supabase Dashboard の **SQL Editor** (`https://supabase.com/dashboard/project/<project-id>/sql/new`) を開き、`supabase/migrations/001_create_cards.sql` の内容を貼り付けて実行します。

これにより以下が作成されます:
- `cards` テーブル（NFCカード紐付け管理）
- `card_link_history` テーブル（監査ログ）
- `updated_at` 自動更新トリガー
- Row Level Security (RLS) ポリシー

### 5. Edge Functionのデプロイ

```bash
# Supabase CLIをインストール（未インストールの場合）
npm install -g supabase

# ログイン
supabase login

# プロジェクトにリンク
supabase link --project-ref <your-project-ref>

# Edge Functionの環境変数を設定
supabase secrets set FRONTEND_URL=https://nearcard.app

# Edge Functionをデプロイ
supabase functions deploy card-redirect
```

デプロイ後のEdge Function URL:
```
https://<your-project-ref>.supabase.co/functions/v1/card-redirect/{cardId}
```

### 6. 開発サーバーの起動

```bash
cd frontend
npm run dev
```

http://localhost:3000 でアクセスできます。

### 7. ビルド（静的エクスポート）

```bash
cd frontend
npm run build
```

`frontend/out/` に静的ファイルが生成されます。任意の静的ホスティング（Vercel, Cloudflare Pages, GitHub Pages等）にデプロイ可能です。

---

## 機能: NFCカード紐付け & パーティーモード

### 概要

物理的なNFCカード（タグ）とNEARアカウントを紐付け、タップするだけでプロフィール共有やソーシャルアカウントへのリダイレクトができる機能です。

### アーキテクチャ

```
[NFCタップ] → ブラウザが URL を開く
    ↓
[Supabase Edge Function] /functions/v1/card-redirect/{cardId}
    ├─ カード未登録 or 未紐付け → 302 → /c/register/?cardId={cardId}
    ├─ 紐付け済み + パーティーモードOFF → 302 → default_url（カードビュー）
    └─ 紐付け済み + パーティーモードON  → 302 → party_link_url（ソーシャルURL）
```

### NFCカード登録フロー

1. NFCタグに書き込むURL:
   ```
   https://<your-project-ref>.supabase.co/functions/v1/card-redirect/nc_abc123
   ```
2. ユーザーがNFCタグをスマホにタップ
3. ブラウザが上記URLを開く → Edge Functionが処理
4. 未紐付けのカード → `/c/register/?cardId=nc_abc123` にリダイレクト
5. ユーザーがウォレットを接続し、「Link This Card」ボタンを押す
6. 紐付け完了 → 以降のタップではプロフィールページが表示される

### パーティーモード

イベントやパーティーの場で、NFCタップで即座に特定のソーシャルアカウント（Twitter, Telegram等）に飛ばせる機能です。

**設定方法:**

1. `/card`（マイカードページ）でParty Modeトグルを ON
2. 「Change」をタップしてリダイレクト先のリンクを選択（プロフィールに登録済みのリンクから選ぶ）
3. 保存すると、NFCタップ時に選択したURLに直接リダイレクトされるようになる

**設定できる場所:**

| ページ | URL | 設定内容 |
|-------|-----|---------|
| マイカード | `/card` | パーティーモードの ON/OFF トグル、リンク選択 |
| プロフィール編集 | `/card/edit` | NFC Card Settings セクションからパーティーモードを設定 |
| シェア | `/share` | NFCカードのURLを確認・コピー |

### アクセスするサイト・URL一覧

| 用途 | URL | 説明 |
|-----|-----|------|
| **Supabase Dashboard** | https://supabase.com/dashboard | プロジェクト管理、DB操作、Edge Function管理 |
| **Supabase SQL Editor** | https://supabase.com/dashboard/project/`<ref>`/sql/new | マイグレーションSQL実行 |
| **Supabase Edge Functions** | https://supabase.com/dashboard/project/`<ref>`/functions | Edge Functionのログ確認・管理 |
| **Supabase Table Editor** | https://supabase.com/dashboard/project/`<ref>`/editor | cardsテーブルのデータ確認・編集 |
| **Supabase API Settings** | https://supabase.com/dashboard/project/`<ref>`/settings/api | URLとAPIキーの確認 |
| **開発サーバー** | http://localhost:3000 | ローカル開発 |
| **マイカード** | http://localhost:3000/card | パーティーモードトグル、NFCカード一覧 |
| **プロフィール編集** | http://localhost:3000/card/edit | NFC Card Settings |
| **シェア** | http://localhost:3000/share | QRコード + NFCカードURL |
| **カード登録** | http://localhost:3000/c/register/?cardId=xxx | NFCカード紐付け |
| **NFCリダイレクト** | https://`<ref>`.supabase.co/functions/v1/card-redirect/`<cardId>` | NFCタグに書き込むURL |

### データベーステーブル

#### `cards` テーブル

| カラム | 型 | 説明 |
|-------|-----|------|
| id | UUID | 主キー（自動生成） |
| card_id | TEXT | NFCタグの一意識別子 (例: `nc_a3f8b2e1`) |
| account_id | TEXT | NEARアカウントID (null=未紐付け) |
| display_name | TEXT | 表示名キャッシュ |
| default_url | TEXT | 通常時のリダイレクト先URL |
| is_party_mode | BOOLEAN | パーティーモード有効/無効 |
| party_link_url | TEXT | パーティーモード時のリダイレクト先 |
| party_link_label | TEXT | パーティーモードのリンクラベル |
| linked_at | TIMESTAMPTZ | 紐付け日時 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時（自動更新） |

#### `card_link_history` テーブル（監査ログ）

| カラム | 型 | 説明 |
|-------|-----|------|
| id | UUID | 主キー |
| card_id | TEXT | カードID |
| account_id | TEXT | アカウントID |
| action | TEXT | `link` or `unlink` |
| created_at | TIMESTAMPTZ | 実行日時 |

### セキュリティ

- **カード乗っ取り防止:** 紐付け（`linkCard`）は `account_id IS NULL` の場合のみ実行可能
- **所有者確認:** 全更新操作に `.eq('account_id', accountId)` 条件を付与
- **URLバリデーション:** リダイレクト先は `https://` のみ許可、Edge Functionへのリダイレクトループを防止
- **監査ログ:** `card_link_history` テーブルで全ての紐付け/解除を記録

### NFCタグへの書き込み

NFCタグ（NTAG215等）に以下のURLをNDEF URIレコードとして書き込みます:

```
https://<your-project-ref>.supabase.co/functions/v1/card-redirect/<card-id>
```

**書き込みツール:**
- iOS: [NFC Tools](https://apps.apple.com/app/nfc-tools/id1252962749)
- Android: [NFC Tools](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc)

**card-idの命名規則:**
- プレフィックス `nc_` + ランダム文字列を推奨（例: `nc_a3f8b2e1`）
- 十分にランダムにし推測不可にすること

---

## ページ構成

| ルート | 説明 | ウォレット必要 |
|-------|------|:-----------:|
| `/` | ランディング（`/card`にリダイレクト） | No |
| `/card` | マイカード + パーティーモード + NFC管理 | Yes |
| `/card/create` | プロフィール作成 | Yes |
| `/card/edit` | プロフィール編集 + NFC Card Settings | Yes |
| `/card/view` | 公開カードビュー (Level 0) | No |
| `/share` | QRコード + NFC URL共有 | Yes |
| `/exchange/confirm` | 名刺交換確認 | Yes |
| `/exchange/complete` | 交換完了 | Yes |
| `/c/register` | NFCカード登録 | Yes |

## Progressive Web3 設計

ウォレットやブロックチェーンの知識がなくても使えるよう、4段階のアクセスレベルを設けています:

| レベル | 要件 | できること |
|-------|------|----------|
| Level 0 | ブラウザのみ | カード閲覧、Link Hub閲覧、vCard保存 |
| Level 1 | メール認証（FastAuth） | カード作成、Link Hub編集 |
| Level 2 | ウォレット接続 | 名刺交換、SBT発行、0.01 NEAR受取 |
| Level 3 | Web3ネイティブ | NFT/SBT表示、NEAR送金、トークンゲーティング |

## ライセンス

MIT
