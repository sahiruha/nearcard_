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
| バックエンドAPI | Cloudflare Workers (Hono) |
| データベース | Cloudflare D1 (SQLite) |
| ファイルストレージ | Cloudflare R2（アバター画像） |
| フロントエンドホスティング | Cloudflare Pages |
| ビルド形式 | 静的エクスポート (`output: "export"`) |

## デプロイ済みURL

| サービス | URL |
|---------|-----|
| **フロントエンド** | https://nearcard-app.pages.dev |
| **Worker API** | https://nearcard-worker.nc-d2ec48ed.workers.dev |
| **ヘルスチェック** | https://nearcard-worker.nc-d2ec48ed.workers.dev/health |
| **NFCリダイレクト** | https://nearcard-worker.nc-d2ec48ed.workers.dev/c/{cardId} |

## ディレクトリ構成

```
nearcard/
├── frontend/                    # Next.jsフロントエンド
│   ├── src/
│   │   ├── app/                 # ページルーティング
│   │   │   ├── page.tsx         # ランディング（/cardにリダイレクト）
│   │   │   ├── card/
│   │   │   │   ├── page.tsx     # マイカード (B1) + パーティーモード
│   │   │   │   ├── create/      # プロフィール作成 (A3) + アバターアップロード
│   │   │   │   ├── edit/        # プロフィール編集 (D1) + NFC設定 + アバター
│   │   │   │   └── view/        # 公開カードビュー (A1, Level 0)
│   │   │   ├── c/
│   │   │   │   └── register/    # NFCカード登録ページ
│   │   │   ├── share/           # QRコード共有 (C1) + NFCカードURL表示
│   │   │   └── exchange/
│   │   │       ├── confirm/     # 交換確認 (C2)
│   │   │       └── complete/    # 交換完了 (C3)
│   │   ├── components/
│   │   │   ├── card/
│   │   │   │   ├── CardPreview.tsx       # カード表示（アバター画像対応）
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
│   │       ├── profile.ts       # プロフィール管理（localStorage + D1バックエンド）
│   │       ├── api-client.ts    # Worker API fetchラッパー
│   │       └── card-binding.ts  # NFCカード紐付けCRUD
│   ├── .env.local               # 環境変数
│   └── package.json
├── worker/                      # Cloudflare Worker (Hono)
│   ├── src/
│   │   ├── index.ts             # エントリーポイント + CORS + ルート登録
│   │   ├── types.ts             # D1/R2バインディング型定義
│   │   └── routes/
│   │       ├── redirect.ts      # GET /c/:cardId — NFCリダイレクト
│   │       ├── cards.ts         # カードCRUD API
│   │       ├── profiles.ts      # プロフィールCRUD API
│   │       └── upload.ts        # R2アバターアップロード・配信
│   ├── schema.sql               # D1マイグレーション
│   ├── wrangler.toml            # Cloudflare設定（D1/R2バインディング）
│   ├── tsconfig.json
│   └── package.json
├── contract/                    # Rustスマートコントラクト (SBT)
├── CLAUDE.md                    # プロジェクト仕様書
└── README.md                    # このファイル
```

## セットアップ手順

### 1. フロントエンド

```bash
cd frontend
npm install
```

### 2. Worker（バックエンドAPI）

```bash
cd worker
npm install
```

### 3. 環境変数の設定

`frontend/.env.local` を編集:

```env
# NEAR
NEXT_PUBLIC_CONTRACT_ID=sbt.nearharu.testnet
NEXT_PUBLIC_NETWORK_ID=testnet

# Cloudflare Worker API
NEXT_PUBLIC_API_URL=https://nearcard-worker.nc-d2ec48ed.workers.dev
```

### 4. Cloudflareリソースの作成（初回のみ）

```bash
cd worker

# D1データベース作成
wrangler d1 create nearcard-db

# R2バケット作成
wrangler r2 bucket create nearcard-avatars
```

`wrangler.toml` の `database_id` を作成時に表示されたIDに更新してください。

### 5. D1スキーマの適用

```bash
cd worker

# リモートDBに適用
wrangler d1 execute nearcard-db --remote --file=./schema.sql

# ローカル開発用DBに適用
wrangler d1 execute nearcard-db --local --file=./schema.sql
```

### 6. Workerのデプロイ

```bash
cd worker
wrangler deploy
```

### 7. ローカル開発

