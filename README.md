# NEAR Digital Card

> Blockchain-based digital business card on NEAR Protocol.
> Combines card exchange, link aggregation (like Linktree), and on-chain Connection Proof SBT.
>
> NEAR Protocol上に構築されたブロックチェーンベースのデジタル名刺アプリ。
> 名刺交換、リンク集約（Linktree的機能）、オンチェーン接続証明SBTを組み合わせています。

Every card exchange automatically: / 名刺交換ごとに自動で:
1. Issues a **Connection Proof SBT** to both parties / 双方にSBTを発行
2. Sends **0.01 NEAR** to the recipient / 0.01 NEARを受取者に送金
3. Records the exchange **permanently on-chain** / 交換をオンチェーンに永続記録

---

## Key Feature: Party Mode / 最大の特徴：パーティーモード

### The Problem / 課題

Existing digital business cards have a critical UX problem at events and parties:
既存のデジタル名刺は、イベントやパーティーの場で致命的なUX問題を抱えています：

> "Tap my card... now you see my profile... scroll down... see the links section? Click the third one, that's my X account..."
>
> 「カードをタップして...プロフィールが出るでしょ...下にスクロールして...リンクのところ見えます？上から3番目のがXのアカウントです...」

In a noisy, fast-paced party environment, explaining how to navigate through a profile page to find the right social link kills the momentum of the conversation. By the time the other person finds your X or Instagram, the moment has passed.

騒がしくてテンポの速いパーティー会場で、プロフィールページの操作を説明してSNSリンクを探させるのは、会話のテンポを台無しにします。相手がXやInstagramを見つけた頃には、話の流れは途切れています。

### The Solution: One-Tap Direct Link / 解決策：ワンタップで直接リンク

**Party Mode** eliminates this friction entirely. When enabled, tapping the NFC card **skips the profile page** and sends the recipient **directly to your chosen social account** — X, Instagram, Discord, Telegram, or any link you choose.

**パーティーモード**はこの摩擦を完全に排除します。ONにすると、NFCカードをタップした瞬間、プロフィールページをスキップして、あなたが選んだSNSアカウント（X、Instagram、Discord、Telegram等）に**直接飛びます**。

```
Normal Mode:  NFC Tap → Profile Page → Scroll → Find Link → Click → Social Account
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                              ↑ This is the problem / ここが問題

Party Mode:   NFC Tap → Social Account  ✅
                        Done! / 完了！
```

- **Before the party / パーティー前:** Select which link to share (X, Instagram, etc.) — パーティー前に共有するリンクを選択
- **During the party / パーティー中:** One tap, instant redirect. No explanation needed — ワンタップで即リダイレクト。説明不要
- **After the party / パーティー後:** Turn off Party Mode to restore full profile view — パーティー後にOFFにすれば通常のプロフィール表示に戻る

### NEAR Wallet Adoption / NEARウォレットの普及

To use NearCard, users connect a **NEAR Wallet**. This creates a natural onboarding funnel: every card exchange, every NFC tap, every profile share becomes an opportunity to bring new users into the NEAR ecosystem. As NearCard spreads at events and conferences, so does NEAR wallet adoption.

NearCardを使うには**NEARウォレット**の接続が必要です。これにより、名刺交換のたびに、NFCタップのたびに、プロフィール共有のたびに、新しいユーザーをNEARエコシステムに呼び込む機会が生まれます。イベントやカンファレンスでNearCardが広がるほど、NEARウォレットの普及も進みます。

---

## Tech Stack / 技術スタック

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + CSS Custom Properties (dark theme) |
| Blockchain | NEAR Protocol (testnet) |
| Wallet | @hot-labs/near-connect |
| Contract SDK | near-api-js |
| Backend API | Cloudflare Workers (Hono) |
| Database | Cloudflare D1 (SQLite) |
| File Storage | Cloudflare R2 (avatar images) |
| Frontend Hosting | Cloudflare Pages |
| Build | Static export (`output: "export"`) |
| i18n | Custom React Context (EN / JA / ZH / KO) |

