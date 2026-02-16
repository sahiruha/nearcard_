'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Locale = 'en' | 'ja' | 'zh' | 'ko';

const STORAGE_KEY = 'nearcard-locale';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.back': 'Back',
    'common.connectWallet': 'Connect Wallet',
    'common.signOut': 'Sign out',
    'common.nearAccount': 'NEAR Account',

    // Header / Nav
    'nav.card': 'Card',
    'nav.share': 'Share',
    'nav.edit': 'Edit',

    // My Card page
    'card.title': 'NEAR Digital Card',
    'card.connectDescription': 'Connect your wallet to create and share your blockchain-powered digital business card.',
    'card.connectToStart': 'Connect Wallet to Start',
    'card.createTitle': 'Create Your Card',
    'card.createDescription': 'Set up your profile to start sharing your digital business card.',
    'card.createProfile': 'Create Profile',
    'card.linkHub': 'Link Hub',
    'card.share': 'Share',
    'card.edit': 'Edit',
    'card.connections': 'Connections',
    'card.nfcCards': 'NFC Cards',
    'card.near': 'NEAR',
    'card.nfcCardsCount': 'NFC Cards ({{count}})',

    // Card Create
    'create.title': 'Create Your Card',
    'create.nameLabel': 'Name *',
    'create.namePlaceholder': 'Your name',
    'create.titleLabel': 'Title',
    'create.titlePlaceholder': 'e.g. Blockchain Developer',
    'create.orgLabel': 'Organization',
    'create.orgPlaceholder': 'e.g. NEAR Protocol',
    'create.links': 'Links',
    'create.addLink': 'Add Link',
    'create.labelPlaceholder': 'Label',
    'create.urlPlaceholder': 'URL',
    'create.submit': 'Create Card',
    'create.walletRequired': 'Please connect your wallet first.',

    // Link types
    'linkType.twitter': 'Twitter / X',
    'linkType.telegram': 'Telegram',
    'linkType.github': 'GitHub',
    'linkType.linkedin': 'LinkedIn',
    'linkType.discord': 'Discord',
    'linkType.website': 'Website',
    'linkType.email': 'Email',
    'linkType.custom': 'Custom',

    // Card Edit
    'edit.title': 'Edit Profile',
    'edit.nfcSettings': 'NFC Card Settings',
    'edit.partyMode': 'Party Mode',
    'edit.on': 'ON',
    'edit.off': 'OFF',
    'edit.redirect': 'Redirect: {{label}}',
    'edit.configureParty': 'Configure Party Mode',
    'edit.saveChanges': 'Save Changes',

    // Card View (public)
    'view.cardNotFound': 'Card Not Found',
    'view.cardNotFoundDesc': 'This card may not exist or the link may be expired.',
    'view.receivedCard': 'You received a card from {{name}}',
    'view.links': "{{name}}'s Links",
    'view.saveContact': 'Save Contact',
    'view.exchangeCards': 'Create Account & Exchange Cards',
    'view.exchangeHint': 'No app needed \u00b7 Email only \u00b7 Get 0.01 NEAR',

    // Share
    'share.title': 'Share Your Card',
    'share.subtitle': 'Scan the QR code or share the link',
    'share.nfcCard': 'NFC Card',
    'share.partyMode': 'Party Mode - {{label}}',
    'share.normalMode': 'Normal Mode - Shows your card',
    'share.level0': 'Recipients can view your card without an account (Level 0).',
    'share.level0sbt': 'They can connect a wallet to exchange cards and receive SBT + 0.01 NEAR.',
    'share.connectFirst': 'Connect your wallet to share your card.',
    'share.createFirst': 'Create your profile first.',

    // Exchange Confirm
    'exchange.title': 'Exchange Cards',
    'exchange.subtitle': 'Connect on-chain with a Connection Proof SBT',
    'exchange.whatHappens': 'What happens',
    'exchange.sbtTitle': 'Connection Proof SBT',
    'exchange.sbtDesc': 'A Soulbound Token is minted for both of you as proof of connection.',
    'exchange.nearReceived': '{{amount}} NEAR Received',
    'exchange.nearReceivedDesc': '{{account}} receives {{amount}} NEAR from the community pool.',
    'exchange.selfError': 'You cannot exchange cards with yourself.',
    'exchange.connectToExchange': 'Connect Wallet to Exchange',
    'exchange.noTarget': 'No target account specified.',

    // Exchange Complete
    'complete.connected': 'Connected!',
    'complete.connectedSub': 'Connection complete',
    'complete.sbt': 'Connection SBT',
    'complete.location': 'Location',
    'complete.tx': 'Tx',
    'complete.received': 'Received',
    'complete.whatsNext': "What's Next",
    'complete.message': 'Message',
    'complete.tag': 'Tag',
    'complete.note': 'Note',
    'complete.backHome': 'Back to Home',

    // NFC Register
    'register.title': 'NFC Card Registration',
    'register.connectDesc': 'Connect your wallet to link this NFC card to your account.',
    'register.cardId': 'Card ID',
    'register.alreadyLinked': 'Already Linked',
    'register.alreadyLinkedDesc': 'This card is already linked to your account.',
    'register.alreadyLinkedOther': 'This card is already linked to another account.',
    'register.goToCard': 'Go to My Card',
    'register.cardLinked': 'Card Linked!',
    'register.cardLinkedDesc': 'Your NFC card has been linked. Tapping it will now show your profile.',
    'register.linkTitle': 'Link NFC Card',
    'register.linkDesc': 'Link this NFC card to your NEAR account. Share your profile with a tap.',
    'register.account': 'Account',
    'register.linkButton': 'Link This Card',
    'register.backToCard': 'Back to My Card',
    'register.noCardId': 'Card ID is not specified.',
    'register.linkFailed': 'Failed to link the card.',

    // Party Mode Toggle
    'party.title': 'Party Mode',
    'party.active': 'Active - {{label}}',
    'party.selectLink': 'Active - Select a link',
    'party.off': 'Off - Card view on tap',
    'party.change': 'Change',

    // Party Mode Settings
    'partySettings.title': 'Party Mode Link',
    'partySettings.subtitle': 'Select redirect destination for NFC tap',
    'partySettings.noLinks': 'Add links to your profile before configuring.',
    'partySettings.redirectTo': 'Redirect to: {{url}}',
    'partySettings.save': 'Save Party Mode Link',

    // NFC Card Manager
    'nfc.noCards': 'No NFC cards linked',
    'nfc.noCardsDesc': 'Tap an NFC card to start linking it to your account.',
    'nfc.party': 'Party',
    'nfc.linked': 'Linked {{date}}',
    'nfc.unlink': 'Unlink',

    // QR Code
    'qr.copyLink': 'Copy Link',
    'qr.copied': 'Copied!',
  },

  ja: {
    // Common
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.back': '戻る',
    'common.connectWallet': 'ウォレットを接続',
    'common.signOut': 'サインアウト',
    'common.nearAccount': 'NEARアカウント',

    // Header / Nav
    'nav.card': 'カード',
    'nav.share': '共有',
    'nav.edit': '編集',

    // My Card page
    'card.title': 'NEAR デジタル名刺',
    'card.connectDescription': 'ウォレットを接続して、ブロックチェーン対応のデジタル名刺を作成・共有しましょう。',
    'card.connectToStart': 'ウォレットを接続して始める',
    'card.createTitle': '名刺を作成',
    'card.createDescription': 'プロフィールを設定して、デジタル名刺の共有を始めましょう。',
    'card.createProfile': 'プロフィール作成',
    'card.linkHub': 'リンクハブ',
    'card.share': '共有',
    'card.edit': '編集',
    'card.connections': 'コネクション',
    'card.nfcCards': 'NFCカード',
    'card.near': 'NEAR',
    'card.nfcCardsCount': 'NFCカード ({{count}})',

    // Card Create
    'create.title': '名刺を作成',
    'create.nameLabel': '名前 *',
    'create.namePlaceholder': 'お名前',
    'create.titleLabel': '肩書き',
    'create.titlePlaceholder': '例: ブロックチェーン開発者',
    'create.orgLabel': '組織',
    'create.orgPlaceholder': '例: NEAR Protocol',
    'create.links': 'リンク',
    'create.addLink': 'リンクを追加',
    'create.labelPlaceholder': 'ラベル',
    'create.urlPlaceholder': 'URL',
    'create.submit': '名刺を作成',
    'create.walletRequired': 'まずウォレットを接続してください。',

    // Link types
    'linkType.twitter': 'Twitter / X',
    'linkType.telegram': 'Telegram',
    'linkType.github': 'GitHub',
    'linkType.linkedin': 'LinkedIn',
    'linkType.website': 'ウェブサイト',
    'linkType.email': 'メール',
    'linkType.custom': 'カスタム',

    // Card Edit
    'edit.title': 'プロフィール編集',
    'edit.nfcSettings': 'NFCカード設定',
    'edit.partyMode': 'パーティーモード',
    'edit.on': 'ON',
    'edit.off': 'OFF',
    'edit.redirect': 'リダイレクト: {{label}}',
    'edit.configureParty': 'パーティーモードを設定',
    'edit.saveChanges': '変更を保存',

    // Card View (public)
    'view.cardNotFound': '名刺が見つかりません',
    'view.cardNotFoundDesc': 'この名刺は存在しないか、リンクが期限切れの可能性があります。',
    'view.receivedCard': '{{name}}さんから名刺が届きました',
    'view.links': '{{name}}のリンク',
    'view.saveContact': '連絡先を保存する',
    'view.exchangeCards': 'アカウント作成して名刺を交換する',
    'view.exchangeHint': 'アプリ不要 \u00b7 メールだけでOK \u00b7 0.01 NEAR がもらえる',

    // Share
    'share.title': '名刺を共有',
    'share.subtitle': 'QRコードをスキャンするか、リンクを共有',
    'share.nfcCard': 'NFCカード',
    'share.partyMode': 'パーティーモード - {{label}}',
    'share.normalMode': '通常モード - カードを表示',
    'share.level0': '受信者はアカウント不要で名刺を閲覧できます（Level 0）。',
    'share.level0sbt': 'ウォレットを接続すると名刺交換＋SBT＋0.01 NEARが受け取れます。',
    'share.connectFirst': 'ウォレットを接続して名刺を共有しましょう。',
    'share.createFirst': 'まずプロフィールを作成してください。',

    // Exchange Confirm
    'exchange.title': '名刺を交換',
    'exchange.subtitle': 'Connection Proof SBTでオンチェーン接続',
    'exchange.whatHappens': '交換すると',
    'exchange.sbtTitle': 'Connection Proof SBT',
    'exchange.sbtDesc': '接続の証明として双方にSoulbound Tokenが発行されます。',
    'exchange.nearReceived': '{{amount}} NEAR 受取',
    'exchange.nearReceivedDesc': '{{account}}がコミュニティプールから{{amount}} NEARを受け取ります。',
    'exchange.selfError': '自分自身とは名刺交換できません。',
    'exchange.connectToExchange': 'ウォレットを接続して交換',
    'exchange.noTarget': '対象アカウントが指定されていません。',

    // Exchange Complete
    'complete.connected': '接続完了！',
    'complete.connectedSub': '名刺交換が完了しました',
    'complete.sbt': 'Connection SBT',
    'complete.location': '場所',
    'complete.tx': 'Tx',
    'complete.received': '受取済み',
    'complete.whatsNext': '次のアクション',
    'complete.message': 'メッセージ',
    'complete.tag': 'タグ',
    'complete.note': 'メモ',
    'complete.backHome': 'ホームに戻る',

    // NFC Register
    'register.title': 'NFCカード登録',
    'register.connectDesc': 'ウォレットを接続して、このNFCカードをアカウントに紐付けましょう。',
    'register.cardId': 'カードID',
    'register.alreadyLinked': '登録済み',
    'register.alreadyLinkedDesc': 'このカードは既にあなたのアカウントに紐付いています。',
    'register.alreadyLinkedOther': 'このカードは別のアカウントに紐付いています。',
    'register.goToCard': 'マイカードへ',
    'register.cardLinked': 'カードを紐付けました！',
    'register.cardLinkedDesc': 'NFCカードが紐付けされました。タップするとプロフィールが表示されます。',
    'register.linkTitle': 'NFCカードを紐付け',
    'register.linkDesc': 'このNFCカードをNEARアカウントに紐付けます。タップでプロフィールを共有。',
    'register.account': 'アカウント',
    'register.linkButton': 'このカードを紐付ける',
    'register.backToCard': 'マイカードに戻る',
    'register.noCardId': 'カードIDが指定されていません。',
    'register.linkFailed': 'カードの紐付けに失敗しました。',

    // Party Mode Toggle
    'party.title': 'パーティーモード',
    'party.active': 'アクティブ - {{label}}',
    'party.selectLink': 'アクティブ - リンクを選択',
    'party.off': 'オフ - タップでカード表示',
    'party.change': '変更',

    // Party Mode Settings
    'partySettings.title': 'パーティーモードリンク',
    'partySettings.subtitle': 'NFCタップ時のリダイレクト先を選択',
    'partySettings.noLinks': 'プロフィールにリンクを追加してから設定してください。',
    'partySettings.redirectTo': 'リダイレクト先: {{url}}',
    'partySettings.save': 'パーティーモードリンクを保存',

    // NFC Card Manager
    'nfc.noCards': 'NFCカード未登録',
    'nfc.noCardsDesc': 'NFCカードをタップして紐付けを開始してください。',
    'nfc.party': 'パーティー',
    'nfc.linked': '{{date}}に紐付け',
    'nfc.unlink': '解除',

    // QR Code
    'qr.copyLink': 'リンクをコピー',
    'qr.copied': 'コピーしました！',
  },

  zh: {
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.back': '返回',
    'common.connectWallet': '连接钱包',
    'common.signOut': '退出',
    'common.nearAccount': 'NEAR 账户',

    // Header / Nav
    'nav.card': '名片',
    'nav.share': '分享',
    'nav.edit': '编辑',

    // My Card page
    'card.title': 'NEAR 数字名片',
    'card.connectDescription': '连接钱包，创建并分享您的区块链数字名片。',
    'card.connectToStart': '连接钱包开始',
    'card.createTitle': '创建名片',
    'card.createDescription': '设置您的个人资料，开始分享数字名片。',
    'card.createProfile': '创建个人资料',
    'card.linkHub': '链接中心',
    'card.share': '分享',
    'card.edit': '编辑',
    'card.connections': '连接',
    'card.nfcCards': 'NFC 卡',
    'card.near': 'NEAR',
    'card.nfcCardsCount': 'NFC 卡 ({{count}})',

    // Card Create
    'create.title': '创建名片',
    'create.nameLabel': '姓名 *',
    'create.namePlaceholder': '您的姓名',
    'create.titleLabel': '职位',
    'create.titlePlaceholder': '例如：区块链开发者',
    'create.orgLabel': '组织',
    'create.orgPlaceholder': '例如：NEAR Protocol',
    'create.links': '链接',
    'create.addLink': '添加链接',
    'create.labelPlaceholder': '标签',
    'create.urlPlaceholder': 'URL',
    'create.submit': '创建名片',
    'create.walletRequired': '请先连接您的钱包。',

    // Link types
    'linkType.twitter': 'Twitter / X',
    'linkType.telegram': 'Telegram',
    'linkType.github': 'GitHub',
    'linkType.linkedin': 'LinkedIn',
    'linkType.website': '网站',
    'linkType.email': '邮箱',
    'linkType.custom': '自定义',

    // Card Edit
    'edit.title': '编辑个人资料',
    'edit.nfcSettings': 'NFC 卡设置',
    'edit.partyMode': '派对模式',
    'edit.on': '开',
    'edit.off': '关',
    'edit.redirect': '跳转: {{label}}',
    'edit.configureParty': '配置派对模式',
    'edit.saveChanges': '保存更改',

    // Card View (public)
    'view.cardNotFound': '名片未找到',
    'view.cardNotFoundDesc': '此名片可能不存在或链接已过期。',
    'view.receivedCard': '收到来自 {{name}} 的名片',
    'view.links': '{{name}} 的链接',
    'view.saveContact': '保存联系人',
    'view.exchangeCards': '创建账户并交换名片',
    'view.exchangeHint': '无需应用 \u00b7 仅需邮箱 \u00b7 获得 0.01 NEAR',

    // Share
    'share.title': '分享名片',
    'share.subtitle': '扫描二维码或分享链接',
    'share.nfcCard': 'NFC 卡',
    'share.partyMode': '派对模式 - {{label}}',
    'share.normalMode': '普通模式 - 显示名片',
    'share.level0': '接收者无需账户即可查看您的名片（Level 0）。',
    'share.level0sbt': '连接钱包后可交换名片并获得 SBT + 0.01 NEAR。',
    'share.connectFirst': '连接钱包以分享名片。',
    'share.createFirst': '请先创建个人资料。',

    // Exchange Confirm
    'exchange.title': '交换名片',
    'exchange.subtitle': '通过 Connection Proof SBT 进行链上连接',
    'exchange.whatHappens': '交换后会发生什么',
    'exchange.sbtTitle': 'Connection Proof SBT',
    'exchange.sbtDesc': '双方都将获得一个灵魂绑定代币作为连接证明。',
    'exchange.nearReceived': '{{amount}} NEAR 已收到',
    'exchange.nearReceivedDesc': '{{account}} 从社区池获得 {{amount}} NEAR。',
    'exchange.selfError': '不能与自己交换名片。',
    'exchange.connectToExchange': '连接钱包进行交换',
    'exchange.noTarget': '未指定目标账户。',

    // Exchange Complete
    'complete.connected': '已连接！',
    'complete.connectedSub': '名片交换完成',
    'complete.sbt': 'Connection SBT',
    'complete.location': '地点',
    'complete.tx': 'Tx',
    'complete.received': '已收到',
    'complete.whatsNext': '下一步',
    'complete.message': '消息',
    'complete.tag': '标签',
    'complete.note': '备注',
    'complete.backHome': '返回首页',

    // NFC Register
    'register.title': 'NFC 卡注册',
    'register.connectDesc': '连接钱包将此 NFC 卡绑定到您的账户。',
    'register.cardId': '卡 ID',
    'register.alreadyLinked': '已绑定',
    'register.alreadyLinkedDesc': '此卡已绑定到您的账户。',
    'register.alreadyLinkedOther': '此卡已绑定到其他账户。',
    'register.goToCard': '前往我的名片',
    'register.cardLinked': '卡已绑定！',
    'register.cardLinkedDesc': '您的 NFC 卡已绑定成功。轻触即可展示个人资料。',
    'register.linkTitle': '绑定 NFC 卡',
    'register.linkDesc': '将此 NFC 卡绑定到您的 NEAR 账户。轻触分享个人资料。',
    'register.account': '账户',
    'register.linkButton': '绑定此卡',
    'register.backToCard': '返回我的名片',
    'register.noCardId': '未指定卡 ID。',
    'register.linkFailed': '卡绑定失败。',

    // Party Mode Toggle
    'party.title': '派对模式',
    'party.active': '活跃 - {{label}}',
    'party.selectLink': '活跃 - 选择链接',
    'party.off': '关闭 - 轻触显示名片',
    'party.change': '更改',

    // Party Mode Settings
    'partySettings.title': '派对模式链接',
    'partySettings.subtitle': '选择 NFC 轻触时的跳转目标',
    'partySettings.noLinks': '请先在个人资料中添加链接。',
    'partySettings.redirectTo': '跳转至: {{url}}',
    'partySettings.save': '保存派对模式链接',

    // NFC Card Manager
    'nfc.noCards': '无已绑定的 NFC 卡',
    'nfc.noCardsDesc': '轻触 NFC 卡开始绑定。',
    'nfc.party': '派对',
    'nfc.linked': '{{date}} 绑定',
    'nfc.unlink': '解绑',

    // QR Code
    'qr.copyLink': '复制链接',
    'qr.copied': '已复制！',
  },

  ko: {
    // Common
    'common.loading': '로딩 중...',
    'common.error': '오류',
    'common.cancel': '취소',
    'common.save': '저장',
    'common.back': '뒤로',
    'common.connectWallet': '지갑 연결',
    'common.signOut': '로그아웃',
    'common.nearAccount': 'NEAR 계정',

    // Header / Nav
    'nav.card': '카드',
    'nav.share': '공유',
    'nav.edit': '편집',

    // My Card page
    'card.title': 'NEAR 디지털 명함',
    'card.connectDescription': '지갑을 연결하여 블록체인 기반 디지털 명함을 만들고 공유하세요.',
    'card.connectToStart': '지갑 연결하여 시작',
    'card.createTitle': '명함 만들기',
    'card.createDescription': '프로필을 설정하여 디지털 명함 공유를 시작하세요.',
    'card.createProfile': '프로필 만들기',
    'card.linkHub': '링크 허브',
    'card.share': '공유',
    'card.edit': '편집',
    'card.connections': '연결',
    'card.nfcCards': 'NFC 카드',
    'card.near': 'NEAR',
    'card.nfcCardsCount': 'NFC 카드 ({{count}})',

    // Card Create
    'create.title': '명함 만들기',
    'create.nameLabel': '이름 *',
    'create.namePlaceholder': '이름을 입력하세요',
    'create.titleLabel': '직함',
    'create.titlePlaceholder': '예: 블록체인 개발자',
    'create.orgLabel': '소속',
    'create.orgPlaceholder': '예: NEAR Protocol',
    'create.links': '링크',
    'create.addLink': '링크 추가',
    'create.labelPlaceholder': '라벨',
    'create.urlPlaceholder': 'URL',
    'create.submit': '명함 만들기',
    'create.walletRequired': '먼저 지갑을 연결해 주세요.',

    // Link types
    'linkType.twitter': 'Twitter / X',
    'linkType.telegram': 'Telegram',
    'linkType.github': 'GitHub',
    'linkType.linkedin': 'LinkedIn',
    'linkType.website': '웹사이트',
    'linkType.email': '이메일',
    'linkType.custom': '사용자 정의',

    // Card Edit
    'edit.title': '프로필 편집',
    'edit.nfcSettings': 'NFC 카드 설정',
    'edit.partyMode': '파티 모드',
    'edit.on': 'ON',
    'edit.off': 'OFF',
    'edit.redirect': '리다이렉트: {{label}}',
    'edit.configureParty': '파티 모드 설정',
    'edit.saveChanges': '변경사항 저장',

    // Card View (public)
    'view.cardNotFound': '명함을 찾을 수 없습니다',
    'view.cardNotFoundDesc': '이 명함은 존재하지 않거나 링크가 만료되었을 수 있습니다.',
    'view.receivedCard': '{{name}}님에게서 명함이 도착했습니다',
    'view.links': '{{name}}의 링크',
    'view.saveContact': '연락처 저장',
    'view.exchangeCards': '계정 만들고 명함 교환',
    'view.exchangeHint': '앱 불필요 \u00b7 이메일만 있으면 OK \u00b7 0.01 NEAR 받기',

    // Share
    'share.title': '명함 공유',
    'share.subtitle': 'QR 코드를 스캔하거나 링크를 공유하세요',
    'share.nfcCard': 'NFC 카드',
    'share.partyMode': '파티 모드 - {{label}}',
    'share.normalMode': '일반 모드 - 명함 표시',
    'share.level0': '수신자는 계정 없이 명함을 볼 수 있습니다 (Level 0).',
    'share.level0sbt': '지갑을 연결하면 명함 교환 + SBT + 0.01 NEAR을 받을 수 있습니다.',
    'share.connectFirst': '지갑을 연결하여 명함을 공유하세요.',
    'share.createFirst': '먼저 프로필을 만들어 주세요.',

    // Exchange Confirm
    'exchange.title': '명함 교환',
    'exchange.subtitle': 'Connection Proof SBT로 온체인 연결',
    'exchange.whatHappens': '교환 시 일어나는 일',
    'exchange.sbtTitle': 'Connection Proof SBT',
    'exchange.sbtDesc': '연결 증명으로 양쪽 모두에게 Soulbound Token이 발행됩니다.',
    'exchange.nearReceived': '{{amount}} NEAR 수신',
    'exchange.nearReceivedDesc': '{{account}}이(가) 커뮤니티 풀에서 {{amount}} NEAR을 받습니다.',
    'exchange.selfError': '자기 자신과는 명함 교환을 할 수 없습니다.',
    'exchange.connectToExchange': '지갑 연결하여 교환',
    'exchange.noTarget': '대상 계정이 지정되지 않았습니다.',

    // Exchange Complete
    'complete.connected': '연결 완료!',
    'complete.connectedSub': '명함 교환이 완료되었습니다',
    'complete.sbt': 'Connection SBT',
    'complete.location': '장소',
    'complete.tx': 'Tx',
    'complete.received': '수신 완료',
    'complete.whatsNext': '다음 단계',
    'complete.message': '메시지',
    'complete.tag': '태그',
    'complete.note': '메모',
    'complete.backHome': '홈으로 돌아가기',

    // NFC Register
    'register.title': 'NFC 카드 등록',
    'register.connectDesc': '지갑을 연결하여 이 NFC 카드를 계정에 연결하세요.',
    'register.cardId': '카드 ID',
    'register.alreadyLinked': '이미 연결됨',
    'register.alreadyLinkedDesc': '이 카드는 이미 귀하의 계정에 연결되어 있습니다.',
    'register.alreadyLinkedOther': '이 카드는 다른 계정에 연결되어 있습니다.',
    'register.goToCard': '내 명함으로',
    'register.cardLinked': '카드 연결 완료!',
    'register.cardLinkedDesc': 'NFC 카드가 연결되었습니다. 탭하면 프로필이 표시됩니다.',
    'register.linkTitle': 'NFC 카드 연결',
    'register.linkDesc': '이 NFC 카드를 NEAR 계정에 연결합니다. 탭으로 프로필을 공유하세요.',
    'register.account': '계정',
    'register.linkButton': '이 카드 연결',
    'register.backToCard': '내 명함으로 돌아가기',
    'register.noCardId': '카드 ID가 지정되지 않았습니다.',
    'register.linkFailed': '카드 연결에 실패했습니다.',

    // Party Mode Toggle
    'party.title': '파티 모드',
    'party.active': '활성 - {{label}}',
    'party.selectLink': '활성 - 링크 선택',
    'party.off': '꺼짐 - 탭하면 카드 표시',
    'party.change': '변경',

    // Party Mode Settings
    'partySettings.title': '파티 모드 링크',
    'partySettings.subtitle': 'NFC 탭 시 리다이렉트 대상 선택',
    'partySettings.noLinks': '프로필에 링크를 추가한 후 설정해 주세요.',
    'partySettings.redirectTo': '리다이렉트: {{url}}',
    'partySettings.save': '파티 모드 링크 저장',

    // NFC Card Manager
    'nfc.noCards': '연결된 NFC 카드 없음',
    'nfc.noCardsDesc': 'NFC 카드를 탭하여 연결을 시작하세요.',
    'nfc.party': '파티',
    'nfc.linked': '{{date}} 연결됨',
    'nfc.unlink': '연결 해제',

    // QR Code
    'qr.copyLink': '링크 복사',
    'qr.copied': '복사됨!',
  },
};

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === 'en' || stored === 'ja' || stored === 'zh' || stored === 'ko')) {
    return stored as Locale;
  }

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ko')) return 'ko';
  return 'en';
}

type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFunction;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(detectLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale === 'zh' ? 'zh-CN' : newLocale;
  }, []);

  const t: TranslateFunction = useCallback(
    (key, params) => {
      const str = translations[locale]?.[key] ?? translations.en[key] ?? key;
      if (!params) return str;
      return str.replace(/\{\{(\w+)\}\}/g, (_, k) =>
        params[k] !== undefined ? String(params[k]) : `{{${k}}}`
      );
    },
    [locale],
  );

  // SSR/hydration: render children immediately but with 'en' locale until mounted
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: 'en', setLocale, t }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