```bash
# Worker（バックエンドAPI）
cd worker
npm run dev
# → http://localhost:8787

# フロントエンド（別ターミナル）
cd frontend
npm run dev
# → http://localhost:3000
```

### 8. ビルド（静的エクスポート）

```bash
cd frontend
npm run build
```

`frontend/out/` に静的ファイルが生成されます。任意の静的ホスティング（Vercel, Cloudflare Pages, GitHub Pages等）にデプロイ可能です。

---

## アーキテクチャ

```
Frontend (静的HTML) → fetch() → Cloudflare Worker (Hono) → D1 + R2
                                      ↑
NFCタグタップ → Worker GET /c/{cardId} → D1検索 → 302リダイレクト
```

## Worker APIエンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/health` | ヘルスチェック |
| GET | `/c/:cardId` | NFCリダイレクト |
| GET | `/api/cards?cardId=xxx` | カード情報取得 |
| GET | `/api/cards/account/:accountId` | アカウントの全カード取得 |
| POST | `/api/cards/link` | カード紐付け |
| PUT | `/api/cards/unlink` | カード紐付け解除 |
| PUT | `/api/cards/party-mode` | パーティーモード設定 |
| PUT | `/api/cards/default-url` | デフォルトURL更新 |
| GET | `/api/profiles/:accountId` | プロフィール取得 |
| PUT | `/api/profiles/:accountId` | プロフィール保存 (UPSERT) |
| POST | `/api/upload/avatar` | アバター画像アップロード |
| GET | `/api/avatars/:key` | アバター画像配信 |

---

## 機能: NFCカード紐付け & パーティーモード

### 概要

物理的なNFCカード（タグ）とNEARアカウントを紐付け、タップするだけでプロフィール共有やソーシャルアカウントへのリダイレクトができる機能です。

### NFCリダイレクトフロー

```
[NFCタップ] → ブラウザが URL を開く
    ↓
[Cloudflare Worker] GET /c/{cardId}
    ├─ カード未登録 or 未紐付け → 302 → /c/register/?cardId={cardId}
    ├─ 紐付け済み + パーティーモードOFF → 302 → default_url（カードビュー）
    └─ 紐付け済み + パーティーモードON  → 302 → party_link_url（ソーシャルURL）
```

### NFCカード登録フロー

1. NFCタグに書き込むURL:
   ```
   https://nearcard-worker.nc-d2ec48ed.workers.dev/c/nc_abc123
   ```
2. ユーザーがNFCタグをスマホにタップ
3. ブラウザが上記URLを開く → Workerが処理
4. 未紐付けのカード → `/c/register/?cardId=nc_abc123` にリダイレクト
5. ユーザーがウォレットを接続し、「Link This Card」ボタンを押す
6. 紐付け完了 → 以降のタップではプロフィールページが表示される

### パーティーモード

イベントやパーティーの場で、NFCタップで即座に特定のソーシャルアカウント（Twitter, Telegram等）に飛ばせる機能です。

**設定方法:**

1. `/card`（マイカードページ）でParty Modeトグルを ON
2. 「Change」をタップしてリダイレクト先のリンクを選択（プロフィールに登録済みのリンクから選ぶ）
3. 保存すると、NFCタップ時に選択したURLに直接リダイレクトされるようになる

### プロフィールの保存方式

プロフィールは2箇所に保存されます:

1. **localStorage**（即座に反映、同一デバイスのみ）
2. **D1バックエンド**（fire-and-forget で非同期保存、クロスデバイス対応）

カードビュー（`/card/view`）では3段階のフォールバックで取得:
1. URLエンコードされたデータ（QR/リンク共有時）
2. localStorage（同一デバイス）
3. D1バックエンドAPI（クロスデバイス）

### アクセスするサイト・URL一覧

| 用途 | URL | 説明 |
|-----|-----|------|
| **Cloudflare Dashboard** | https://dash.cloudflare.com | Workers, D1, R2の管理 |
| **Worker API** | https://nearcard-worker.nc-d2ec48ed.workers.dev | バックエンドAPI |
| **ヘルスチェック** | https://nearcard-worker.nc-d2ec48ed.workers.dev/health | APIステータス確認 |
| **NFCリダイレクト** | https://nearcard-worker.nc-d2ec48ed.workers.dev/c/{cardId} | NFCタグに書き込むURL |
| **開発サーバー（Worker）** | http://localhost:8787 | ローカルWorker |
| **開発サーバー（Frontend）** | http://localhost:3000 | ローカルフロントエンド |