## Deployed URLs / デプロイ済みURL

| Service | URL |
|---------|-----|
| **Frontend** | https://nearcard-app.pages.dev |
| **Worker API** | https://nearcard-worker.nc-d2ec48ed.workers.dev |
| **Health Check** | https://nearcard-worker.nc-d2ec48ed.workers.dev/health |
| **NFC Redirect** | https://nearcard-worker.nc-d2ec48ed.workers.dev/c/{cardId} |

---

## Directory Structure / ディレクトリ構成

```
nearcard/
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                 # Page routing
│   │   │   ├── page.tsx         # Landing (redirects to /card)
│   │   │   ├── card/
│   │   │   │   ├── page.tsx     # My Card (B1) + Party Mode
│   │   │   │   ├── create/      # Profile creation (A3) + avatar upload
│   │   │   │   ├── edit/        # Profile editing (D1) + NFC settings
│   │   │   │   └── view/        # Public card view (A1, Level 0)
│   │   │   ├── c/
│   │   │   │   └── register/    # NFC card registration
│   │   │   ├── share/           # QR code sharing (C1) + NFC URL
│   │   │   └── exchange/
│   │   │       ├── confirm/     # Exchange confirmation (C2)
│   │   │       └── complete/    # Exchange completion (C3)
│   │   ├── components/
│   │   │   ├── card/
│   │   │   │   ├── CardPreview.tsx       # Card display (avatar support)
│   │   │   │   ├── LinkList.tsx          # Link list
│   │   │   │   ├── LinkBlock.tsx         # Individual link with brand SVG icons
│   │   │   │   ├── PartyModeToggle.tsx   # Party Mode ON/OFF toggle
│   │   │   │   ├── PartyModeSettings.tsx # Party Mode link selection
│   │   │   │   └── NfcCardManager.tsx    # NFC card management panel
│   │   │   ├── exchange/
│   │   │   │   └── QRCodeDisplay.tsx     # QR code display + copy link
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx            # Header with LanguageSelector
│   │   │   │   ├── BottomNav.tsx         # Bottom navigation (i18n)
│   │   │   │   └── LanguageSelector.tsx  # Language switcher (EN/JA/ZH/KO)
│   │   │   ├── wallet/
│   │   │   │   └── ConnectButton.tsx     # Wallet connect/disconnect
│   │   │   ├── ui/              # Button, Card, Input
│   │   │   └── providers/
│   │   │       └── WalletProvider.tsx
│   │   └── lib/
│   │       ├── types.ts         # Type definitions
│   │       ├── near.ts          # NEAR contract communication
│   │       ├── profile.ts       # Profile management (localStorage + D1)
│   │       ├── api-client.ts    # Worker API fetch wrapper
│   │       ├── card-binding.ts  # NFC card binding CRUD
│   │       └── i18n.tsx         # i18n provider (4 languages)
│   ├── .env.local               # Environment variables
│   └── package.json
├── worker/                      # Cloudflare Worker (Hono)
│   ├── src/
│   │   ├── index.ts             # Entry point + CORS + routes
│   │   ├── types.ts             # D1/R2 binding types
│   │   └── routes/
│   │       ├── redirect.ts      # GET /c/:cardId - NFC redirect
│   │       ├── cards.ts         # Card CRUD API
│   │       ├── profiles.ts      # Profile CRUD API
│   │       └── upload.ts        # R2 avatar upload/serve
│   ├── schema.sql               # D1 migration
│   ├── wrangler.toml            # Cloudflare config (D1/R2 bindings)
│   └── package.json
├── contract/                    # Rust smart contract (SBT)
│   └── nearcard-sbt/
│       ├── Cargo.toml
│       └── src/lib.rs           # Connection Proof SBT contract
├── scripts/
│   ├── deploy.sh                # Contract build & deploy
│   └── setup-testnet.sh         # Testnet account setup
├── docs/
│   └── mainnet-deploy-guide.md  # Mainnet deployment guide
├── CLAUDE.md                    # Project specification (bilingual)
└── README.md                    # This file
```

