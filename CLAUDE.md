# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NEAR Digital Card is a blockchain-based digital business card app built on NEAR Protocol. It combines business card exchange, link aggregation (like Linktree), and on-chain proof of connection.

Every card exchange automatically: (1) issues a Connection Proof SBT to both parties, (2) sends 0.01 NEAR to the recipient, (3) permanently records the exchange on-chain.

The specification document is `near-digital-card-proposal-v2-en-ja.md` (bilingual EN/JA).

## Core Design Principle: "Progressive Web3"

The key architectural constraint: **never force Web3 on users.** All features must work across 4 levels:

- **Level 0 (No wallet):** View cards + Link Hub, save vCard. Browser only, no app or account.
- **Level 1 (Account):** Email-based signup via FastAuth, auto .near account. Build own card + Link Hub.
- **Level 2 (On-chain):** SBT Connection Proof issued on exchange. 0.01 NEAR sent to recipient.
- **Level 3 (Web3-native):** NFT/SBT display, on-chain links, NEAR tips/payments, token gating.

Level 0 alone must be fully functional. Higher levels are opt-in.

## Technology Stack

- **Blockchain:** NEAR Protocol
- **Smart Contracts:** Rust + near-sdk-rs
- **SBT Standard:** NEP-393 (NEAR's Soulbound Token standard)
- **Authentication:** FastAuth (email-based, no seed phrase)
- **Identity Verification:** I-AM-HUMAN (face verification)
- **Frontend:** React + near-api-js
- **NFT Distribution:** ShardDog (wallet auto-creation via KeyPom)

## On-Chain vs Off-Chain Boundary

On-chain processing occurs in **only 3 places:**

| Trigger | On-chain Action | Cost |
|---------|----------------|------|
| Account creation | NEAR account generation | ~0.05 NEAR |
| Card exchange | SBT mint + 0.01 NEAR transfer | ~0.01 NEAR + gas |
| Event registration | Attendance proof SBT | ~0.01 NEAR |

**Everything else is off-chain:** profile viewing, Link Hub browsing, search, tagging, contact management, analytics. No blockchain wait times for these operations.

## Funding Model for 0.01 NEAR Transfers

Transfers are funded via a smart contract pool sourced from NEAR ecosystem grants and event sponsors. Per-event cost: ~5 NEAR (500 exchanges). Annual cost for 50 events: ~250 NEAR.

## Screen Architecture

```
[A] Onboarding: A1 Landing → A2 Account Creation → A3 Profile Setup
[B] Home: B1 My Card + Link Hub | B2 Contact List | B3 Event Feed | B4 Notifications
[C] Exchange: C1 Share (QR/NFC/link) → C2 Receive Confirm → C3 Complete (SBT + NEAR)
[D] Edit: D1 Basic Info | D2 Link Hub Editor | D3 Web3 Identity | D4 Design
[E] Contact: E1 Profile + Link Hub | E2 History & Notes | E3 Follow-up
[F] Event: F1 Registration | F2 Attendee List / AI Matching | F3 Dashboard
[G] Settings: G1 Wallet | G2 Privacy | G3 Account
```

## 作るもの（システムコンポーネント）

### 1. スマートコントラクト（Rust + near-sdk-rs）

#### Connection Proof SBT コントラクト
- NEP-393準拠のSoulbound Token
- 名刺交換時に双方へSBTをミント
- 交換日時・場所（イベント名）・双方のaccount_idを記録
- SBTは譲渡不可（Soulbound）
- ウォレットから保有SBT一覧を取得するviewメソッド

#### 送金プール コントラクト
- NEARエコシステムグラントやスポンサー企業からの入金を受け付け
- イベントごとの送金プール管理（例: 500交換 × 0.01 NEAR = 5 NEAR）
- 名刺交換完了時に0.01 NEARを受取者へ自動送金
- プール残高確認・上限管理

#### Event Attendance SBT コントラクト
- イベント参加登録時に参加証明SBTを発行
- イベント名・日時・場所を記録

### 2. バックエンドAPI

#### ユーザー・認証
- FastAuth連携（メール認証、シードフレーズ不要）
- Google認証
- 既存NEARウォレット接続
- .nearアカウント自動作成

#### プロフィール管理
- 名前・肩書き・組織・アバター画像のCRUD
- NEARアカウント紐付け
- プロフィール公開URL生成（SNS bioリンク用）

#### Link Hub
- リンクブロックのCRUD（追加・編集・削除）
- 対応リンクタイプ: URL、ファイル（PDF/画像/動画/音声）、オンチェーン（dApp/NFT/DAO）、予約（Calendly等）、決済（NEAR送金）、テキストブロック
- ドラッグ＆ドロップ並べ替え（順序の永続化）
- ファイルアップロード・ストレージ
- サムネイル表示設定
- クリック分析（どのリンクが、いつ、誰に（匿名化）クリックされたか）

#### コンタクト管理
- 交換した名刺の一覧取得
- 検索（名前・肩書き・タグ）
- イベント別フィルタ
- タグ付け・メモ追加
- 交換履歴（日時・場所・SBT ID・NEAR送金額）
- vCard生成・ダウンロード（アカウント不要で利用可能）

#### イベント管理
- イベント作成（名前・日時・場所・スポンサー）
- 参加登録
- 参加者リスト取得
- スポンサード送金プール管理
- イベントダッシュボード統計（交換数・参加者数・SBT発行数）
- ゲーミフィケーション（バッジ・クエスト進捗管理）

#### 通知
- 名刺受取通知
- 交換完了通知
- イベント関連通知

#### Web3データ取得
- ウォレットからSBT/NFT一覧取得
- I-AM-HUMAN認証状態確認
- オンチェーンTx数・DAO参加歴・レピュテーションスコア取得
- マルチチェーンウォレット情報表示（Phase 3）

### 3. フロントエンド（React + near-api-js）

#### [A] オンボーディング
- **A1 ランディング:** QR/NFCタップ後の初回画面。アカウント不要で相手の名刺＋Link Hub全体を閲覧可能。「連絡先を保存」「アカウント作成して交換」の2つの導線
- **A2 アカウント作成:** メール認証 / Google認証 / 既存NEARウォレット接続。.nearアカウント自動生成
- **A3 プロフィール初期設定:** 名前・肩書き・組織・アバター入力。初回リンク追加（Twitter/Telegram/GitHub/Website/カスタム/ファイル）

#### [B] ホーム
- **B1 マイカード＋Link Hub:** 自分の公開プロフィールプレビュー。オンチェーン実績（SBT/NFT）表示。Link Hub全リンク表示。「共有する」「編集する」ボタン。本日の交換数・受信NEAR表示
- **B2 コンタクトリスト:** 交換した人の一覧。全て/今日/イベント別/タグ別/SBTのみのフィルタ。検索機能。オンチェーン接続者数の表示
- **B3 イベントフィード:** 参加可能イベント一覧
- **B4 通知:** リアルタイム通知表示

#### [C] 名刺交換フロー
- **C1 共有画面:** QRコード動的生成・表示。NFC送信。リンクコピー。SNSシェア。共有情報の選択（名前/Link Hub/NEARアカウント/メール/電話）
- **C2 受取確認:** 送り手のプロフィール＋SBT/NFT実績表示。交換時の特典説明（0.01 NEAR受取、SBT発行）。「交換する」「連絡先だけ保存する」の選択
- **C3 交換完了:** SBT発行情報（SBT ID・発行日時・場所・Tx hash）。NEAR受取額・残高表示。フォローアップアクション（メッセージ/タグ追加/メモ追加）

#### [D] プロフィール＆Link Hub編集
- **D1 基本情報:** 名前・肩書き・組織・SNSリンクの編集
- **D2 Link Hubエディタ:** ドラッグ＆ドロップでリンク並べ替え。6種類のリンクタイプ追加（URL/ファイル/オンチェーン/予約/決済/テキスト）。各リンクの編集・非表示・削除。サムネイル表示/クリック数表示切替。プレビュー機能
- **D3 Web3アイデンティティ:** 保有SBT/NFTの表示・非表示切替。他チェーンウォレット追加（Ethereum/Solana）。オンチェーンTx数・DAO参加歴・レピュテーションスコアの表示切替
- **D4 デザインカスタマイズ:** カードデザインテンプレート選択（Phase 3）

#### [E] コンタクト詳細
- **E1 プロフィール閲覧:** 相手のプロフィール＋Link Hub＋オンチェーン実績表示
- **E2 交換履歴＆メモ:** 接続日時・場所・SBT ID・NEAR送金額。ユーザーメモの表示・編集
- **E3 フォローアップ:** メッセージ送信・タグ編集

#### [F] イベントモード
- **F1 イベント参加登録:** イベント情報表示（名前・日時・場所・参加者数・スポンサー）。参加特典説明（参加証明SBT/NEAR送金/バッジ）
- **F2 参加者リスト＆AIマッチング:** 参加者一覧。AIおすすめ（プロフィール＋オンチェーン活動ベース、共通点・共有SBT数表示）。名前/肩書き/タグで検索
- **F3 イベントダッシュボード:** 個人実績（交換数/NEAR送受信額/バッジ進捗）。イベント全体統計（総交換数/参加者数/SBT発行数）

#### [G] 設定＆ウォレット
- **G1 ウォレット:** NEAR残高・内訳表示（交換受取/クエスト報酬）。取引履歴一覧。保有SBT/NFT一覧。外部アプリへの誘導
- **G2 プライバシー設定:** 公開情報の制御
- **G3 アカウント管理:** アカウント情報の変更

#### 共通UI
- ボトムナビゲーション: Card / Contacts / Events / Settings
- メニュー（ハンバーガー）
- 通知バッジ

### 4. 外部サービス連携

| サービス | 用途 |
|---------|------|
| **FastAuth** | メール認証・.nearアカウント自動作成（シードフレーズ不要） |
| **ShardDog** | イベント参加証明NFT配布。KeyPom経由のウォレット自動作成。URL クリックでNFT受取 |
| **I-AM-HUMAN** | 顔認証ベースの人間証明SBT連携（Phase 3） |
| **near-api-js** | フロントエンドからNEARブロックチェーンへの接続・トランザクション送信 |
| **Calendly等** | 予約リンクの埋め込み（Phase 3） |

### 5. フェーズ別開発スコープ

#### Phase 1（MVP: 3ヶ月）— 最小限の名刺交換 + Link Hub
- QR/リンクによる名刺共有（C1画面）
- FastAuthによるアカウント作成（A2画面）
- 基本プロフィール作成・編集（A3, D1画面）
- Link Hub（URL・ファイルリンクの追加・並べ替え）（D2画面）
- Connection Proof SBTコントラクト開発・デプロイ
- 送金プールコントラクト開発・デプロイ
- 名刺交換フロー全体（C1→C2→C3画面）
- 0.01 NEAR自動送金
- ランディング画面（A1、アカウント不要で閲覧＋vCard保存）
- ホーム画面（B1）
- コンタクトリスト基本表示（B2）

#### Phase 2（+3ヶ月）— イベント機能 + 高度なLink Hub
- イベント参加登録・参加証明SBT（F1画面、Attendance SBTコントラクト）
- ShardDog連携（NFT配布・ウォレット自動作成）
- オンチェーンリンクブロック（dApp/NFT/DAOリンク）
- NEAR送金/チップボタン（Link Hub内）
- コンタクト管理強化（タグ・メモ・検索・イベント別フィルタ）（B2, E1-E3画面）
- クリック分析
- ゲーミフィケーション（バッジ・クエスト）（F3画面）
- スポンサード送金プール管理
- 通知機能（B4画面）

#### Phase 3（+6ヶ月）— AI・NFC・高度なWeb3機能
- AIマッチング推薦（F2画面）
- NFC物理カード対応（C1画面拡張）
- I-AM-HUMAN連携（D3画面）
- マルチチェーンウォレット表示（D3, G1画面）
- 予約リンク統合（Calendly等）
- デザインカスタマイズテンプレート（D4画面）
- イベント主催者向けダッシュボード

## Team Structure

- 企画
- デザイナ
- UXデザイナ
- UIデザイナ
- フロントエンドエンジニア
- バックエンドエンジニア
- セキュリティエンジニア
- QCエンジニア

**リリース前には必ずセキュリティエンジニアとQCエンジニアによるチェックを実施すること。**

## Development Roadmap

- **Phase 1 (MVP, 3 months):** QR/link sharing, FastAuth, basic profile + Link Hub, drag & drop ordering, SBT Connection Proof, 0.01 NEAR transfer
- **Phase 2 (+3 months):** Event mode, ShardDog integration, on-chain link blocks, NEAR tips, contact management, click analytics, gamification
- **Phase 3 (+6 months):** AI matching, NFC physical cards, I-AM-HUMAN, multi-chain wallet, booking integration, design customization, organizer dashboard