### データベーステーブル

#### `cards` テーブル

| カラム | 型 | 説明 |
|-------|-----|------|
| id | TEXT | 主キー（自動生成） |
| card_id | TEXT | NFCタグの一意識別子 (例: `nc_a3f8b2e1`) |
| account_id | TEXT | NEARアカウントID (null=未紐付け) |
| display_name | TEXT | 表示名キャッシュ |
| default_url | TEXT | 通常時のリダイレクト先URL |
| is_party_mode | INTEGER | パーティーモード有効/無効 (0/1) |
| party_link_url | TEXT | パーティーモード時のリダイレクト先 |
| party_link_label | TEXT | パーティーモードのリンクラベル |
| linked_at | TEXT | 紐付け日時 |
| created_at | TEXT | 作成日時 |
| updated_at | TEXT | 更新日時 |

#### `card_link_history` テーブル（監査ログ）

| カラム | 型 | 説明 |
|-------|-----|------|
| id | TEXT | 主キー |
| card_id | TEXT | カードID |
| account_id | TEXT | アカウントID |
| action | TEXT | `link` or `unlink` |
| created_at | TEXT | 実行日時 |

#### `profiles` テーブル（プロフィール）

| カラム | 型 | 説明 |
|-------|-----|------|
| id | TEXT | 主キー |
| account_id | TEXT | NEARアカウントID (UNIQUE) |
| name | TEXT | 名前 |
| title | TEXT | 肩書き |
| organization | TEXT | 組織 |
| avatar_url | TEXT | アバター画像URL (R2) |
| near_account | TEXT | NEARアカウント |
| links | TEXT | リンクJSON配列 |
| created_at | TEXT | 作成日時 |
| updated_at | TEXT | 更新日時 |

### セキュリティ

- **カード乗っ取り防止:** 紐付け（`linkCard`）は `account_id IS NULL` の場合のみ実行可能
- **所有者確認:** 全更新操作に `account_id = ?` 条件を付与
- **URLバリデーション:** リダイレクト先は `https://` のみ許可
- **監査ログ:** `card_link_history` テーブルで全ての紐付け/解除を記録
- **アバターアップロード:** 2MB制限、JPEG/PNG/WebP/GIFのみ許可

### NFCタグへの書き込み

NFCタグ（NTAG215等）に以下のURLをNDEF URIレコードとして書き込みます:

```
https://nearcard-worker.nc-d2ec48ed.workers.dev/c/<card-id>
```

**書き込みツール:**
- iOS: [NFC Tools](https://apps.apple.com/app/nfc-tools/id1252962749)
- Android: [NFC Tools](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc)

**card-idの命名規則:**
- プレフィックス `nc_` + ランダム文字列を推奨（例: `nc_a3f8b2e1`）
- 十分にランダムにし推測不可にすること

---

## ページ構成

| ページ | URL | 説明 | ウォレット必要 |
|-------|-----|------|:-----------:|
| トップ | https://nearcard-app.pages.dev/ | `/card`にリダイレクト | No |
| マイカード | https://nearcard-app.pages.dev/card | パーティーモード + NFC管理 | Yes |
| プロフィール作成 | https://nearcard-app.pages.dev/card/create | アバターアップロード対応 | Yes |
| プロフィール編集 | https://nearcard-app.pages.dev/card/edit | NFC Card Settings + アバター | Yes |
| 公開カードビュー | https://nearcard-app.pages.dev/card/view | Level 0、D1フォールバック付き | No |
| シェア | https://nearcard-app.pages.dev/share | QRコード + NFC URL共有 | Yes |
| 名刺交換確認 | https://nearcard-app.pages.dev/exchange/confirm | SBT発行 + 0.01 NEAR送金 | Yes |
| 交換完了 | https://nearcard-app.pages.dev/exchange/complete | 結果表示 + Explorer リンク | Yes |
| NFCカード登録 | https://nearcard-app.pages.dev/c/register | カード紐付け | Yes |
| NFCリダイレクト | https://nearcard-worker.nc-d2ec48ed.workers.dev/c/{cardId} | Worker経由302リダイレクト | — |
| ヘルスチェック | https://nearcard-worker.nc-d2ec48ed.workers.dev/health | APIステータス | — |

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