---

## Setup / セットアップ

### 1. Frontend / フロントエンド

```bash
cd frontend
npm install
```

### 2. Worker (Backend API) / バックエンドAPI

```bash
cd worker
npm install
```

### 3. Environment Variables / 環境変数

Edit `frontend/.env.local`: / `frontend/.env.local` を編集:

```env
NEXT_PUBLIC_CONTRACT_ID=sbt.nearharu.testnet
NEXT_PUBLIC_NETWORK_ID=testnet
NEXT_PUBLIC_API_URL=https://nearcard-worker.nc-d2ec48ed.workers.dev
```

### 4. Cloudflare Resources (first time only) / Cloudflareリソース作成（初回のみ）

```bash
cd worker

# Create D1 database / D1データベース作成
wrangler d1 create nearcard-db

# Create R2 bucket / R2バケット作成
wrangler r2 bucket create nearcard-avatars
```

Update `database_id` in `wrangler.toml` with the ID shown at creation.
作成時に表示された `database_id` で `wrangler.toml` を更新してください。

### 5. Apply D1 Schema / D1スキーマ適用

```bash
cd worker

# Remote DB / リモートDB
wrangler d1 execute nearcard-db --remote --file=./schema.sql

# Local dev DB / ローカル開発用DB
wrangler d1 execute nearcard-db --local --file=./schema.sql
```

### 6. Deploy Worker / Workerデプロイ

```bash
cd worker
wrangler deploy
```

### 7. Local Development / ローカル開発

```bash
# Worker (Backend API)
cd worker
npm run dev
# -> http://localhost:8787

# Frontend (separate terminal / 別ターミナル)
cd frontend
npm run dev
# -> http://localhost:3000
```

### 8. Build (Static Export) / ビルド（静的エクスポート）

```bash
cd frontend
npm run build
```

Static files are generated in `frontend/out/`. Deployable to any static hosting.
`frontend/out/` に静的ファイルが生成されます。任意の静的ホスティングにデプロイ可能です。

---

## Architecture / アーキテクチャ

```
Frontend (Static HTML) -> fetch() -> Cloudflare Worker (Hono) -> D1 + R2
                                           |
NFC Tag Tap -> Worker GET /c/{cardId} -> D1 Lookup -> 302 Redirect
                                           |
Card Exchange -> NEAR Contract -> SBT Mint + 0.01 NEAR Transfer
```

## Worker API Endpoints / APIエンドポイント

| Method | Path | Description / 説明 |
|--------|------|-----------|
| GET | `/health` | Health check / ヘルスチェック |
| GET | `/c/:cardId` | NFC redirect / NFCリダイレクト |
| GET | `/api/cards?cardId=xxx` | Get card info / カード情報取得 |
| GET | `/api/cards/account/:accountId` | Get all cards for account / アカウントの全カード取得 |
| POST | `/api/cards/link` | Link card / カード紐付け |
| PUT | `/api/cards/unlink` | Unlink card / カード紐付け解除 |
| PUT | `/api/cards/party-mode` | Set party mode / パーティーモード設定 |
| PUT | `/api/cards/default-url` | Update default URL / デフォルトURL更新 |
| GET | `/api/profiles/:accountId` | Get profile / プロフィール取得 |
| PUT | `/api/profiles/:accountId` | Save profile (UPSERT) / プロフィール保存 |
| POST | `/api/upload/avatar` | Upload avatar image / アバター画像アップロード |
| GET | `/api/avatars/:key` | Serve avatar image / アバター画像配信 |

---

## Features / 機能

### i18n (Internationalization / 多言語対応)

Supports 4 languages with automatic browser detection and manual switching:
ブラウザ言語の自動検出と手動切替で4言語に対応:

