# Mainnet Deployment Guide / メインネットデプロイ手順書

## Current Setup (testnet) / 現在の構成

| Component | Current | Location |
|-----------|---------|----------|
| Smart Contract | `sbt.nearharu.testnet` | NEAR testnet |
| Worker API | `nearcard-worker.nc-d2ec48ed.workers.dev` | Cloudflare Workers |
| Frontend | `nearcard-app.pages.dev` | Cloudflare Pages |
| DB | D1 `nearcard-db` | Cloudflare D1 |
| Storage | R2 `nearcard-avatars` | Cloudflare R2 |

---

## Phase 0: Pre-mainnet Preparation / メインネット前の事前準備

### 0-1. Security Audit / セキュリティ監査

Real NEAR is at stake on mainnet. Complete the following before launch:
メインネットでは実際のNEARが動くので、リリース前に必ず以下を実施する。

- [ ] **Smart Contract Audit / スマートコントラクト監査**
  - Review `exchange_cards` transfer logic (reentrancy, integer overflow) / 送金ロジックのレビュー
  - Verify `set_transfer_amount` access control (owner only) / アクセス制御確認
  - Verify `deposit` validation / バリデーション確認
  - Confirm `funding_pool_balance` underflow prevention / アンダーフロー防止確認
  - Comply with NEAR [Security Best Practices](https://docs.near.org/build/smart-contracts/security/)
- [ ] **Worker API Audit / Worker API 監査**
  - Restrict CORS (`origin: '*'` -> production domain only) / CORS設定の見直し
  - Input validation (sanitize cardId, accountId) / 入力バリデーション
  - Consider rate limiting / レート制限の追加検討
- [ ] **Frontend Audit / フロントエンド監査**
  - XSS prevention (escape user input) / XSS対策
  - Wallet connection flow security / ウォレット接続フローのセキュリティ確認

### 0-2. Testing / テスト

- [ ] Complete E2E testing on testnet / testnet上でE2Eテスト完了
  - Create account -> Create profile -> QR share -> Exchange cards -> SBT mint -> NEAR transfer
  - NFC card registration -> Party Mode -> Redirect
- [ ] All contract unit tests pass (`cargo test`) / コントラクトユニットテスト全パス
- [ ] Edge case testing / エッジケーステスト
  - Exchange attempt with insufficient pool balance / プール残高不足時の交換試行
  - Self-exchange prevention / 自分自身との交換防止
  - Gas consumption under high SBT volume / 大量SBT発行時のガス消費

---

## Phase 1: NEAR Account Setup / NEARアカウント準備

### 1-1. Create Mainnet Accounts / メインネットアカウント作成

```bash
# Parent account (create manually at https://wallet.near.org/)
# 親アカウント（手動で作成）
# e.g.: nearcard.near

# Sub-account for contract / コントラクト用サブアカウント
near account create-account fund-later use-auto-generation save-to-folder ~/.near-credentials/mainnet/sbt.nearcard.near
```

**Recommended account structure / 推奨アカウント構成:**

| Account | Purpose / 用途 | Funds Required / 必要資金 |
|---------|--------|----------|
| `nearcard.near` | Admin (owner) / 管理者 | 10+ NEAR |
| `sbt.nearcard.near` | Contract deployment / コントラクトデプロイ先 | 5 NEAR |

### 1-2. Fund Preparation / 資金準備

```
Contract deploy:         ~3 NEAR (WASM storage)
Contract init:           ~0.01 NEAR (gas)
Funding pool deposit:    5-50 NEAR (depends on event scale)
                         500 exchanges x 0.01 NEAR = 5 NEAR
Reserve:                 2 NEAR
────────────────────────
Total:                   ~10-55 NEAR
```

---

## Phase 2: Smart Contract Deployment / スマートコントラクトデプロイ

### 2-1. Build Contract / コントラクトのビルド

```bash
cd contract
cargo near build non-reproducible-wasm
```

### 2-2. Deploy to Mainnet / メインネットへデプロイ

```bash
CONTRACT_ACCOUNT="sbt.nearcard.near"
OWNER_ACCOUNT="nearcard.near"
TRANSFER_AMOUNT="10000000000000000000000"  # 0.01 NEAR

near contract deploy "$CONTRACT_ACCOUNT" \
  use-file target/near/nearcard_sbt.wasm \
  with-init-call new \
  json-args "{\"owner\":\"$OWNER_ACCOUNT\",\"transfer_amount\":\"$TRANSFER_AMOUNT\"}" \
  prepaid-gas '30 Tgas' attached-deposit '0 NEAR' \
  network-config mainnet sign-with-keychain send
```

### 2-3. Deposit to Funding Pool / 送金プールに入金

```bash
near contract call-function as-transaction \
  sbt.nearcard.near deposit \
  json-args '{}' \
  prepaid-gas '10 Tgas' attached-deposit '5 NEAR' \
  network-config mainnet sign-with-keychain send
```

### 2-4. Verify Deployment / デプロイ後の確認

```bash
near contract call-function as-read-only sbt.nearcard.near get_owner json-args '{}' network-config mainnet now
near contract call-function as-read-only sbt.nearcard.near get_pool_balance json-args '{}' network-config mainnet now
near contract call-function as-read-only sbt.nearcard.near get_transfer_amount json-args '{}' network-config mainnet now
near contract call-function as-read-only sbt.nearcard.near get_sbt_count json-args '{}' network-config mainnet now
```

---

## Phase 3: Worker API (Production Environment) / Worker API（本番環境）

### 3-1. Create Production D1 / R2 / 本番用リソース作成

```bash
wrangler d1 create nearcard-db-prod
wrangler r2 bucket create nearcard-avatars-prod
```

### 3-2. Production wrangler.toml / 本番用設定

Add production environment to `worker/wrangler.toml`:
`worker/wrangler.toml` に本番環境を追加:

```toml
# === Production / 本番環境 ===
[env.production]
name = "nearcard-worker-prod"

[env.production.vars]
FRONTEND_URL = "https://nearcard.your-domain.com"

[[env.production.d1_databases]]
binding = "DB"
database_name = "nearcard-db-prod"
database_id = "<ID from creation>"

[[env.production.r2_buckets]]
binding = "BUCKET"
bucket_name = "nearcard-avatars-prod"
```

### 3-3. Apply Schema / スキーマ適用

```bash
wrangler d1 execute nearcard-db-prod --remote --file=./schema.sql --env production
```

### 3-4. Restrict CORS / CORS制限

Update `worker/src/index.ts` to restrict origin to production domain:
`worker/src/index.ts` のCORSを本番ドメインに制限:

```typescript
app.use('/api/*', cors({
  origin: ['https://nearcard.your-domain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));
```

### 3-5. Deploy / デプロイ

```bash
cd worker
wrangler deploy --env production
```

---

## Phase 4: Frontend (Production Switch) / フロントエンド（本番切替）

### 4-1. Update Environment Variables / 環境変数の変更

`frontend/.env.local` (or `.env.production`):

```env
NEXT_PUBLIC_CONTRACT_ID=sbt.nearcard.near
NEXT_PUBLIC_NETWORK_ID=mainnet
NEXT_PUBLIC_API_URL=https://nearcard-worker-prod.<account>.workers.dev
```

### 4-2. What Changes Automatically / 自動で切り替わる項目

No code changes required. The following switch via environment variables:
環境変数の切替だけでOK。コード変更は不要:

| Item | testnet | mainnet |
|------|---------|---------|
| RPC | `rpc.testnet.near.org` | `rpc.mainnet.near.org` |
| Explorer | `testnet.nearblocks.io` | `nearblocks.io` |
| Contract | `sbt.nearharu.testnet` | `sbt.nearcard.near` |

(Mainnet branching already exists in `frontend/src/lib/near.ts`)

### 4-3. Build & Deploy / ビルド＆デプロイ

```bash
cd frontend
npm run build
wrangler pages deploy out --project-name nearcard-app
```

### 4-4. Custom Domain (optional) / カスタムドメイン（任意）

Add a custom domain in Cloudflare Pages settings:
- e.g. `nearcard.your-domain.com`
- DNS: CNAME -> `nearcard-app.pages.dev`

---

## Phase 5: Post-Deployment Checklist / デプロイ後チェックリスト

### Verification / 動作確認

- [ ] Frontend loads correctly / フロントエンドが表示される
- [ ] Wallet connection (mainnet) works / ウォレット接続（mainnet）ができる
- [ ] Profile create -> save -> display / プロフィール作成→保存→表示
- [ ] Avatar upload -> display / アバターアップロード→表示
- [ ] QR share -> open from another account / QRコード共有→別アカウントで開く
- [ ] Public card view (Level 0, no wallet) / 公開カード表示（Level 0）
- [ ] Card exchange -> SBT mint -> 0.01 NEAR transfer / 名刺交換→SBT発行→NEAR送金
- [ ] NFC card registration -> Party Mode toggle / NFCカード登録→パーティーモード切替
- [ ] Language switching (EN / JA / ZH / KO) / 言語切替
- [ ] Explorer links point to mainnet nearblocks.io / Explorerリンクがmainnetを指している

### Monitoring / 監視

- [ ] Regular pool balance checks (prevent depletion) / プール残高の定期確認
- [ ] Cloudflare Workers error log monitoring / エラーログ監視
- [ ] D1 database size monitoring / DBサイズ監視

---

## Cost Estimate / コスト見積もり

### NEAR Cost (Annual) / NEARコスト（年間）

| Item / 項目 | Unit Cost / 単価 | Volume / 数量 | Annual / 年間コスト |
|------|------|------|-----------|
| Contract deploy | ~3 NEAR | 1x | 3 NEAR |
| Exchange transfer / 名刺交換送金 | 0.01 NEAR | 2,500x | 25 NEAR |
| Gas fees / ガス代 | ~0.001 NEAR/exchange | 2,500x | ~2.5 NEAR |
| **Total / 合計** | | | **~30.5 NEAR** |

### Cloudflare Cost

| Service | Free Tier | Overage / 超過時 |
|---------|-----------|--------|
| Workers | 100K req/day | $0.30/1M req |
| Pages | Unlimited / 無制限 | Free |
| D1 | 5GB, 5M req/day | $0.75/1M req |
| R2 | 10GB, 10M req/month | $0.015/GB |

Free Tier is sufficient for the initial stage. / 初期段階ではFree Tierで十分。

---

## Troubleshooting / トラブルシューティング

### Redeploying the Contract / コントラクトの再デプロイ

To redeploy while preserving state, use `without-init-call`:
stateを維持したまま再デプロイする場合:

```bash
near contract deploy "$CONTRACT_ACCOUNT" \
  use-file target/near/nearcard_sbt.wasm \
  without-init-call \
  network-config mainnet sign-with-keychain send
```

**Note:** Migration is required if the state schema changes.
**注意:** stateのスキーマが変わった場合はマイグレーションが必要。

### Insufficient Pool Balance / プール残高不足

```bash
near contract call-function as-transaction \
  sbt.nearcard.near deposit \
  json-args '{}' \
  prepaid-gas '10 Tgas' attached-deposit '10 NEAR' \
  network-config mainnet sign-with-keychain send
```

### Changing Transfer Amount / 送金額の変更

```bash
# Run as owner account (e.g. change to 0.005 NEAR)
# ownerアカウントで実行（例: 0.005 NEARに変更）
near contract call-function as-transaction \
  sbt.nearcard.near set_transfer_amount \
  json-args '{"amount":"5000000000000000000000"}' \
  prepaid-gas '10 Tgas' attached-deposit '0 NEAR' \
  network-config mainnet sign-with-keychain send
```
