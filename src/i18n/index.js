// i18n configuration and language management
import { reactive, computed } from 'vue';

// Language state management
export const i18nState = reactive({
  currentLanguage: 'zh-cn', // Default to Simplified Chinese
  languages: {
    'en': { name: 'English', code: 'en' },
    'zh-cn': { name: '简体中文', code: 'zh-cn' },
    'zh-tw': { name: '繁體中文', code: 'zh-tw' },
    'ja': { name: '日本語', code: 'ja' },
    'ko': { name: '한국어', code: 'ko' }
  }
});

// Language packs
const languagePacks = {
  'en': {
    'header.connectWallet': 'Connect Wallet',
    'wallet.connectTitle': 'Connect Wallet',
    'wallet.connectSubtitle': 'Select a wallet',
    'wallet.connectedTitle': 'Connected',
    'wallet.address': 'Address',
    'wallet.network': 'Network',
    'wallet.disconnect': 'Disconnect',
    'wallet.noWalletDetected': 'No wallet detected',
    'language.switchTitle': 'Select Language',
    'nav.home': 'Home',
    'nav.nft': 'NFT',
    'nav.team': 'Team',
    
    // Announcement
    'home.announcement.title': 'Urgent Announcement Regarding PGNLZ MAX System Upgrade',
    'home.announcement.greeting': 'Dear Users,',
    'home.announcement.p1': 'To provide you with better service and an ultimate experience, we are undergoing a comprehensive brand and technical upgrade. The platform has officially been renamed PGNLZ MAX. This upgrade is supported by the core development team of the original PG public chain, ensuring the advanced nature and reliability of the underlying architecture.',
    'home.announcement.bullet_intro': 'Currently, the technical team is fully advancing the following key tasks:',
    'home.announcement.b1': 'Contract Testing & Security Audit: A new round of contract deployment has been completed, and strict security audits and logic tests are being performed to ensure system stability and asset security.',
    'home.announcement.b2': 'DAPP Domain Upgrade: To align with the brand and functional upgrade, the DAPP domain will be officially updated to: pgnlz-max.com, providing you with a more convenient and secure access point.',
    'home.announcement.b3': 'On-chain Logic Optimization & Redeemable Function Expansion',
    'home.announcement.b4': 'Comprehensive UI Interface Refactoring',
    'home.announcement.p2': 'Based on the brand-new underlying architecture, we will fully ensure the safety of your funds and smooth transactions, bringing a better user experience.',
    'home.announcement.p3': 'The system is expected to complete the upgrade and go back online in the near future. Please pay attention to official notifications for the specific time.',
    'home.announcement.closing': 'Thank you for your continued patience and support! PGNLZ MAX is about to set sail!',
    'home.announcement.contact': 'If you have any questions, please contact us through official channels.',
    'home.announcement.signature': 'PGNLZ MAX Technical Team',
    'home.announcement.note': '(System upgrade work is proceeding in an orderly manner, stay tuned)'
  },
  'zh-cn': {
     'header.connectWallet': '连接钱包',
     'wallet.connectTitle': '连接钱包',
     'wallet.connectSubtitle': '请选择钱包',
     'wallet.connectedTitle': '已连接',
     'wallet.address': '地址',
     'wallet.network': '网络',
     'wallet.disconnect': '断开连接',
     'wallet.noWalletDetected': '未检测到钱包',
     'language.switchTitle': '选择语言',
     'nav.home': '首页',
     'nav.nft': 'NFT',
     'nav.team': '团队',

     // Announcement
     'home.announcement.title': 'PGNLZ MAX系统加急升级公告',
     'home.announcement.greeting': '尊敬的平台用户：\n您好！',
     'home.announcement.p1': '为向您提供更优质的服务与更极致的体验，我们正在进行全面的品牌与技术升级，平台现已正式更名为 PGNLZ MAX。本次升级得到了原PG公链核心开发团队的技术支持与合作，共同确保底层架构的先进性与可靠性。',
     'home.announcement.bullet_intro': '目前，技术团队正全力推进以下关键工作：',
     'home.announcement.b1': '合约测试与安全审计：已完成新一轮合约部署，并正在执行严格的安全审计与逻辑测试，以保障系统稳定与资产安全。',
     'home.announcement.b2': 'DAPP 域名升级：为配合品牌与功能升级，DAPP 域名将正式更新为：pgnlz-max.com，为您提供更便捷、更安全的访问入口。',
     'home.announcement.b3': '链上逻辑优化及可赎回功能扩展',
     'home.announcement.b4': 'UI 交互界面全面重构',
     'home.announcement.p2': '我们将基于全新的底层架构，全力确保您的资金安全与交易流畅，带来更优质的使用体验。',
     'home.announcement.p3': '系统预计于近期完成升级并重新上线，具体时间敬请留意官方后续通知。',
     'home.announcement.closing': '感谢您一直以来的耐心与支持！PGNLZ MAX，即将全新启航！',
     'home.announcement.contact': '如有任何疑问，可通过官方渠道联系我们。',
     'home.announcement.signature': 'PGNLZ MAX 技术团队',
     'home.announcement.note': '（系统升级工作正有序推进中，敬请期待）'
  },
  'zh-tw': {
     'header.connectWallet': '連接錢包',
     'wallet.connectTitle': '連接錢包',
     'wallet.connectSubtitle': '請選擇錢包',
     'wallet.connectedTitle': '已連接',
     'wallet.address': '地址',
     'wallet.network': '網絡',
     'wallet.disconnect': '斷開連接',
     'wallet.noWalletDetected': '未檢測到錢包',
     'language.switchTitle': '選擇語言',
     'nav.home': '首頁',
     'nav.nft': 'NFT',
     'nav.team': '團隊',

     // Announcement
     'home.announcement.title': 'PGNLZ MAX 系統加急升級公告',
     'home.announcement.greeting': '尊敬的平台用戶：\n您好！',
     'home.announcement.p1': '為向您提供更優質的服務與更極致的體驗，我們正在進行全面的品牌與技術升級，平台現已正式更名為 PGNLZ MAX。本次升級得到了原PG公鏈核心開發團隊的技術支持與合作，共同確保底層架構的先進性與可靠性。',
     'home.announcement.bullet_intro': '目前，技術團隊正全力推進以下關鍵工作：',
     'home.announcement.b1': '合約測試與安全審計：已完成新一輪合約部署，並正在執行嚴格的安全審計與邏輯測試，以保障系統穩定與資產安全。',
     'home.announcement.b2': 'DAPP 域名升級：為配合品牌與功能升級，DAPP 域名將正式更新為：pgnlz-max.com，為您提供更便捷、更安全的訪問入口。',
     'home.announcement.b3': '鏈上邏輯優化及可贖回功能擴展',
     'home.announcement.b4': 'UI 交互界面全面重構',
     'home.announcement.p2': '我們將基於全新的底層架構，全力確保您的資金安全與交易流暢，帶來更優質的使用體驗。',
     'home.announcement.p3': '系統預計於近期完成升級並重新上線，具體時間敬請留意官方後續通知。',
     'home.announcement.closing': '感謝您一直以來的耐心與支持！PGNLZ MAX，即將全新啟航！',
     'home.announcement.contact': '如有任何疑問，可通過官方渠道聯繫我們。',
     'home.announcement.signature': 'PGNLZ MAX 技術團隊',
     'home.announcement.note': '（系統升級工作正有序推進中，敬請期待）'
  },
  'ja': {
     'header.connectWallet': 'ウォレット接続',
     'wallet.connectTitle': 'ウォレット接続',
     'wallet.connectSubtitle': 'ウォレットを選択してください',
     'wallet.connectedTitle': '接続済み',
     'wallet.address': 'アドレス',
     'wallet.network': 'ネットワーク',
     'wallet.disconnect': '切断',
     'wallet.noWalletDetected': 'ウォレットが検出されませんでした',
     'language.switchTitle': '言語を選択',
     'nav.home': 'ホーム',
     'nav.nft': 'NFT',
     'nav.team': 'チーム',

     // Announcement
     'home.announcement.title': 'PGNLZ MAXシステムアップグレードに関する緊急のお知らせ',
     'home.announcement.greeting': 'ユーザーの皆様へ',
     'home.announcement.p1': 'より良いサービスと最高の体験を提供するため、全面的にブランドと技術のアップグレードを行っております。プラットフォームは正式にPGNLZ MAXに名称変更されました。今回のアップグレードは、元のPGパブリックチェーンのコア開発チームからの技術サポートと協力を得て、基盤アーキテクチャの先進性と信頼性を確保しています。',
     'home.announcement.bullet_intro': '現在、技術チームは以下の重要な作業を全力で進めています：',
     'home.announcement.b1': 'コントラクトテストとセキュリティ監査：新しいコントラクトの展開が完了し、システムの安定性と資産の安全を確保するために、厳格なセキュリティ監査とロジックテストを実行しています。',
     'home.announcement.b2': 'DAPPドメインのアップグレード：ブランドと機能のアップグレードに合わせて、DAPPドメインは正式にpgnlz-max.comに更新され、より便利で安全なアクセス入口を提供します。',
     'home.announcement.b3': 'オンチェーンロジックの最適化および償還可能機能の拡張',
     'home.announcement.b4': 'UIインターフェースの全面的な再構築',
     'home.announcement.p2': '全く新しい基盤アーキテクチャに基づき、資金の安全とスムーズな取引を全力で確保し、より良い利用体験をお届けします。',
     'home.announcement.p3': 'システムは近日中にアップグレードを完了し、再開する予定です。具体的な時間については、公式の後の通知にご注意ください。',
     'home.announcement.closing': 'これまでのご愛顧とご支援に感謝いたします！PGNLZ MAX、まもなく新たな船出です！',
     'home.announcement.contact': 'ご質問がございましたら、公式チャンネルを通じてお問い合わせください。',
     'home.announcement.signature': 'PGNLZ MAX 技術チーム',
     'home.announcement.note': '（システムアップグレード作業は順調に進行中です。ご期待ください）'
  },
  'ko': {
     'header.connectWallet': '지갑 연결',
     'wallet.connectTitle': '지갑 연결',
     'wallet.connectSubtitle': '지갑을 선택하세요',
     'wallet.connectedTitle': '연결됨',
     'wallet.address': '주소',
     'wallet.network': '네트워크',
     'wallet.disconnect': '연결 해제',
     'wallet.noWalletDetected': '지갑이 감지되지 않았습니다',
     'language.switchTitle': '언어 선택',
     'nav.home': '홈',
     'nav.nft': 'NFT',
     'nav.team': '팀',

     // Announcement
     'home.announcement.title': 'PGNLZ MAX 시스템 업그레이드에 관한 긴급 공지',
     'home.announcement.greeting': '존경하는 사용자 여러분,',
     'home.announcement.p1': '더 나은 서비스와 최고의 경험을 제공하기 위해 전면적인 브랜드 및 기술 업그레이드를 진행 중이며, 플랫폼 명칭이 PGNLZ MAX로 공식 변경되었습니다. 이번 업그레이드는 원 PG 퍼블릭 체인 핵심 개발팀의 기술 지원과 협력을 받아 기본 아키텍처의 선진성과 신뢰성을 공동으로 보장합니다.',
     'home.announcement.bullet_intro': '현재 기술팀은 다음 주요 작업을 전력으로 추진하고 있습니다:',
     'home.announcement.b1': '계약 테스트 및 보안 감사: 새로운 계약 배포가 완료되었으며, 시스템 안정성과 자산 안전을 보장하기 위해 엄격한 보안 감사 및 로직 테스트를 수행하고 있습니다.',
     'home.announcement.b2': 'DAPP 도메인 업그레이드: 브랜드 및 기능 업그레이드에 맞춰 DAPP 도메인이 공식적으로 pgnlz-max.com으로 업데이트되어 더 편리하고 안전한 접속 경로를 제공할 것입니다.',
     'home.announcement.b3': '온체인 로직 최적화 및 상환 가능 기능 확장',
     'home.announcement.b4': 'UI 인터페이스 전면 재구축',
     'home.announcement.p2': '새로운 기본 아키텍처를 기반으로 자금 안전과 원활한 거래를 전력으로 보장하며, 더 나은 사용 경험을 제공하겠습니다.',
     'home.announcement.p3': '시스템은 조만간 업그레이드를 완료하고 다시 오픈할 예정이며, 구체적인 시간은 공식 후속 공지를 확인해 주시기 바랍니다.',
     'home.announcement.closing': '그동안의 인내와 지지에 감사드립니다! PGNLZ MAX, 곧 새롭게 출발합니다!',
     'home.announcement.contact': '질문이 있으시면 공식 채널을 통해 문의해 주시기 바랍니다.',
     'home.announcement.signature': 'PGNLZ MAX 기술팀',
     'home.announcement.note': '(시스템 업그레이드 작업이 순조롭게 진행 중입니다. 기대해 주세요)'
  }
};

// Translation function
export function t(key, params = {}) {
  const currentPack = languagePacks[i18nState.currentLanguage];
  if (!currentPack) return key;
  
  let translation = currentPack[key];
  if (translation === undefined) return key;
  
  Object.keys(params).forEach(param => {
    translation = translation.replace(`{${param}}`, params[param]);
  });
  
  return translation;
}

export function setLanguage(languageCode) {
  if (i18nState.languages[languageCode]) {
    i18nState.currentLanguage = languageCode;
    localStorage.setItem('pgnlz_language', languageCode);
    window.location.reload();
  }
}

export function initializeLanguage() {
  const savedLanguage = localStorage.getItem('pgnlz_language');
  if (savedLanguage && i18nState.languages[savedLanguage]) {
    i18nState.currentLanguage = savedLanguage;
  }
}

export const currentLanguage = computed(() => i18nState.currentLanguage);
export const availableLanguages = computed(() => Object.values(i18nState.languages));