| Language | Code |
|----------|------|
| English | `en` |
| Japanese / 日本語 | `ja` |
| Chinese (Simplified) / 中文 | `zh` |
| Korean / 한국어 | `ko` |

- Lightweight custom implementation (no external library) / 外部ライブラリ不使用の軽量実装
- `useI18n()` hook returns `{ t, locale, setLocale }` / hookで翻訳関数・言語切替を提供
- Selection persisted in localStorage / 選択言語はlocalStorageに永続化
- Language selector in the header / ヘッダーに言語切替ドロップダウン

### Supported Link Types / 対応リンクタイプ

Each link type has a dedicated brand-colored SVG icon:
各リンクタイプに専用のブランドカラーSVGアイコン:

| Type | Color | Description / 説明 |
|------|-------|-----------|
| Twitter / X | `#1DA1F2` | X (formerly Twitter) profile |
| Telegram | `#0088cc` | Telegram profile / channel |
| GitHub | `#aaaaaa` | GitHub profile / repo |
| LinkedIn | `#0A66C2` | LinkedIn profile |
| Discord | `#5865F2` | Discord server invite |
| Website | `#00EC97` | Personal website / blog |
| Email | `#FFB344` | Email address (mailto:) |
| Custom | `#9966FF` | Any custom URL |

### NFC Card Binding & Party Mode / NFCカード紐付け & パーティーモード

Physical NFC cards (tags) can be linked to a NEAR account. Tapping shares your profile or redirects to a social account.
物理NFCカードをNEARアカウントに紐付け。タップでプロフィール共有やソーシャルアカウントへリダイレクト。

**NFC Redirect Flow / NFCリダイレクトフロー:**

```
[NFC Tap] -> Browser opens URL
    |
[Cloudflare Worker] GET /c/{cardId}
    |-- Card not registered -> 302 -> /c/register/?cardId={cardId}
    |-- Linked + Party Mode OFF -> 302 -> default_url (card view)
    +-- Linked + Party Mode ON  -> 302 -> party_link_url (social URL)
```

**Party Mode:**
At events or parties, NFC tap instantly redirects to a selected social account (Twitter, Discord, etc.).
イベントやパーティーの場で、NFCタップで即座にソーシャルアカウントに飛ばせる機能。

### Profile Storage / プロフィール保存方式

Profiles are saved in 2 locations: / プロフィールは2箇所に保存:

1. **localStorage** - instant, same-device only / 即座に反映、同一デバイスのみ
2. **D1 Backend** - async fire-and-forget, cross-device / 非同期保存、クロスデバイス対応

Card view (`/card/view`) uses 3-level fallback: / カードビュー取得の3段階フォールバック:
1. URL-encoded data (QR/link sharing) / URLエンコードデータ
2. localStorage (same device) / localStorage（同一デバイス）
3. D1 backend API (cross-device) / D1バックエンドAPI

---

## Pages / ページ構成

| Page | URL | Description / 説明 | Wallet Required |
|------|-----|-----------|:-----------:|
| Top | `/` | Redirects to `/card` | No |
| My Card | `/card` | Party Mode + NFC management | Yes |
| Create Profile | `/card/create` | Avatar upload support | Yes |
| Edit Profile | `/card/edit` | NFC Card Settings + avatar | Yes |
| Public Card View | `/card/view` | Level 0, D1 fallback | No |
| Share | `/share` | QR code + NFC URL sharing | Yes |
| Exchange Confirm | `/exchange/confirm` | SBT mint + 0.01 NEAR transfer | Yes |
| Exchange Complete | `/exchange/complete` | Result + Explorer link | Yes |
| NFC Card Register | `/c/register` | Card linking | Yes |

## Progressive Web3 Design / プログレッシブWeb3設計

Never force Web3 on users. All features work across 4 levels:
ユーザーにWeb3を強制しない。4段階のアクセスレベル:

