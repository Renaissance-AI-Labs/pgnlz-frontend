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
    'nav.team': 'Friends',
    
    // Announcement
    'home.announcement.title': 'Urgent Announcement Regarding PGNLZ MAX System Upgrade',
    'home.announcement.greeting': 'Dear Users,',
    'home.announcement.p1': 'To provide you with better service and an ultimate experience, we are undergoing a comprehensive brand and technical upgrade. The platform has officially been renamed PGNLZ MAX. This upgrade is supported by the core development team of the original PG public chain, ensuring the advanced nature and reliability of the underlying architecture',
    'home.announcement.bullet_intro': 'Currently, the technical team is fully advancing the following key tasks:',
    'home.announcement.b1': 'Contract Testing & Security Audit: A new round of contract deployment has been completed, and strict security audits and logic tests are being performed to ensure system stability and asset security',
    'home.announcement.b2': 'DAPP Domain Upgrade: To align with the brand and functional upgrade, the DAPP domain will be officially updated to: pgnlz-max.com, providing you with a more convenient and secure access point',
    'home.announcement.b3': 'On-chain Logic Optimization & Redeemable Function Expansion',
    'home.announcement.b4': 'Comprehensive UI Interface Refactoring',
    'home.announcement.p2': 'Based on the brand-new underlying architecture, we will fully ensure the safety of your funds and smooth transactions, bringing a better user experience',
    'home.announcement.p3': 'The system is expected to complete the upgrade and go back online in the near future. Please pay attention to official notifications for the specific time',
    'home.announcement.closing': 'Thank you for your continued patience and support! PGNLZ MAX is about to set sail!',
    'home.announcement.contact': 'If you have any questions, please contact us through official channels',
    'home.announcement.signature': 'PGNLZ MAX Technical Team',
    'home.announcement.note': '(System upgrade work is proceeding in an orderly manner, stay tuned)',

    // NFT Page
    'nft.pageTitle': '< NFT NODE />',
    'nft.intro': 'Hold PGNLZ MAX NODE NFT to earn network staking rewards and share token transaction tax revenue',
    'nft.myNodeNft': 'My NODE NFT',
    'nft.currentHolding': 'Currently Holding',
    'nft.comingSoon': 'COMING SOON',

    // Team / Friend Page
    'team.pageTitle': '< Friends />',
    'team.intro': 'Join PGNLZ MAX to build the future decentralized ecosystem',
    'team.tab.myFriends': 'My Friends',
    'team.tab.myReferrals': 'My Referrals',
    'team.friendsCount': 'Friends Count',
    'team.teamCount': 'Team Size',
    'team.peopleUnit': '',
    'team.friendsList': 'Friends List',
    'team.noFriends': 'No Friends Yet',
    'team.loading': 'Loading...',
    'team.loadMore': 'Load More',
    'team.myReferralLink': 'My Referral Link',
    'team.referralLinkDesc': 'Copy your exclusive link to invite friends',
    'team.copy': 'Copy',
    'team.myReferrer': 'My Referrer',
    'team.bindReferrerDesc': 'Bind a referrer address to establish connection',
    'team.bindSuccessDesc': 'Successfully bound referrer',
    'team.inputPlaceholder.autoFill': 'Visit via referral link to auto-fill',
    'team.inputPlaceholder.connectWallet': 'Please connect wallet first',
    'team.binding': 'Binding...',
    'team.bind': 'Bind',
    'team.modal.bindTitle': 'Bind Referrer',
    'team.modal.warning': 'Please confirm the referrer address carefully. It cannot be changed after binding',
    'team.modal.cancel': 'Cancel',
    'team.modal.confirm': 'Confirm',
    'team.toast.invalidAddress': 'Please enter a valid referrer address',
    'team.toast.formatError': 'Address format is incorrect',
    'team.toast.selfBindError': 'Cannot bind yourself as referrer',
    'team.toast.referrerNotJoined': 'Invalid referrer: This address has not joined the referral system',
    'team.toast.txSubmitted': 'Transaction submitted, please wait for confirmation...',
    'team.toast.bindSuccess': 'Binding successful!',
    'team.toast.bindFailed': 'Binding failed: ',
    'team.toast.alreadyBound': 'Binding failed: You already have a referrer',
    'team.toast.checkNetwork': 'Binding failed, please check network or address',
    'team.toast.copySuccess': 'Copied to clipboard',
    'team.toast.copyFailed': 'Copy failed',
    'team.link.bindFirst': 'Available after binding a referrer'
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
     'nav.team': '好友',

     // Announcement
     'home.announcement.title': 'PGNLZ MAX系统加急升级公告',
     'home.announcement.greeting': '尊敬的平台用户：\n您好！',
     'home.announcement.p1': '为向您提供更优质的服务与更极致的体验，我们正在进行全面的品牌与技术升级，平台现已正式更名为 PGNLZ MAX。本次升级得到了原PG公链核心开发团队的技术支持与合作，共同确保底层架构的先进性与可靠性',
     'home.announcement.bullet_intro': '目前，技术团队正全力推进以下关键工作：',
     'home.announcement.b1': '合约测试与安全审计：已完成新一轮合约部署，并正在执行严格的安全审计与逻辑测试，以保障系统稳定与资产安全',
     'home.announcement.b2': 'DAPP 域名升级：为配合品牌与功能升级，DAPP 域名将正式更新为：pgnlz-max.com，为您提供更便捷、更安全的访问入口',
     'home.announcement.b3': '链上逻辑优化及可赎回功能扩展',
     'home.announcement.b4': 'UI 交互界面全面重构',
     'home.announcement.p2': '我们将基于全新的底层架构，全力确保您的资金安全与交易流畅，带来更优质的使用体验',
     'home.announcement.p3': '系统预计于近期完成升级并重新上线，具体时间敬请留意官方后续通知',
     'home.announcement.closing': '感谢您一直以来的耐心与支持！PGNLZ MAX，即将全新启航！',
     'home.announcement.contact': '如有任何疑问，可通过官方渠道联系我们',
     'home.announcement.signature': 'PGNLZ MAX 技术团队',
     'home.announcement.note': '（系统升级工作正有序推进中，敬请期待）',

     // NFT Page
     'nft.pageTitle': '< NFT NODE />',
     'nft.intro': '持有PGNLZ MAX NODE NFT，可获得网络质押收益及代币交易税收入分成',
     'nft.myNodeNft': '我的 NODE NFT',
     'nft.currentHolding': '当前持有',
     'nft.comingSoon': '敬请期待',

     // Team / Friend Page
     'team.pageTitle': '< 好友 />',
     'team.intro': '加入PGNLZ MAX，共建未来去中心化生态',
     'team.tab.myFriends': '我的好友',
     'team.tab.myReferrals': '我的推荐',
     'team.friendsCount': '好友人数',
     'team.teamCount': '组队人数',
     'team.peopleUnit': '人',
     'team.friendsList': '好友列表',
     'team.noFriends': '暂无好友',
     'team.loading': '加载中...',
     'team.loadMore': '加载更多',
     'team.myReferralLink': '我的邀请链接',
     'team.referralLinkDesc': '复制您的专属链接，邀请好友加入',
     'team.copy': '复制',
     'team.myReferrer': '我的推荐人',
     'team.bindReferrerDesc': '绑定推荐人地址，建立互动联系',
     'team.bindSuccessDesc': '已成功绑定推荐人',
     'team.inputPlaceholder.autoFill': '请通过邀请链接访问以自动填充',
     'team.inputPlaceholder.connectWallet': '请先连接钱包',
     'team.binding': '绑定中...',
     'team.bind': '绑定',
     'team.modal.bindTitle': '绑定推荐人',
     'team.modal.warning': '请仔细确认推荐人地址，绑定后不可更换',
     'team.modal.cancel': '取消',
     'team.modal.confirm': '确认',
     'team.toast.invalidAddress': '请输入有效的推荐人地址',
     'team.toast.formatError': '地址格式不正确',
     'team.toast.selfBindError': '不能绑定自己作为上级',
     'team.toast.referrerNotJoined': '无效的推荐人：该地址尚未加入邀请系统',
     'team.toast.txSubmitted': '交易已提交，请等待确认...',
     'team.toast.bindSuccess': '绑定成功！',
     'team.toast.bindFailed': '绑定失败: ',
     'team.toast.alreadyBound': '绑定失败：您已经有上级了',
     'team.toast.checkNetwork': '绑定失败，请检查网络或地址',
     'team.toast.copySuccess': '已复制到剪贴板',
     'team.toast.copyFailed': '复制失败',
     'team.link.bindFirst': '绑定推荐人地址后可用'
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
     'nav.team': '好友',

     // Announcement
     'home.announcement.title': 'PGNLZ MAX 系統加急升級公告',
     'home.announcement.greeting': '尊敬的平台用戶：\n您好！',
     'home.announcement.p1': '為向您提供更優質的服務與更極致的體驗，我們正在進行全面的品牌與技術升級，平台現已正式更名為 PGNLZ MAX。本次升級得到了原PG公鏈核心開發團隊的技術支持與合作，共同確保底層架構的先進性與可靠性',
     'home.announcement.bullet_intro': '目前，技術團隊正全力推進以下關鍵工作：',
     'home.announcement.b1': '合約測試與安全審計：已完成新一輪合約部署，並正在執行嚴格的安全審計與邏輯測試，以保障系統穩定與資產安全',
     'home.announcement.b2': 'DAPP 域名升級：為配合品牌與功能升級，DAPP 域名將正式更新為：pgnlz-max.com，為您提供更便捷、更安全的訪問入口',
     'home.announcement.b3': '鏈上邏輯優化及可贖回功能擴展',
     'home.announcement.b4': 'UI 交互界面全面重構',
     'home.announcement.p2': '我們將基於全新的底層架構，全力確保您的資金安全與交易流暢，帶來更優質的使用體驗',
     'home.announcement.p3': '系統預計於近期完成升級並重新上線，具體時間敬請留意官方後續通知',
     'home.announcement.closing': '感謝您一直以來的耐心與支持！PGNLZ MAX，即將全新啟航！',
     'home.announcement.contact': '如有任何疑問，可通過官方渠道聯繫我們',
     'home.announcement.signature': 'PGNLZ MAX 技術團隊',
     'home.announcement.note': '（系統升級工作正有序推進中，敬請期待）',

     // NFT Page
     'nft.pageTitle': '< NFT NODE />',
     'nft.intro': '持有PGNLZ MAX NODE NFT，可獲得網絡質押收益及代币交易税收入分成',
     'nft.myNodeNft': '我的 NODE NFT',
     'nft.currentHolding': '當前持有',
     'nft.comingSoon': '敬請期待',

     // Team / Friend Page
     'team.pageTitle': '< 好友 />',
     'team.intro': '加入PGNLZ MAX，共建未來去中心化生態',
     'team.tab.myFriends': '我的好友',
     'team.tab.myReferrals': '我的推薦',
     'team.friendsCount': '好友人數',
     'team.teamCount': '組隊人數',
     'team.peopleUnit': '人',
     'team.friendsList': '好友列表',
     'team.noFriends': '暫無好友',
     'team.loading': '加載中...',
     'team.loadMore': '加載更多',
     'team.myReferralLink': '我的邀請鏈接',
     'team.referralLinkDesc': '複製您的專屬鏈接，邀請好友加入',
     'team.copy': '複製',
     'team.myReferrer': '我的推薦人',
     'team.bindReferrerDesc': '綁定推薦人地址，建立互動聯繫',
     'team.bindSuccessDesc': '已成功綁定推薦人',
     'team.inputPlaceholder.autoFill': '請通過邀請鏈接訪問以自動填充',
     'team.inputPlaceholder.connectWallet': '請先連接錢包',
     'team.binding': '綁定中...',
     'team.bind': '綁定',
     'team.modal.bindTitle': '綁定推薦人',
     'team.modal.warning': '請仔細確認推薦人地址，綁定後不可更換',
     'team.modal.cancel': '取消',
     'team.modal.confirm': '確認',
     'team.toast.invalidAddress': '請輸入有效的推薦人地址',
     'team.toast.formatError': '地址格式不正確',
     'team.toast.selfBindError': '不能綁定自己作為上級',
     'team.toast.referrerNotJoined': '無效的推薦人：該地址尚未加入邀請系統',
     'team.toast.txSubmitted': '交易已提交，請等待確認...',
     'team.toast.bindSuccess': '綁定成功！',
     'team.toast.bindFailed': '綁定失敗: ',
     'team.toast.alreadyBound': '綁定失敗：您已經有上級了',
     'team.toast.checkNetwork': '綁定失敗，請檢查網絡或地址',
     'team.toast.copySuccess': '已複製到剪貼板',
     'team.toast.copyFailed': '複製失敗',
     'team.link.bindFirst': '綁定推薦人地址後可用'
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
     'nav.team': '友達',

     // Announcement
     'home.announcement.title': 'PGNLZ MAXシステムアップグレードに関する緊急のお知らせ',
     'home.announcement.greeting': 'ユーザーの皆様へ',
     'home.announcement.p1': 'より良いサービスと最高の体験を提供するため、全面的にブランドと技術のアップグレードを行っております。プラットフォームは正式にPGNLZ MAXに名称変更されました。今回のアップグレードは、元のPGパブリックチェーンのコア開発チームからの技術サポートと協力を得て、基盤アーキテクチャの先進性と信頼性を確保しています',
     'home.announcement.bullet_intro': '現在、技術チームは以下の重要な作業を全力で進めています：',
     'home.announcement.b1': 'コントラクトテストとセキュリティ監査：新しいコントラクトの展開が完了し、システムの安定性と資産の安全を確保するために、厳格なセキュリティ監査とロジックテストを実行しています',
     'home.announcement.b2': 'DAPPドメインのアップグレード：ブランドと機能のアップグレードに合わせて、DAPPドメインは正式にpgnlz-max.comに更新され、より便利で安全なアクセス入口を提供します',
     'home.announcement.b3': 'オンチェーンロジックの最適化および償還可能機能の拡張',
     'home.announcement.b4': 'UIインターフェースの全面的な再構築',
     'home.announcement.p2': '全く新しい基盤アーキテクチャに基づき、資金の安全とスムーズな取引を全力で確保し、より良い利用体験をお届けします',
     'home.announcement.p3': 'システムは近日中にアップグレードを完了し、再開する予定です。具体的な時間については、公式の後の通知にご注意ください',
     'home.announcement.closing': 'これまでのご愛顧とご支援に感謝いたします！PGNLZ MAX、まもなく新たな船出です！',
     'home.announcement.contact': 'ご質問がございましたら、公式チャンネルを通じてお問い合わせください',
     'home.announcement.signature': 'PGNLZ MAX 技術チーム',
     'home.announcement.note': '（システムアップグレード作業は順調に進行中です。ご期待ください）',

     // NFT Page
     'nft.pageTitle': '< NFT NODE />',
     'nft.intro': 'PGNLZ MAX NODE NFTを保有して、ネットワークステーキング報酬とトークン取引税収の分配を獲得しましょう',
     'nft.myNodeNft': '私の NODE NFT',
     'nft.currentHolding': '現在の保有数',
     'nft.comingSoon': '近日公開',

     // Team / Friend Page
     'team.pageTitle': '< 友達 />',
     'team.intro': 'PGNLZ MAXに参加して、未来の分散型エコシステムを共に築きましょう',
     'team.tab.myFriends': '私の友達',
     'team.tab.myReferrals': '私の紹介',
     'team.friendsCount': '友達数',
     'team.teamCount': 'チーム人数',
     'team.peopleUnit': '人',
     'team.friendsList': '友達リスト',
     'team.noFriends': '友達はいません',
     'team.loading': '読み込み中...',
     'team.loadMore': 'もっと読み込む',
     'team.myReferralLink': '私の紹介リンク',
     'team.referralLinkDesc': '専用リンクをコピーして友達を招待しましょう',
     'team.copy': 'コピー',
     'team.myReferrer': '私の紹介者',
     'team.bindReferrerDesc': '紹介者のアドレスをバインドして、つながりを築きましょう',
     'team.bindSuccessDesc': '紹介者のバインドに成功しました',
     'team.inputPlaceholder.autoFill': '紹介リンク経由でアクセスして自動入力',
     'team.inputPlaceholder.connectWallet': 'まずウォレットを接続してください',
     'team.binding': 'バインド中...',
     'team.bind': 'バインド',
     'team.modal.bindTitle': '紹介者をバインド',
     'team.modal.warning': '紹介者のアドレスをよく確認してください。バインド後は変更できません',
     'team.modal.cancel': 'キャンセル',
     'team.modal.confirm': '確認',
     'team.toast.invalidAddress': '有効な紹介者アドレスを入力してください',
     'team.toast.formatError': 'アドレスの形式が正しくありません',
     'team.toast.selfBindError': '自分を紹介者としてバインドすることはできません',
     'team.toast.referrerNotJoined': '無効な紹介者：このアドレスは紹介システムに参加していません',
     'team.toast.txSubmitted': 'トランザクションが送信されました。確認をお待ちください...',
     'team.toast.bindSuccess': 'バインド成功！',
     'team.toast.bindFailed': 'バインド失敗: ',
     'team.toast.alreadyBound': 'バインド失敗：既に紹介者がいます',
     'team.toast.checkNetwork': 'バインド失敗。ネットワークまたはアドレスを確認してください',
     'team.toast.copySuccess': 'クリップボードにコピーしました',
     'team.toast.copyFailed': 'コピーに失敗しました',
     'team.link.bindFirst': '紹介者をバインドした後に利用可能'
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
     'nav.team': '친구',

     // Announcement
     'home.announcement.title': 'PGNLZ MAX 시스템 업그레이드에 관한 긴급 공지',
     'home.announcement.greeting': '존경하는 사용자 여러분,',
     'home.announcement.p1': '더 나은 서비스와 최고의 경험을 제공하기 위해 전면적인 브랜드 및 기술 업그레이드를 진행 중이며, 플랫폼 명칭이 PGNLZ MAX로 공식 변경되었습니다. 이번 업그레이드는 원 PG 퍼블릭 체인 핵심 개발팀의 기술 지원과 협력을 받아 기본 아키텍처의 선진성과 신뢰성을 공동으로 보장합니다',
     'home.announcement.bullet_intro': '현재 기술팀은 다음 주요 작업을 전력으로 추진하고 있습니다:',
     'home.announcement.b1': '계약 테스트 및 보안 감사: 새로운 계약 배포가 완료되었으며, 시스템 안정성과 자산 안전을 보장하기 위해 엄격한 보안 감사 및 로직 테스트를 수행하고 있습니다',
     'home.announcement.b2': 'DAPP 도메인 업그레이드: 브랜드 및 기능 업그레이드에 맞춰 DAPP 도메인이 공식적으로 pgnlz-max.com으로 업데이트되어 더 편리하고 안전한 접속 경로를 제공할 것입니다',
     'home.announcement.b3': '온체인 로직 최적화 및 상환 가능 기능 확장',
     'home.announcement.b4': 'UI 인터페이스 전면 재구축',
     'home.announcement.p2': '새로운 기본 아키텍처를 기반으로 자금 안전과 원활한 거래를 전력으로 보장하며, 더 나은 사용 경험을 제공하겠습니다',
     'home.announcement.p3': '시스템은 조만간 업그레이드를 완료하고 다시 오픈할 예정이며, 구체적인 시간은 공식 후속 공지를 확인해 주시기 바랍니다',
     'home.announcement.closing': '그동안의 인내와 지지에 감사드립니다! PGNLZ MAX, 곧 새롭게 출발합니다!',
     'home.announcement.contact': '질문이 있으시면 공식 채널을 통해 문의해 주시기 바랍니다',
     'home.announcement.signature': 'PGNLZ MAX 기술팀',
     'home.announcement.note': '(시스템 업그레이드 작업이 순조롭게 진행 중입니다. 기대해 주세요)',

     // NFT Page
     'nft.pageTitle': '< NFT NODE />',
     'nft.intro': 'PGNLZ MAX NODE NFT를 보유하여 네트워크 스테이킹 보상 및 토큰 거래 세금 수익 분배를 받으세요',
     'nft.myNodeNft': '나의 NODE NFT',
     'nft.currentHolding': '현재 보유',
     'nft.comingSoon': '출시 예정',

     // Team / Friend Page
     'team.pageTitle': '< 친구 />',
     'team.intro': 'PGNLZ MAX에 참여하여 미래의 탈중앙화 생태계를 함께 구축하세요',
     'team.tab.myFriends': '내 친구',
     'team.tab.myReferrals': '내 추천',
     'team.friendsCount': '친구 수',
     'team.teamCount': '팀원 수',
     'team.peopleUnit': '명',
     'team.friendsList': '친구 목록',
     'team.noFriends': '친구 없음',
     'team.loading': '로딩 중...',
     'team.loadMore': '더 불러오기',
     'team.myReferralLink': '내 추천 링크',
     'team.referralLinkDesc': '전용 링크를 복사하여 친구를 초대하세요',
     'team.copy': '복사',
     'team.myReferrer': '내 추천인',
     'team.bindReferrerDesc': '추천인 주소를 바인딩하여 관계를 맺으세요',
     'team.bindSuccessDesc': '추천인이 성공적으로 바인딩되었습니다',
     'team.inputPlaceholder.autoFill': '추천 링크를 통해 방문하여 자동 완성',
     'team.inputPlaceholder.connectWallet': '먼저 지갑을 연결하세요',
     'team.binding': '바인딩 중...',
     'team.bind': '바인딩',
     'team.modal.bindTitle': '추천인 바인딩',
     'team.modal.warning': '추천인 주소를 신중하게 확인하세요. 바인딩 후에는 변경할 수 없습니다',
     'team.modal.cancel': '취소',
     'team.modal.confirm': '확인',
     'team.toast.invalidAddress': '유효한 추천인 주소를 입력하세요',
     'team.toast.formatError': '주소 형식이 올바르지 않습니다',
     'team.toast.selfBindError': '자신을 추천인으로 바인딩할 수 없습니다',
     'team.toast.referrerNotJoined': '유효하지 않은 추천인: 이 주소는 추천 시스템에 참여하지 않았습니다',
     'team.toast.txSubmitted': '트랜잭션이 제출되었습니다. 확인을 기다려주세요...',
     'team.toast.bindSuccess': '바인딩 성공!',
     'team.toast.bindFailed': '바인딩 실패: ',
     'team.toast.alreadyBound': '바인딩 실패: 이미 추천인이 있습니다',
     'team.toast.checkNetwork': '바인딩 실패, 네트워크 또는 주소를 확인하세요',
     'team.toast.copySuccess': '클립보드에 복사되었습니다',
     'team.toast.copyFailed': '복사 실패',
     'team.link.bindFirst': '추천인을 바인딩한 후 사용 가능'
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