| Level | Requirements / 要件 | Capabilities / できること |
|-------|-----------|------------|
| Level 0 | Browser only / ブラウザのみ | View card + Link Hub, save vCard / カード閲覧、vCard保存 |
| Level 1 | Email auth (FastAuth) | Create card, edit Link Hub / カード作成、リンク編集 |
| Level 2 | Wallet connected | Exchange cards, SBT, receive 0.01 NEAR / 名刺交換、SBT、NEAR受取 |
| Level 3 | Web3 native | NFT/SBT display, NEAR tips, token gating |

---

## Smart Contract / スマートコントラクト

**Account:** `sbt.nearharu.testnet` (testnet)

### Methods / メソッド

| Type | Method | Description / 説明 |
|------|--------|-----------|
| init | `new(owner, transfer_amount)` | Initialize contract / 初期化 |
| change | `deposit()` | Deposit NEAR to funding pool / プールに入金 |
| change | `exchange_cards(party_b, event_name)` | Exchange cards, mint SBTs, transfer NEAR / 名刺交換 |
| change | `set_transfer_amount(amount)` | Update transfer amount (owner only) / 送金額変更 |
| view | `get_sbt(token_id)` | Get SBT by ID |
| view | `get_sbts_by_owner(account_id)` | Get all SBTs for account |
| view | `get_pool_balance()` | Get funding pool balance |
| view | `get_sbt_count()` | Get total SBT count |
| view | `get_transfer_amount()` | Get current transfer amount |
| view | `get_owner()` | Get contract owner |

---

## Database Tables / データベーステーブル

### `cards`

| Column | Type | Description / 説明 |
|--------|------|-----------|
| id | TEXT | Primary key (auto-generated) |
| card_id | TEXT | NFC tag unique ID (e.g. `nc_a3f8b2e1`) |
| account_id | TEXT | NEAR account ID (null = unlinked) |
| display_name | TEXT | Display name cache |
| default_url | TEXT | Normal redirect URL |
| is_party_mode | INTEGER | Party Mode enabled (0/1) |
| party_link_url | TEXT | Party Mode redirect URL |
| party_link_label | TEXT | Party Mode link label |
| linked_at | TEXT | Link timestamp |

### `profiles`

| Column | Type | Description / 説明 |
|--------|------|-----------|
| account_id | TEXT | NEAR account ID (UNIQUE) |
| name | TEXT | Name / 名前 |
| title | TEXT | Title / 肩書き |
| organization | TEXT | Organization / 組織 |
| avatar_url | TEXT | Avatar image URL (R2) |
| links | TEXT | Links JSON array |

---

## Security / セキュリティ

- **Card hijack prevention / カード乗っ取り防止:** `linkCard` only when `account_id IS NULL`
- **Owner verification / 所有者確認:** All updates require `account_id = ?` condition
- **URL validation / URLバリデーション:** Redirect targets must be `https://` only
- **Audit log / 監査ログ:** `card_link_history` table records all link/unlink actions
- **Avatar upload / アバターアップロード:** 2MB limit, JPEG/PNG/WebP/GIF only

## NFC Tag Writing / NFCタグ書き込み

Write the following URL as an NDEF URI record to an NFC tag (e.g. NTAG215):
NFCタグにNDEF URIレコードとして以下のURLを書き込み:

```
https://nearcard-worker.nc-d2ec48ed.workers.dev/c/<card-id>
```

**Writing tools / 書き込みツール:**
- iOS: [NFC Tools](https://apps.apple.com/app/nfc-tools/id1252962749)
- Android: [NFC Tools](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc)

**card-id naming:** Prefix `nc_` + random string (e.g. `nc_a3f8b2e1`). Must be sufficiently random.
**card-id命名規則:** `nc_` + ランダム文字列を推奨。推測不可にすること。

---

## Mainnet Deployment / メインネットデプロイ

See [docs/mainnet-deploy-guide.md](docs/mainnet-deploy-guide.md) for the full mainnet deployment guide.
メインネットデプロイの詳細手順は [docs/mainnet-deploy-guide.md](docs/mainnet-deploy-guide.md) を参照。

## License / ライセンス

MIT
