/**
 * 大富豪 - UI制御（Phase 3: 全機能統合版）
 */

// ===== グローバル変数 =====
let game;
let ai;
let shop;
let selectedCards = [];
let selectedJoker = null;
let aiJokersForBattle = [];
let jokerToSell = null;
let isTestMode = false;  // テストモードフラグ
let testModeJokers = [];  // テストモード用ジョーカー
let destroyTargets = [];  // 破壊ジョーカー選択用
let usedJokerInGame = false;  // ゲーム中にジョーカーを使用したか
let usedDrawJokerInGame = false;  // ドロージョーカーを使用したか
let usedBonusTrumpsCount = 0;  // 使用したボーナストランプ数
let lastPlayedCards = [];  // 最後に出したカード（ペナルティ判定用）
let pendingPurchaseIndex = null;  // 購入確認中のアイテムインデックス
let selectedBonusPackCard = null;  // 選択中のボーナスパックカード
let pendingBonusPackCards = [];  // ボーナスパックのカード一覧
let previousMoneyForRankCheck = 0;  // ランク変動チェック用

// ===== DOM要素 =====
const elements = {
    // 所持金・ランク
    moneyDisplay: document.getElementById('moneyDisplay'),
    rankIcon: document.getElementById('rankIcon'),
    rankName: document.getElementById('rankName'),
    moneyAmount: document.getElementById('moneyAmount'),

    // 画面
    titleScreen: document.getElementById('titleScreen'),
    testSelectScreen: document.getElementById('testSelectScreen'),
    matchmakeScreen: document.getElementById('matchmakeScreen'),
    playScreen: document.getElementById('playScreen'),
    resultScreen: document.getElementById('resultScreen'),
    shopScreen: document.getElementById('shopScreen'),

    // タイトル・テスト
    startGameBtn: document.getElementById('startGameBtn'),
    testModeBtn: document.getElementById('testModeBtn'),
    testJokerList: document.getElementById('testJokerList'),
    testBackBtn: document.getElementById('testBackBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    battleBtn: document.getElementById('battleBtn'),
    backToTitleBtn: document.getElementById('backToTitleBtn'),
    jokerInfo: document.getElementById('jokerInfo'),

    // プレイ画面
    aiHand: document.getElementById('aiHand'),
    playerHand: document.getElementById('playerHand'),
    field: document.getElementById('field'),
    playBtn: document.getElementById('playBtn'),
    passBtn: document.getElementById('passBtn'),
    gameMessage: document.getElementById('gameMessage'),
    validationMessage: document.getElementById('validationMessage'),
    turnIndicator: document.getElementById('turnIndicator'),
    revolutionStatus: document.getElementById('revolutionStatus'),
    backStatus: document.getElementById('backStatus'),
    shibariStatus: document.getElementById('shibariStatus'),
    aiCardCount: document.getElementById('aiCardCount'),
    playerCardCount: document.getElementById('playerCardCount'),
    aiJokers: document.getElementById('aiJokers'),
    playerJokers: document.getElementById('playerJokers'),
    firstPlayerSelection: document.getElementById('firstPlayerSelection'),
    firstPlayerCards: document.getElementById('firstPlayerCards'),
    fieldRevolutionBadge: document.getElementById('fieldRevolutionBadge'),
    fieldShibariBadge: document.getElementById('fieldShibariBadge'),
    playerRevolutionBadge: document.getElementById('playerRevolutionBadge'),
    playerShibariBadge: document.getElementById('playerShibariBadge'),

    // リザルト
    resultIcon: document.getElementById('resultIcon'),
    resultTitle: document.getElementById('resultTitle'),
    resultMessage: document.getElementById('resultMessage'),
    rewardSection: document.getElementById('rewardSection'),
    rewardBreakdown: document.getElementById('rewardBreakdown'),
    rewardTotal: document.getElementById('rewardTotal'),
    handHistoryList: document.getElementById('handHistoryList'),
    nextBtn: document.getElementById('nextBtn'),

    // ショップ
    shopLineup: document.getElementById('shopLineup'),
    ownedJokers: document.getElementById('ownedJokers'),
    ownedJokerCount: document.getElementById('ownedJokerCount'),
    selectedJokers: document.getElementById('selectedJokers'),
    rerollBtn: document.getElementById('rerollBtn'),
    rerollCost: document.getElementById('rerollCost'),
    nextBattleBtn: document.getElementById('nextBattleBtn'),

    // モーダル
    jokerActionModal: document.getElementById('jokerActionModal'),
    jokerModalTitle: document.getElementById('jokerModalTitle'),
    jokerModalMessage: document.getElementById('jokerModalMessage'),
    jokerModalContent: document.getElementById('jokerModalContent'),
    jokerModalConfirm: document.getElementById('jokerModalConfirm'),
    bomberModal: document.getElementById('bomberModal'),
    bomberRankSelect: document.getElementById('bomberRankSelect'),
    settingsModal: document.getElementById('settingsModal'),
    autoPassToggle: document.getElementById('autoPassToggle'),
    settingsCloseBtn: document.getElementById('settingsCloseBtn'),
    dogezaModal: document.getElementById('dogezaModal'),
    dogezaYes: document.getElementById('dogezaYes'),
    dogezaNo: document.getElementById('dogezaNo'),
    dogezaDiscardModal: document.getElementById('dogezaDiscardModal'),
    dogezaDiscardMessage: document.getElementById('dogezaDiscardMessage'),
    dogezaDiscardClose: document.getElementById('dogezaDiscardClose'),
    sellJokerModal: document.getElementById('sellJokerModal'),
    sellJokerMessage: document.getElementById('sellJokerMessage'),
    sellJokerYes: document.getElementById('sellJokerYes'),
    sellJokerNo: document.getElementById('sellJokerNo'),
    limitModal: document.getElementById('limitModal'),
    limitModalClose: document.getElementById('limitModalClose'),
    destroyModal: document.getElementById('destroyModal'),
    destroyMessage: document.getElementById('destroyMessage'),
    destroyTargets: document.getElementById('destroyTargets'),
    destroyConfirm: document.getElementById('destroyConfirm'),
    peekModal: document.getElementById('peekModal'),
    peekCards: document.getElementById('peekCards'),
    peekCountdown: document.getElementById('peekCountdown'),
    notifyModal: document.getElementById('notifyModal'),
    notifyTitle: document.getElementById('notifyTitle'),
    notifyMessage: document.getElementById('notifyMessage'),
    notifyClose: document.getElementById('notifyClose'),

    // ランク変動モーダル
    rankChangeModal: document.getElementById('rankChangeModal'),
    rankChangeEffect: document.getElementById('rankChangeEffect'),
    rankChangeIcon: document.getElementById('rankChangeIcon'),
    rankChangeTitle: document.getElementById('rankChangeTitle'),
    rankChangeMessage: document.getElementById('rankChangeMessage'),
    rankChangePrev: document.getElementById('rankChangePrev'),
    rankChangeNext: document.getElementById('rankChangeNext'),

    // 購入確認モーダル
    purchaseConfirmModal: document.getElementById('purchaseConfirmModal'),
    purchaseConfirmContent: document.getElementById('purchaseConfirmContent'),
    purchaseConfirmYes: document.getElementById('purchaseConfirmYes'),
    purchaseConfirmNo: document.getElementById('purchaseConfirmNo'),

    // ボーナスパックモーダル
    bonusPackModal: document.getElementById('bonus-pack-modal'),
    bonusPackCards: document.getElementById('bonus-pack-cards'),
    bonusPackConfirm: document.getElementById('bonus-pack-confirm'),

    // ジョーカー設定モーダル
    jokerSettingsBtn: document.getElementById('joker-settings-btn'),
    jokerSettingsModal: document.getElementById('joker-settings-modal'),
    jokerSettingsList: document.getElementById('joker-settings-list'),
    jokerDetailPopup: document.getElementById('joker-detail-popup'),
    closeJokerSettings: document.getElementById('close-joker-settings')
};

let longPressTimer;
let isLongPress = false;

// ===== 画面遷移 =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    document.getElementById(screenId + 'Screen').classList.remove('hidden');
}

// ===== 初期化 =====
function init() {
    setupEventListeners();
    updateMoneyDisplay();
    showScreen('title');
}

function setupEventListeners() {
    // タイトル画面
    elements.startGameBtn.addEventListener('click', () => {
        isTestMode = false;
        showScreen('matchmake');
        updateMatchmakeScreen();
    });
    elements.testModeBtn.addEventListener('click', showTestSelectScreen);
    elements.testBackBtn.addEventListener('click', () => showScreen('title'));
    elements.settingsBtn.addEventListener('click', openSettings);

    // マッチメイク画面
    elements.battleBtn.addEventListener('click', startBattle);
    elements.backToTitleBtn.addEventListener('click', () => showScreen('title'));

    // プレイ画面
    elements.playBtn.addEventListener('click', playSelectedCards);
    elements.passBtn.addEventListener('click', playerPass);

    // リザルト画面
    elements.nextBtn.addEventListener('click', onNextFromResult);

    // ショップ画面
    elements.rerollBtn.addEventListener('click', rerollShop);
    elements.nextBattleBtn.addEventListener('click', onNextBattle);

    // 設定モーダル
    elements.autoPassToggle.checked = gameSystem.isAutoPassEnabled();
    elements.autoPassToggle.addEventListener('change', (e) => {
        gameSystem.setAutoPass(e.target.checked);
    });
    elements.settingsCloseBtn.addEventListener('click', closeSettings);

    // 土下座モーダル
    elements.dogezaYes.addEventListener('click', executeDogeza);
    elements.dogezaNo.addEventListener('click', () => {
        closeDogezaModal();
        showResult(false);
    });
    elements.dogezaDiscardClose.addEventListener('click', closeDogezaDiscardModal);

    // 売却モーダル
    elements.sellJokerYes.addEventListener('click', confirmSellJoker);
    elements.sellJokerNo.addEventListener('click', closeSellJokerModal);

    // 上限モーダル
    elements.limitModalClose.addEventListener('click', () => elements.limitModal.classList.add('hidden'));

    // 破壊モーダル
    elements.destroyConfirm.addEventListener('click', confirmDestroy);

    // 通知モーダル
    elements.notifyClose.addEventListener('click', () => elements.notifyModal.classList.add('hidden'));

    // ジョーカーアクションモーダル
    elements.jokerModalConfirm.addEventListener('click', confirmJokerAction);
}

// ===== 所持金・ランク・ライフ表示 =====
function updateMoneyDisplay() {
    const moneyEl = document.getElementById('moneyDisplay');
    const rankEl = document.getElementById('rankDisplay');

    if (moneyEl) {
        moneyEl.textContent = `💰 ${gameSystem.getMoney()}`;
    }
    if (rankEl) {
        const rank = gameSystem.getRank();
        rankEl.textContent = `${rank.icon} ${rank.name}`;
    }

    updateLifeDisplay();
}

function updateLifeDisplay() {
    if (!gameSystem.isLifeSystemEnabled()) {
        // 全てのライフ表示を非表示
        ['lifeDisplay', 'matchmakeLifeDisplay', 'playLifeDisplay', 'resultLifeDisplay'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        return;
    }

    const lives = gameSystem.getLives();
    const maxLives = gameSystem.getMaxLives();

    // ヘッダーのライフ表示
    const lifeEl = document.getElementById('lifeDisplay');
    if (lifeEl) {
        lifeEl.classList.remove('hidden');
        lifeEl.innerHTML = renderLifeHearts(lives, maxLives);
    }

    // マッチメイク画面
    const matchmakeLifeEl = document.getElementById('matchmakeLifeDisplay');
    if (matchmakeLifeEl) {
        matchmakeLifeEl.innerHTML = renderLifeHearts(lives, maxLives);
    }

    // プレイ画面
    const playLifeEl = document.getElementById('playLifeDisplay');
    if (playLifeEl) {
        playLifeEl.innerHTML = renderLifeHearts(lives, maxLives);
    }

    // リザルト画面
    const resultLifeEl = document.getElementById('resultLifeDisplay');
    if (resultLifeEl) {
        resultLifeEl.innerHTML = renderLifeHearts(lives, maxLives);
    }
}

function renderLifeHearts(lives, maxLives) {
    let html = '';
    for (let i = 0; i < maxLives; i++) {
        const isFilled = i < lives;
        html += `<span class="life-heart ${isFilled ? '' : 'empty'}">❤️</span>`;
    }
    return html;
}

// リザルト画面でライフ減少アニメーション
function showLifeLossAnimation() {
    const resultLifeEl = document.getElementById('resultLifeDisplay');
    if (!resultLifeEl || !gameSystem.isLifeSystemEnabled()) return;

    const lives = gameSystem.getLives();
    const maxLives = gameSystem.getMaxLives();
    const lostIndex = lives; // 失ったライフのインデックス（0始まりなのでlives番目が減った）

    let html = '';
    for (let i = 0; i < maxLives; i++) {
        const isFilled = i < lives;
        const isLosing = i === lostIndex;
        html += `<span class="life-heart ${isFilled ? '' : 'empty'} ${isLosing ? 'losing' : ''}">❤️</span>`;
    }
    resultLifeEl.innerHTML = html;
}

// ===== 設定モーダル =====
function openSettings() {
    elements.autoPassToggle.checked = gameSystem.isAutoPassEnabled();
    elements.settingsModal.classList.remove('hidden');
}

function closeSettings() {
    elements.settingsModal.classList.add('hidden');
}

// ===== 通知モーダル =====
function showNotify(title, message) {
    elements.notifyTitle.textContent = title;
    elements.notifyMessage.textContent = message;
    elements.notifyModal.classList.remove('hidden');
}

// ===== テストモード =====
function showTestSelectScreen() {
    showScreen('testSelect');
    renderTestJokerList();
}

function renderTestJokerList() {
    elements.testJokerList.innerHTML = '';

    const allTypes = getShopJokerTypes();

    allTypes.forEach(type => {
        const joker = new Joker(type);
        const item = document.createElement('div');
        item.className = `test-joker-item ${joker.isPassive() ? 'passive' : 'active'}`;
        item.innerHTML = `
            <span class="joker-icon">${joker.getIcon()}</span>
            <span class="joker-name">${joker.getName()}</span>
            <span class="joker-category">${joker.isPassive() ? 'パッシブ' : 'アクティブ'}</span>
            <span class="joker-rarity" style="color: ${joker.getRarity().color}">${joker.getRarity().name}</span>
        `;
        item.addEventListener('click', () => startTestMode(type));
        elements.testJokerList.appendChild(item);
    });
}

function startTestMode(jokerType) {
    isTestMode = true;
    testModeJokers = [new Joker(jokerType)];
    startBattle();
}

// ===== マッチメイク画面 =====
function updateMatchmakeScreen() {
    const ownedJokers = gameSystem.getOwnedJokers();
    const playableJokers = ownedJokers.filter(j => j.type !== JOKER_TYPES.DOGEZA && !j.isSpecial());

    elements.jokerInfo.textContent = playableJokers.length > 0
        ? `ジョーカー: ${playableJokers.length}枚 (${playableJokers.map(j => j.getName()).join(', ')})`
        : 'ジョーカー: なし';
}

// ===== 対戦開始 =====
function startBattle() {
    showScreen('play');

    game = new Game();
    ai = new AI(game);
    selectedCards = [];
    selectedJoker = null;
    usedJokerInGame = false;
    usedDrawJokerInGame = false;
    usedBonusTrumpsCount = 0;
    lastPlayedCards = [];
    previousMoneyForRankCheck = gameSystem.getMoney();

    // ジョーカー設定
    let playerJokers;
    if (isTestMode) {
        playerJokers = testModeJokers;
    } else {
        playerJokers = gameSystem.getOwnedJokers().filter(j => j.type !== JOKER_TYPES.DOGEZA && !j.isSpecial());
    }

    // AIジョーカー（ランクに応じた数）
    const rank = gameSystem.getRank();
    const aiJokerCount = AIShop.getAIJokerCount(rank);
    aiJokersForBattle = AIShop.selectByRank(rank, aiJokerCount);

    const result = game.start();
    game.setJokers(playerJokers, aiJokersForBattle);

    // パッシブジョーカーを発動
    activatePassives();

    if (result.needsSelection) {
        showFirstPlayerSelection(result.selectionCards);
    } else {
        elements.firstPlayerSelection.classList.add('hidden');
        updatePlayUI();

        if (game.currentPlayer === PLAYER.AI) {
            setTimeout(() => aiTurn(), 1000);
        }
    }
}

function activatePassives() {
    const state = game.getState();

    // プレイヤーのパッシブを発動
    state.humanJokers.filter(j => j.isPassive()).forEach(j => {
        game.jokerManager.activatePassive(PLAYER.HUMAN, j);
    });

    // AIのパッシブを発動
    state.aiJokers.filter(j => j.isPassive()).forEach(j => {
        game.jokerManager.activatePassive(PLAYER.AI, j);
    });
}

// ===== 先攻決めUI =====
function showFirstPlayerSelection(cards) {
    elements.firstPlayerSelection.classList.remove('hidden');
    elements.firstPlayerCards.innerHTML = '';

    cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card card-back';
        cardEl.addEventListener('click', () => selectFirstPlayerCard(index));
        elements.firstPlayerCards.appendChild(cardEl);
    });

    updatePlayUI();
}

function selectFirstPlayerCard(index) {
    const result = game.selectFirstPlayer(index);

    if (result.success) {
        elements.firstPlayerCards.innerHTML = '';

        const playerCardEl = createCardElement(result.playerCard);
        playerCardEl.style.border = '3px solid var(--accent-cyan)';

        const aiCardEl = createCardElement(result.aiCard);
        aiCardEl.style.border = '3px solid var(--accent-pink)';

        elements.firstPlayerCards.appendChild(index === 0 ? playerCardEl : aiCardEl);
        elements.firstPlayerCards.appendChild(index === 0 ? aiCardEl : playerCardEl);

        setTimeout(() => {
            elements.firstPlayerSelection.classList.add('hidden');
            updatePlayUI();

            if (game.currentPlayer === PLAYER.AI) {
                setTimeout(() => aiTurn(), 1000);
            }
        }, 2000);
    }
}

// ===== プレイ画面UI更新 =====
function updatePlayUI() {
    renderAIHand();
    renderPlayerHand();
    renderField();
    renderJokers();
    updateStatusBar();
    updateButtons();
    updateMessage();
    updateMoneyDisplay();
}

function renderAIHand() {
    const state = game.getState();
    elements.aiHand.innerHTML = '';

    for (let i = 0; i < state.aiHandCount; i++) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card card-back';
        cardEl.style.marginLeft = i > 0 ? '-15px' : '0';
        elements.aiHand.appendChild(cardEl);
    }

    elements.aiCardCount.textContent = `${state.aiHandCount}枚`;
}

function renderPlayerHand() {
    const state = game.getState();
    elements.playerHand.innerHTML = '';

    state.humanHand.forEach((card) => {
        const cardEl = createCardElement(card);
        const isSelected = selectedCards.some(c => c.id === card.id);

        if (isSelected) {
            cardEl.classList.add('selected');
        }

        if (state.currentPlayer !== PLAYER.HUMAN || state.needsFirstPlayerSelection) {
            cardEl.classList.add('disabled');
        } else {
            cardEl.addEventListener('click', () => toggleCardSelection(card));
        }

        elements.playerHand.appendChild(cardEl);
    });

    elements.playerCardCount.textContent = `${state.humanHand.length}枚`;
}

function createCardElement(card, animate = false) {
    const cardEl = document.createElement('div');
    cardEl.className = `card card-front ${card.isRed() ? 'red' : ''}`;

    if (animate) {
        cardEl.classList.add('card-animate-in');
    }

    cardEl.innerHTML = `
        <span class="card-suit">${card.suit}</span>
        <span class="card-rank">${RANK_DISPLAY[card.rank]}</span>
    `;

    cardEl.dataset.cardId = card.id;
    return cardEl;
}

function renderField() {
    const state = game.getState();
    elements.field.innerHTML = '';

    if (state.field.length === 0) {
        elements.field.innerHTML = '<div class="field-empty">カードなし</div>';
    } else {
        state.field.forEach(card => {
            const cardEl = createCardElement(card, true);
            elements.field.appendChild(cardEl);
        });
    }

    elements.fieldRevolutionBadge.classList.toggle('hidden', !state.isRevolution);
    const hasShibari = state.activeEffects.shibari || state.activeEffects.gekishiba;
    elements.fieldShibariBadge.classList.toggle('hidden', !hasShibari);
    if (hasShibari) {
        const effect = state.activeEffects.gekishiba || state.activeEffects.shibari;
        elements.fieldShibariBadge.textContent = state.activeEffects.gekishiba
            ? `⛓️激しば ${effect.suits.join('')}`
            : `🔗縛り ${effect.suits.join('')}`;
    }
}

function renderJokers() {
    const state = game.getState();

    // AIジョーカー（裏向き）
    elements.aiJokers.innerHTML = '';
    const aiActiveJokers = state.aiJokers.filter(j => !j.isPassive());
    const aiPassiveCount = state.aiJokers.filter(j => j.isPassive()).length;

    for (let i = 0; i < aiActiveJokers.length; i++) {
        const jokerEl = document.createElement('div');
        jokerEl.className = 'joker-card back';
        elements.aiJokers.appendChild(jokerEl);
    }

    if (aiPassiveCount > 0) {
        const passiveLabel = document.createElement('span');
        passiveLabel.className = 'passive-count';
        passiveLabel.textContent = `パッシブ×${aiPassiveCount}`;
        elements.aiJokers.appendChild(passiveLabel);
    }

    // プレイヤージョーカー（全て表示）
    elements.playerJokers.innerHTML = '';

    // アクティブジョーカー
    const activeJokers = state.humanJokers.filter(j => !j.isPassive() && j.type !== JOKER_TYPES.DOGEZA);
    activeJokers.forEach(joker => {
        const jokerEl = document.createElement('div');
        jokerEl.className = `joker-card front ${selectedJoker && selectedJoker.id === joker.id ? 'selected' : ''}`;
        jokerEl.style.borderColor = joker.getRarity().color;
        jokerEl.innerHTML = `
            <span class="joker-icon">${joker.getIcon()}</span>
            <span class="joker-name">${joker.getName()}</span>
        `;

        if (state.currentPlayer === PLAYER.HUMAN && !joker.locked) {
            jokerEl.addEventListener('click', () => toggleJokerSelection(joker));
        }
        elements.playerJokers.appendChild(jokerEl);
    });

    // パッシブジョーカー（発動中）
    const passives = game.jokerManager.getPassives(PLAYER.HUMAN);
    passives.forEach(joker => {
        const jokerEl = document.createElement('div');
        jokerEl.className = 'joker-card front passive-active';
        jokerEl.style.borderColor = joker.getRarity().color;
        jokerEl.innerHTML = `
            <span class="joker-icon">${joker.getIcon()}</span>
            <span class="joker-name">${joker.getName()}</span>
            <span class="passive-label">発動中</span>
        `;
        elements.playerJokers.appendChild(jokerEl);
    });
}

function updateStatusBar() {
    const state = game.getState();

    elements.revolutionStatus.classList.toggle('hidden', !state.isRevolution);
    elements.backStatus.classList.toggle('hidden', !state.isBackActive);

    const hasShibari = state.activeEffects.shibari || state.activeEffects.gekishiba;
    elements.shibariStatus.classList.toggle('hidden', !hasShibari);
    if (hasShibari) {
        const effect = state.activeEffects.gekishiba || state.activeEffects.shibari;
        elements.shibariStatus.textContent = state.activeEffects.gekishiba
            ? `⛓️ 激しば ${effect.suits.join('')}`
            : `🔗 縛り ${effect.suits.join('')}`;
    }

    if (elements.playerRevolutionBadge) {
        elements.playerRevolutionBadge.classList.toggle('hidden', !state.isRevolution);
    }
    if (elements.playerShibariBadge) {
        elements.playerShibariBadge.classList.toggle('hidden', !hasShibari);
    }

    if (state.currentPlayer === PLAYER.HUMAN) {
        elements.turnIndicator.textContent = 'あなたのターン';
        elements.turnIndicator.classList.add('your-turn');
    } else {
        elements.turnIndicator.textContent = 'AIのターン';
        elements.turnIndicator.classList.remove('your-turn');
    }
}

function updateButtons() {
    const state = game.getState();
    const isPlayerTurn = state.currentPlayer === PLAYER.HUMAN && !state.gameOver && !state.needsFirstPlayerSelection;

    elements.passBtn.disabled = !isPlayerTurn || state.field.length === 0;

    if (!isPlayerTurn) {
        elements.playBtn.disabled = true;
        return;
    }

    if (selectedCards.length === 0 && selectedJoker && selectedJoker.type === JOKER_TYPES.DECOY) {
        elements.playBtn.disabled = false;
        return;
    }

    if (selectedCards.length === 0) {
        elements.playBtn.disabled = true;
        return;
    }

    const hasDecoy = selectedJoker && selectedJoker.type === JOKER_TYPES.DECOY;
    const validation = game.canPlay(selectedCards, selectedJoker, hasDecoy);
    elements.playBtn.disabled = !validation.valid;
}

function updateMessage() {
    const state = game.getState();
    elements.gameMessage.textContent = state.message;

    if (selectedCards.length > 0 || (selectedJoker && selectedJoker.type === JOKER_TYPES.DECOY)) {
        const hasDecoy = selectedJoker && selectedJoker.type === JOKER_TYPES.DECOY;
        const handInfo = game.analyzeHand(selectedCards, hasDecoy);
        const validation = game.canPlay(selectedCards, selectedJoker, hasDecoy);

        if (handInfo.type === HAND_TYPES.INVALID && !hasDecoy) {
            elements.validationMessage.textContent = '無効な組み合わせです';
            elements.validationMessage.className = 'validation-message error';
        } else if (!validation.valid) {
            elements.validationMessage.textContent = validation.reason;
            elements.validationMessage.className = 'validation-message error';
        } else {
            let msg = hasDecoy && selectedCards.length === 0
                ? 'デコイ単体'
                : HAND_TYPE_NAMES[handInfo.type];
            if (selectedJoker) {
                msg += ` + ${selectedJoker.getName()}`;
            }
            elements.validationMessage.textContent = `${msg}で出せます`;
            elements.validationMessage.className = 'validation-message success';
        }
    } else {
        elements.validationMessage.textContent = '';
    }
}

// ===== カード・ジョーカー選択 =====
function toggleCardSelection(card) {
    const index = selectedCards.findIndex(c => c.id === card.id);

    if (index >= 0) {
        selectedCards.splice(index, 1);
    } else {
        selectedCards.push(card);
    }

    renderPlayerHand();
    renderJokers();
    updateButtons();
    updateMessage();
}

function toggleJokerSelection(joker) {
    if (selectedJoker && selectedJoker.id === joker.id) {
        selectedJoker = null;
    } else {
        selectedJoker = joker;
    }

    renderJokers();
    updateButtons();
    updateMessage();
}

// ===== カードを出す =====
function playSelectedCards() {
    const hasDecoy = selectedJoker && selectedJoker.type === JOKER_TYPES.DECOY;

    if (selectedCards.length === 0 && !hasDecoy) return;

    if (selectedJoker && selectedJoker.type === JOKER_TYPES.BOMBER) {
        showBomberModal();
        return;
    }

    executePlay();
}

function executePlay(jokerParams = {}) {
    const hasDecoy = selectedJoker && selectedJoker.type === JOKER_TYPES.DECOY;

    if (selectedJoker) {
        usedJokerInGame = true;
        // ドロージョーカー使用追跡
        if (selectedJoker.type === JOKER_TYPES.DRAW) {
            usedDrawJokerInGame = true;
        }
    }

    // ボーナストランプ使用追跡
    selectedCards.forEach(card => {
        if (card.isBonus) {
            usedBonusTrumpsCount++;
        }
    });

    lastPlayedCards = [...selectedCards];

    const result = game.playCards(PLAYER.HUMAN, selectedCards, selectedJoker, jokerParams);

    if (result.success) {
        // 特殊効果の処理
        if (result.jokerEffect) {
            if (result.jokerEffect.peek) {
                showPeekModal();
            }
            if (result.pendingAction && result.pendingAction.type === 'destroy') {
                showDestroyModal(result.pendingAction.count);
                return;
            }
        }

        if (result.pendingAction) {
            showJokerActionModal(result.pendingAction);
            return;
        }

        if (result.jokerEffect && result.jokerEffect.delayedClearField) {
            selectedCards = [];
            selectedJoker = null;
            updatePlayUI();

            setTimeout(() => {
                game.clearField();
                game.currentPlayer = PLAYER.HUMAN;
                updatePlayUI();
            }, 1000);
            return;
        }

        selectedCards = [];
        selectedJoker = null;
        updatePlayUI();

        if (result.gameOver) {
            setTimeout(() => handleGameEnd(), 1000);
        } else {
            setTimeout(() => aiTurn(), 1000);
        }
    }
}

// ===== パス =====
function playerPass() {
    game.pass(PLAYER.HUMAN);
    selectedCards = [];
    selectedJoker = null;
    updatePlayUI();

    setTimeout(() => aiTurn(), 1000);
}

// ===== オートパスチェック =====
function checkAutoPass() {
    if (!gameSystem.isAutoPassEnabled()) return false;

    const state = game.getState();
    if (state.field.length === 0) return false;

    for (const card of state.humanHand) {
        if (game.canPlay([card], null, false).valid) {
            return false;
        }
    }

    return true;
}

// ===== AIターン =====
function aiTurn() {
    if (game.gameOver) return;

    // フリーズチェック
    if (game.jokerManager.activeEffects.freeze[PLAYER.AI]) {
        game.jokerManager.activeEffects.freeze[PLAYER.AI] = false;
        game.message = 'AIはフリーズで行動不能！';
        updatePlayUI();
        return;
    }

    const decision = ai.takeTurn();

    if (decision.action === 'pass') {
        game.pass(PLAYER.AI);
        game.message = 'AIがパスしました。場を流します。';
        updatePlayUI();

        if (checkAutoPass()) {
            setTimeout(() => {
                game.message = 'オートパス：出せるカードがありません';
                playerPass();
            }, 1000);
        }
        return;
    }

    const result = game.playCards(PLAYER.AI, decision.cards, decision.joker, decision.jokerParams);

    if (result.success) {
        const hasDecoy = decision.joker && decision.joker.type === JOKER_TYPES.DECOY;
        const handInfo = game.analyzeHand(decision.cards, hasDecoy);
        const typeName = HAND_TYPE_NAMES[handInfo.type] || '';
        const cardNames = decision.cards.map(c => c.getDisplayName()).join(' ');

        let msg = `AIが${typeName}（${cardNames}）を出しました`;
        if (decision.joker) {
            msg += ` [${decision.joker.getName()}使用]`;
        }
        if (!game.message.includes('革命')) {
            game.message = msg;
        }

        if (result.pendingAction) {
            handleAIPendingAction(result.pendingAction);
        }

        if (result.jokerEffect && result.jokerEffect.delayedClearField) {
            updatePlayUI();
            setTimeout(() => {
                game.clearField();
                game.currentPlayer = PLAYER.AI;
                updatePlayUI();
                if (!game.gameOver) {
                    setTimeout(() => aiTurn(), 1000);
                }
            }, 1000);
            return;
        }

        updatePlayUI();

        if (result.gameOver) {
            setTimeout(() => handleGameEnd(), 1000);
        } else {
            if (checkAutoPass()) {
                setTimeout(() => {
                    game.message = 'オートパス：出せるカードがありません';
                    playerPass();
                }, 1000);
            }
        }
    }
}

function handleAIPendingAction(action) {
    if (action.type === 'give') {
        const cardIds = ai.selectCardsToGive(action.count);
        game.jokerManager.executeGive(PLAYER.AI, cardIds);
        game.message += ` AIが${action.count}枚渡しました`;
    } else if (action.type === 'discard') {
        const cardIds = ai.selectCardsToDiscard(action.count);
        game.jokerManager.executeDiscard(PLAYER.AI, cardIds);
        game.message += ` AIが${action.count}枚捨てました`;
    } else if (action.type === 'destroy') {
        // AIが破壊ジョーカーを使用した場合
        const targetJokers = game.jokerManager.getJokers(PLAYER.HUMAN);
        const targetPassives = game.jokerManager.getPassives(PLAYER.HUMAN);
        const allTargets = [...targetJokers, ...targetPassives];
        const toDestroy = allTargets.slice(0, action.count).map(j => j.id);
        game.jokerManager.executeDestroy(PLAYER.HUMAN, toDestroy);
        game.message += ` AIがジョーカーを${toDestroy.length}枚破壊！`;
    }
}

// ===== ゲーム終了処理 =====
function handleGameEnd() {
    const state = game.getState();

    // 使用済みジョーカーをシステムから削除
    if (!isTestMode) {
        const usedIds = game.jokerManager.getUsedJokerIds();
        gameSystem.removeUsedJokers(usedIds);
    }

    if (state.winner === PLAYER.AI && gameSystem.hasDogeza() && !isTestMode) {
        showDogezaModal();
        return;
    }

    showResult(true);
}

// ===== 覗き見モーダル =====
function showPeekModal() {
    const aiHand = game.getState().aiHand;
    elements.peekCards.innerHTML = '';

    aiHand.forEach(card => {
        const cardEl = createCardElement(card);
        elements.peekCards.appendChild(cardEl);
    });

    elements.peekModal.classList.remove('hidden');

    let countdown = 3;
    elements.peekCountdown.textContent = countdown;

    const timer = setInterval(() => {
        countdown--;
        elements.peekCountdown.textContent = countdown;
        if (countdown <= 0) {
            clearInterval(timer);
            elements.peekModal.classList.add('hidden');
        }
    }, 1000);
}

// ===== 破壊ジョーカーモーダル =====
function showDestroyModal(count) {
    const targetJokers = game.jokerManager.getJokers(PLAYER.AI);
    const targetPassives = game.jokerManager.getPassives(PLAYER.AI);
    const allTargets = [...targetJokers, ...targetPassives];

    destroyTargets = [];
    elements.destroyMessage.textContent = `破壊する相手のジョーカーを${count}枚選択`;
    elements.destroyTargets.innerHTML = '';

    allTargets.forEach(joker => {
        const jokerEl = document.createElement('div');
        jokerEl.className = 'destroy-target-item';
        jokerEl.innerHTML = `
            <span class="joker-icon">${joker.getIcon()}</span>
            <span class="joker-name">${joker.getName()}</span>
        `;
        jokerEl.addEventListener('click', () => {
            const idx = destroyTargets.findIndex(id => id === joker.id);
            if (idx >= 0) {
                destroyTargets.splice(idx, 1);
                jokerEl.classList.remove('selected');
            } else if (destroyTargets.length < count) {
                destroyTargets.push(joker.id);
                jokerEl.classList.add('selected');
            }
            elements.destroyConfirm.disabled = destroyTargets.length !== count;
        });
        elements.destroyTargets.appendChild(jokerEl);
    });

    elements.destroyConfirm.disabled = true;
    elements.destroyModal.classList.remove('hidden');
}

function confirmDestroy() {
    game.jokerManager.executeDestroy(PLAYER.AI, destroyTargets);
    elements.destroyModal.classList.add('hidden');

    selectedCards = [];
    selectedJoker = null;
    updatePlayUI();

    if (game.checkWinner()) {
        setTimeout(() => handleGameEnd(), 1000);
    } else {
        setTimeout(() => aiTurn(), 1000);
    }
}

// ===== 土下座モーダル =====
function showDogezaModal() {
    elements.dogezaModal.classList.remove('hidden');
}

function closeDogezaModal() {
    elements.dogezaModal.classList.add('hidden');
}

function executeDogeza() {
    closeDogezaModal();

    const dogeza = gameSystem.getOwnedJokers().find(j => j.type === JOKER_TYPES.DOGEZA);
    if (dogeza) {
        gameSystem.removeJoker(dogeza.id);
    }

    game.gameOver = false;
    game.winner = null;

    const deck = shuffleDeck(createDeck());
    game.humanHand = sortHand(deck.slice(0, 2));
    game.aiHand = sortHand(deck.slice(2, 4));
    game.remainingDeck = deck.slice(4);
    game.field = [];
    game.fieldType = null;

    game.needsFirstPlayerSelection = true;
    game.firstPlayerCards = [
        game.remainingDeck[0],
        game.remainingDeck[1]
    ];
    game.message = '土下座発動！再戦します。カードを選んで先攻を決めてください';

    showFirstPlayerSelection(game.firstPlayerCards);
    updatePlayUI();
}

// ===== ジョーカーアクションモーダル =====
function showJokerActionModal(action) {
    elements.jokerActionModal.classList.remove('hidden');

    const state = game.getState();
    let title = '';
    let message = '';

    if (action.type === 'give') {
        title = '渡し';
        message = `${action.count}枚を相手に渡すカードを選んでください`;
    } else if (action.type === 'discard') {
        title = '捨て';
        message = `${action.count}枚を捨てるカードを選んでください`;
    }

    elements.jokerModalTitle.textContent = title;
    elements.jokerModalMessage.textContent = message;

    elements.jokerModalContent.innerHTML = '';
    const handDiv = document.createElement('div');
    handDiv.className = 'hand';

    window.jokerActionCards = [];
    window.jokerActionRequired = action.count;
    window.jokerActionType = action.type;

    state.humanHand.forEach(card => {
        const cardEl = createCardElement(card);
        cardEl.addEventListener('click', () => {
            const idx = window.jokerActionCards.findIndex(c => c.id === card.id);
            if (idx >= 0) {
                window.jokerActionCards.splice(idx, 1);
                cardEl.classList.remove('selected');
            } else if (window.jokerActionCards.length < action.count) {
                window.jokerActionCards.push(card);
                cardEl.classList.add('selected');
            }
        });
        handDiv.appendChild(cardEl);
    });

    elements.jokerModalContent.appendChild(handDiv);
}

function confirmJokerAction() {
    if (window.jokerActionCards.length !== window.jokerActionRequired) {
        return;
    }

    const cardIds = window.jokerActionCards.map(c => c.id);

    if (window.jokerActionType === 'give') {
        game.jokerManager.executeGive(PLAYER.HUMAN, cardIds);
    } else if (window.jokerActionType === 'discard') {
        game.jokerManager.executeDiscard(PLAYER.HUMAN, cardIds);
    }

    elements.jokerActionModal.classList.add('hidden');
    selectedCards = [];
    selectedJoker = null;
    updatePlayUI();

    if (game.checkWinner()) {
        setTimeout(() => handleGameEnd(), 1000);
    } else {
        setTimeout(() => aiTurn(), 1000);
    }
}

// ===== ボンバーモーダル =====
function showBomberModal() {
    elements.bomberModal.classList.remove('hidden');
    elements.bomberRankSelect.innerHTML = '';

    const ranks = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    ranks.forEach(rank => {
        const btn = document.createElement('button');
        btn.className = 'bomber-rank-btn';
        btn.textContent = RANK_DISPLAY[rank];
        btn.addEventListener('click', () => {
            elements.bomberModal.classList.add('hidden');
            executePlay({ rank: rank });
        });
        elements.bomberRankSelect.appendChild(btn);
    });
}

// ===== リザルト画面 =====
function showResult(applyReward = true) {
    const state = game.getState();
    const playerHistory = game.getPlayerHandHistory();
    const passives = game.jokerManager.getPassives(PLAYER.HUMAN);

    // 最後に出したカード（ペナルティ判定用）
    const finishCard = lastPlayedCards.length > 0 ? lastPlayedCards[lastPlayedCards.length - 1] : null;

    // 報酬・ペナルティを先に計算
    let reward = null;
    let penalty = 0;

    if (state.winner === PLAYER.HUMAN) {
        reward = gameSystem.calculateReward(
            playerHistory,
            usedJokerInGame,
            finishCard,
            state.isRevolution,
            passives,
            {
                usedDrawJoker: usedDrawJokerInGame,
                usedBonusTrumps: usedBonusTrumpsCount,
                initialColorBonus: game.initialColorBonus
            }
        );

        if (applyReward && !isTestMode) {
            gameSystem.addMoney(reward.totalReward);
            gameSystem.recordWin();
        }
    } else {
        penalty = applyReward && !isTestMode ? gameSystem.calculatePenalty(passives) : 0;

        if (applyReward && !isTestMode) {
            gameSystem.subtractMoney(penalty);
            gameSystem.recordLoss();
        }
    }

    // リザルト画面を表示してからランク変動チェック
    showResultContent(state, playerHistory, reward, penalty, passives);

    // ランク変動チェックと演出（リザルト画面表示後に実行）
    if (applyReward && !isTestMode) {
        const previousRank = gameSystem.getPreviousRank(previousMoneyForRankCheck);
        const currentRank = gameSystem.getRank();

        if (previousRank.id !== currentRank.id) {
            const isRankUp = RANK_ORDER.indexOf(currentRank) > RANK_ORDER.indexOf(previousRank);
            // 少し遅延してから表示
            setTimeout(() => {
                showRankChangeModal(previousRank, currentRank, isRankUp, () => { });
            }, 1500);
        }
    }
}

function showResultContent(state, playerHistory, reward, penalty, passives) {
    showScreen('result');

    if (state.winner === PLAYER.HUMAN) {
        elements.resultIcon.textContent = '🎉';
        elements.resultTitle.textContent = 'あなたの勝利！';
        elements.resultMessage.textContent = 'おめでとうございます！';

        elements.rewardSection.className = 'reward-section';
        elements.rewardSection.querySelector('h3').textContent = '報酬';
        renderRewardBreakdown(reward.breakdown);

        elements.rewardTotal.innerHTML = `
            <span>合計報酬</span>
            <span class="amount">+${reward.totalReward}</span>
        `;

        if (!isTestMode) {
            const discardResult = gameSystem.checkDogezaDiscard(previousMoneyForRankCheck);
            if (discardResult) {
                setTimeout(() => showDogezaDiscardModal(discardResult.message), 500);
            }
        }

    } else {
        elements.resultIcon.textContent = '😢';
        elements.resultTitle.textContent = 'AIの勝利';
        elements.resultMessage.textContent = '次は勝てるよう頑張りましょう！';

        elements.rewardSection.className = 'reward-section penalty-section';
        elements.rewardSection.querySelector('h3').textContent = 'ペナルティ';
        elements.rewardBreakdown.innerHTML = '<div class="reward-item"><span>所持金没収（半分）</span></div>';
        elements.rewardTotal.innerHTML = `
            <span>没収額</span>
            <span class="amount" style="color: var(--error);">-${penalty}</span>
        `;

        // ライフ制でのライフ減少処理
        if (!isTestMode && gameSystem.isLifeSystemEnabled()) {
            // アニメーション前にライフ表示（減る前の状態）
            showLifeLossAnimation();

            const isGameOver = gameSystem.loseLife();

            // 少し遅延してからライフ表示更新
            setTimeout(() => updateLifeDisplay(), 800);

            if (isGameOver) {
                // ゲームオーバー処理はこの後別途表示
                setTimeout(() => showGameOverModal(), 1500);
            }
        }
    }

    // 役履歴表示
    elements.handHistoryList.innerHTML = '';

    if (playerHistory.length === 0) {
        elements.handHistoryList.innerHTML = '<li>役なし</li>';
    } else {
        playerHistory.forEach(h => {
            const mult = HAND_MULTIPLIERS[h.handType];
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="hand-type">${h.handTypeName}</span>: 
                <span class="hand-cards">${h.cards.join(' ')}</span>
                ${mult > 0 ? `<span class="hand-multiplier" style="color: var(--accent-cyan);">×${mult}</span>` : ''}
                ${h.joker ? `<span class="hand-joker">+ ${h.joker}</span>` : ''}
            `;
            elements.handHistoryList.appendChild(li);
        });
    }

    // 所持金表示とアニメーション
    const resultMoneyEl = document.getElementById('resultMoneyAmount');
    if (resultMoneyEl) {
        const finalMoney = gameSystem.getMoney();
        const startMoney = state.winner === PLAYER.HUMAN
            ? finalMoney - reward.totalReward
            : finalMoney + penalty;

        // アニメーションで所持金を加算/減算表示
        let currentDisplay = startMoney;
        resultMoneyEl.textContent = `💰 ${currentDisplay}`;

        const steps = 20;
        const diff = finalMoney - startMoney;
        const stepValue = diff / steps;
        let step = 0;

        const animInterval = setInterval(() => {
            step++;
            currentDisplay = Math.round(startMoney + stepValue * step);
            resultMoneyEl.textContent = `💰 ${currentDisplay}`;
            resultMoneyEl.classList.add('animating');

            if (step >= steps) {
                clearInterval(animInterval);
                resultMoneyEl.textContent = `💰 ${finalMoney}`;
                setTimeout(() => resultMoneyEl.classList.remove('animating'), 300);
            }
        }, 50);
    }

    updateMoneyDisplay();
}

function renderRewardBreakdown(breakdown) {
    elements.rewardBreakdown.innerHTML = '';

    breakdown.forEach(item => {
        const div = document.createElement('div');
        div.className = `reward-item ${item.type}`;

        let multiplierClass = '';
        let prefix = '+';
        if (item.type === 'penalty') {
            multiplierClass = 'penalty';
            prefix = '';
        } else if (item.type === 'passive') {
            multiplierClass = 'passive';
        }

        div.innerHTML = `
            <span>${item.name}</span>
            <span class="multiplier ${multiplierClass}">${prefix}${item.multiplier}</span>
        `;
        elements.rewardBreakdown.appendChild(div);
    });
}

function showDogezaDiscardModal(message) {
    elements.dogezaDiscardMessage.textContent = message;
    elements.dogezaDiscardModal.classList.remove('hidden');
}

function closeDogezaDiscardModal() {
    elements.dogezaDiscardModal.classList.add('hidden');
}

function onNextFromResult() {
    if (isTestMode) {
        isTestMode = false;
        showScreen('title');
        return;
    }

    const state = game.getState();

    if (state.winner === PLAYER.HUMAN) {
        showShop();
    } else {
        showScreen('matchmake');
        updateMatchmakeScreen();
    }
}

// ===== ショップ画面 =====
function showShop() {
    showScreen('shop');

    shop = new Shop();
    shop.setPassives(game.jokerManager.getPassives(PLAYER.HUMAN));
    shop.generateLineup();
    shop.addDogezaIfEligible();

    // ライフ購入フラグリセット
    lifePurchasedThisShop = false;

    renderOwnedJokers();
    renderShopLineup();
    renderShopLifeSection();
    updateSelectedJokers();
    updateRerollButton();
    updateMoneyDisplay();
}

function renderOwnedJokers() {
    const ownedJokers = gameSystem.getOwnedJokers();
    elements.ownedJokerCount.textContent = `(${ownedJokers.length}/5)`;
    elements.ownedJokers.innerHTML = '';

    if (ownedJokers.length === 0) {
        elements.ownedJokers.innerHTML = '<span class="no-owned-jokers">なし</span>';
        return;
    }

    ownedJokers.forEach(joker => {
        const jokerEl = document.createElement('div');
        jokerEl.className = `owned-joker-item ${joker.isPassive() ? 'passive' : ''}`;
        jokerEl.style.borderColor = joker.getRarity().color;
        jokerEl.innerHTML = `
            <span class="joker-icon">${joker.getIcon()}</span>
            <span class="joker-name">${joker.getName()}</span>
        `;
        jokerEl.addEventListener('click', () => showSellJokerModal(joker));
        elements.ownedJokers.appendChild(jokerEl);
    });
}

function renderShopLineup() {
    elements.shopLineup.innerHTML = '';

    shop.lineup.forEach((item, index) => {
        // 購入済みのアイテムは表示しない
        if (item.purchased) return;

        const itemEl = document.createElement('div');

        // パックかジョーカーかで表示を分岐
        if (item.isPack) {
            itemEl.className = 'shop-item pack-item';
            itemEl.style.borderColor = '#ffd700';  // ゴールド
            itemEl.innerHTML = `
                <span class="joker-icon">${item.icon}</span>
                <div class="joker-name">${item.name}</div>
                <div class="joker-rarity" style="color: #ffd700">パック</div>
                <div class="joker-price">💰${item.price}</div>
                <div class="joker-desc">${item.description}</div>
                <div class="joker-category">ボーナス</div>
            `;

            itemEl.addEventListener('click', () => {
                // パック購入処理
                if (gameSystem.getMoney() < item.price) {
                    showNotify('お金不足', 'お金が足りません');
                    return;
                }
                gameSystem.subtractMoney(item.price);
                item.purchased = true;
                renderShopLineup();
                updateMoneyDisplay();
                // パック開封モーダルを表示
                showBonusPackModal();
            });
        } else {
            itemEl.className = 'shop-item';
            const isDogeza = item.joker.type === JOKER_TYPES.DOGEZA;
            const rarity = item.joker.getRarity();

            itemEl.style.borderColor = rarity.color;
            itemEl.innerHTML = `
                <span class="joker-icon">${item.joker.getIcon()}</span>
                <div class="joker-name">${item.joker.getName()}</div>
                <div class="joker-rarity" style="color: ${rarity.color}">${rarity.name}</div>
                <div class="joker-price">${isDogeza ? '無料' : `💰${item.price}`}</div>
                <div class="joker-desc">${item.joker.getDescription()}</div>
                <div class="joker-category">${item.joker.isPassive() ? 'パッシブ' : 'アクティブ'}</div>
            `;

            itemEl.addEventListener('click', () => {
                // 購入確認モーダルを表示
                showPurchaseConfirmModal(index);
            });
        }

        elements.shopLineup.appendChild(itemEl);
    });
}

function updateSelectedJokers() {
    const purchased = shop.purchasedJokers;

    if (purchased.length === 0) {
        elements.selectedJokers.innerHTML = '<span class="no-selection">なし</span>';
    } else {
        elements.selectedJokers.innerHTML = '';
        purchased.forEach(joker => {
            const jokerEl = document.createElement('div');
            jokerEl.className = 'joker-card front';
            jokerEl.style.borderColor = joker.getRarity().color;
            jokerEl.innerHTML = `
                <span class="joker-icon">${joker.getIcon()}</span>
                <span class="joker-name">${joker.getName()}</span>
            `;
            elements.selectedJokers.appendChild(jokerEl);
        });
    }
}

function updateRerollButton() {
    const cost = shop.getRerollCost();
    elements.rerollCost.textContent = `(💰${cost})`;
    elements.rerollBtn.disabled = gameSystem.getMoney() < cost;
}

function rerollShop() {
    const result = shop.reroll();
    if (result.success) {
        shop.addDogezaIfEligible();
        renderShopLineup();
        updateSelectedJokers();
        updateRerollButton();
        updateMoneyDisplay();
    } else {
        showNotify('お金不足', result.message);
    }
}

// ===== 売却モーダル =====
function showSellJokerModal(joker) {
    jokerToSell = joker;
    const passives = game && game.jokerManager ? game.jokerManager.getPassives(PLAYER.HUMAN) : [];
    const sellPrice = gameSystem.getSellPrice(joker, passives);
    elements.sellJokerMessage.textContent = `「${joker.getName()}」を売却しますか？（売却価格: 💰${sellPrice}）`;
    elements.sellJokerModal.classList.remove('hidden');
}

function closeSellJokerModal() {
    elements.sellJokerModal.classList.add('hidden');
    jokerToSell = null;
}

function confirmSellJoker() {
    if (jokerToSell) {
        const passives = game && game.jokerManager ? game.jokerManager.getPassives(PLAYER.HUMAN) : [];
        const sellPrice = gameSystem.getSellPrice(jokerToSell, passives);
        gameSystem.addMoney(sellPrice);
        gameSystem.removeJoker(jokerToSell.id);
        renderOwnedJokers();
        updateMoneyDisplay();
    }
    closeSellJokerModal();
}

function onNextBattle() {
    const purchasedJokers = shop.collectPurchasedJokers();
    purchasedJokers.forEach(joker => {
        gameSystem.addJoker(joker);
    });

    showScreen('matchmake');
    updateMatchmakeScreen();
    updateMoneyDisplay();
}

// ===== ランク変動演出モーダル =====
function showRankChangeModal(prevRank, newRank, isRankUp, callback) {
    const modalContent = elements.rankChangeModal.querySelector('.modal-content');

    // クラスをリセットしてから追加
    modalContent.classList.remove('rank-up', 'rank-down');
    modalContent.classList.add(isRankUp ? 'rank-up' : 'rank-down');

    if (isRankUp) {
        elements.rankChangeIcon.textContent = '🎊';
        elements.rankChangeTitle.textContent = 'ランクアップ！';
        elements.rankChangeMessage.textContent = 'おめでとうございます！';
    } else {
        elements.rankChangeIcon.textContent = '😔';
        elements.rankChangeTitle.textContent = 'ランクダウン...';
        elements.rankChangeMessage.textContent = '次は頑張りましょう';
    }

    elements.rankChangePrev.textContent = `${prevRank.icon} ${prevRank.name}`;
    elements.rankChangeNext.textContent = `${newRank.icon} ${newRank.name}`;

    elements.rankChangeModal.classList.remove('hidden');

    // 3秒後に自動で閉じる
    setTimeout(() => {
        elements.rankChangeModal.classList.add('hidden');
        if (callback) callback();
    }, 3000);
}

// ===== 購入確認モーダル =====
function showPurchaseConfirmModal(index) {
    const item = shop.lineup[index];
    if (!item || item.purchased) return;

    pendingPurchaseIndex = index;
    const joker = item.joker;
    const rarity = joker.getRarity();

    elements.purchaseConfirmContent.innerHTML = `
        <span class="joker-icon">${joker.getIcon()}</span>
        <div class="joker-name">${joker.getName()}</div>
        <div class="joker-rarity" style="color: ${rarity.color}">${rarity.name}</div>
        <div class="joker-price">💰${item.price}</div>
        <div class="joker-desc">${joker.getDescription()}</div>
    `;

    elements.purchaseConfirmModal.classList.remove('hidden');
}

function closePurchaseConfirmModal() {
    elements.purchaseConfirmModal.classList.add('hidden');
    pendingPurchaseIndex = null;
}

function confirmPurchase() {
    if (pendingPurchaseIndex === null) return;

    const result = shop.purchase(pendingPurchaseIndex);
    closePurchaseConfirmModal();

    if (!result.success) {
        if (result.limitReached) {
            elements.limitModal.classList.remove('hidden');
        } else if (result.noMoney) {
            showNotify('お金不足', 'お金が足りません');
        }
        return;
    }

    renderShopLineup();
    updateSelectedJokers();
    updateMoneyDisplay();
}

// ===== ボーナスパック開封モーダル =====
function showBonusPackModal() {
    pendingBonusPackCards = createBonusTrumpPack();
    selectedBonusPackCard = null;

    elements.bonusPackCards.innerHTML = '';

    pendingBonusPackCards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `card card-front ${card.isRed() ? 'red' : ''} bonus-trump`;
        cardEl.innerHTML = `
            <span class="card-suit">${card.suit}</span>
            <span class="card-rank">${RANK_DISPLAY[card.rank]}</span>
        `;

        cardEl.addEventListener('click', () => {
            // 選択状態をトグル
            elements.bonusPackCards.querySelectorAll('.card').forEach(el => {
                el.classList.remove('selected');
            });
            cardEl.classList.add('selected');
            selectedBonusPackCard = card;
            elements.bonusPackConfirm.disabled = false;
        });

        elements.bonusPackCards.appendChild(cardEl);
    });

    elements.bonusPackConfirm.disabled = true;
    elements.bonusPackModal.classList.remove('hidden');
}

function closeBonusPackModal() {
    elements.bonusPackModal.classList.add('hidden');
    selectedBonusPackCard = null;
    pendingBonusPackCards = [];
}

function confirmBonusPack() {
    if (!selectedBonusPackCard) return;

    // 選択したボーナストランプをゲームシステムに保存
    // 次の対戦時に山札に追加される
    if (!gameSystem.pendingBonusTrumps) {
        gameSystem.pendingBonusTrumps = [];
    }
    gameSystem.pendingBonusTrumps.push({
        suit: selectedBonusPackCard.suit,
        rank: selectedBonusPackCard.rank
    });
    gameSystem.saveData();

    showNotify('カード追加完了', `${selectedBonusPackCard.getDisplayName()}★を次の対戦で山札に追加します！`);
    closeBonusPackModal();
}

// ===== ジョーカー設定モーダル =====
function showJokerSettingsModal() {
    elements.settingsModal.classList.add('hidden'); // 設定モーダルを閉じる
    elements.jokerSettingsModal.classList.remove('hidden');
    renderJokerSettingsList();
}

function closeJokerSettingsModal() {
    elements.jokerSettingsModal.classList.add('hidden');
    // 設定モーダルに戻る
    elements.settingsModal.classList.remove('hidden');
    gameSystem.saveData(); // 設定を保存
}

function renderJokerSettingsList() {
    elements.jokerSettingsList.innerHTML = '';

    // 全種類のジョーカーを取得（土下座以外）
    const jokerTypes = getShopJokerTypes(); // joker.jsから取得

    // レアリティ順にソートするための重み付け
    const rarityOrder = {
        'common': 1,
        'uncommon': 2,
        'rare': 3,
        'epic': 4,
        'legendary': 5
    };

    jokerTypes.sort((a, b) => {
        const jokerA = new Joker(a);
        const jokerB = new Joker(b);
        const rarityA = rarityOrder[jokerA.getRarity().id] || 0;
        const rarityB = rarityOrder[jokerB.getRarity().id] || 0;

        if (rarityA !== rarityB) return rarityA - rarityB;
        // 同じレアリティならパッシブを後ろに
        if (jokerA.isPassive() !== jokerB.isPassive()) return jokerA.isPassive() ? 1 : -1;
        return 0;
    });

    jokerTypes.forEach(type => {
        const itemEl = renderJokerSettingItem(type);
        elements.jokerSettingsList.appendChild(itemEl);
    });
}

function renderJokerSettingItem(type) {
    const joker = new Joker(type);
    const isEnabled = gameSystem.isJokerEnabled(type);

    const itemEl = document.createElement('div');
    itemEl.className = `joker-setting-item ${isEnabled ? '' : 'disabled'}`;
    itemEl.style.borderColor = joker.getRarity().color;

    itemEl.innerHTML = `
        <div class="joker-setting-icon">${joker.getIcon()}</div>
        <div class="joker-setting-name">${joker.getName()}</div>
    `;

    // ===== イベントリスナー設定 =====

    // PC: ホバーで詳細表示
    itemEl.addEventListener('mouseenter', () => {
        showJokerDetailPopup(itemEl, joker);
    });

    itemEl.addEventListener('mouseleave', () => {
        hideJokerDetailPopup();
    });

    // クリックで有効/無効切り替え
    itemEl.addEventListener('click', () => {
        const newEnabled = gameSystem.toggleJokerDisabled(type);

        if (newEnabled) {
            itemEl.classList.remove('disabled');
        } else {
            itemEl.classList.add('disabled');
        }
    });

    // スマホ: タップで詳細表示＋切り替え（長押し不要に）
    itemEl.addEventListener('touchstart', (e) => {
        showJokerDetailPopup(itemEl, joker);
    });

    itemEl.addEventListener('touchend', (e) => {
        hideJokerDetailPopup();
        // タップで切り替え
        const newEnabled = gameSystem.toggleJokerDisabled(type);
        if (newEnabled) {
            itemEl.classList.remove('disabled');
        } else {
            itemEl.classList.add('disabled');
        }
        e.preventDefault(); // ダブルタップズーム防止
    });

    return itemEl;
}

function showJokerDetailPopup(targetEl, joker) {
    const popup = elements.jokerDetailPopup;
    const rect = targetEl.getBoundingClientRect();
    const rarity = joker.getRarity();

    popup.querySelector('.detail-name').textContent = joker.getName();

    const rarityEl = popup.querySelector('.detail-rarity');
    rarityEl.textContent = rarity.name;
    rarityEl.style.color = rarity.color;

    popup.querySelector('.detail-desc').textContent = joker.getDescription();

    const catEl = popup.querySelector('.detail-category');
    catEl.textContent = joker.isPassive() ? 'パッシブ' : 'アクティブ';
    catEl.style.borderColor = rarity.color;
    catEl.style.color = rarity.color;

    popup.classList.remove('hidden');

    // 位置調整（画面中央に固定表示するCSSになっているので、ここでは内容は変えるだけでOK）
    // もしターゲット付近に出したいならここでstyle.top/leftを弄るが、CSSで中央固定にしたので不要
}

function hideJokerDetailPopup() {
    elements.jokerDetailPopup.classList.add('hidden');
}

// ===== 追加イベントリスナー設定 =====
function setupAdditionalEventListeners() {
    // 購入確認モーダル
    if (elements.purchaseConfirmYes) {
        elements.purchaseConfirmYes.addEventListener('click', confirmPurchase);
    }
    if (elements.purchaseConfirmNo) {
        elements.purchaseConfirmNo.addEventListener('click', closePurchaseConfirmModal);
    }

    // ボーナスパックモーダル
    if (elements.bonusPackConfirm) {
        elements.bonusPackConfirm.addEventListener('click', confirmBonusPack);
    }

    // ジョーカー設定
    if (elements.jokerSettingsBtn) {
        elements.jokerSettingsBtn.addEventListener('click', showJokerSettingsModal);
    }
    if (elements.closeJokerSettings) {
        elements.closeJokerSettings.addEventListener('click', closeJokerSettingsModal);
    }

    // ゲームリセット
    const gameResetBtn = document.getElementById('game-reset-btn');
    if (gameResetBtn) {
        gameResetBtn.addEventListener('click', () => {
            if (confirm('ゲームをリセットしますか？\n所持金・ランク・所持ジョーカーがすべて初期化されます。\nこの操作は取り消せません。')) {
                gameSystem.resetGame();
                elements.settingsModal.classList.add('hidden');
                updateMoneyDisplay();
                showNotify('リセット完了', 'ゲームデータがリセットされました');
            }
        });
    }

    // ライフ制トグル
    const lifeSystemToggle = document.getElementById('lifeSystemToggle');
    if (lifeSystemToggle) {
        lifeSystemToggle.checked = gameSystem.isLifeSystemEnabled();
        lifeSystemToggle.addEventListener('change', (e) => {
            gameSystem.settings.lifeSystemEnabled = e.target.checked;
            gameSystem.saveData();
            updateLifeDisplay();
        });
    }

    // ゲームオーバーモーダル
    const gameOverBackBtn = document.getElementById('gameOverBackToTitle');
    if (gameOverBackBtn) {
        gameOverBackBtn.addEventListener('click', () => {
            document.getElementById('gameOverModal').classList.add('hidden');
            showScreen('title');
        });
    }
}

// ===== ゲームオーバーモーダル =====
function showGameOverModal() {
    const story = gameSystem.generateGameOverStory();
    document.getElementById('gameOverStory').textContent = story;

    // ゲームオーバー処理
    gameSystem.triggerGameOver();

    document.getElementById('gameOverModal').classList.remove('hidden');
}

// ===== ショップ ライフ購入 =====
let lifePurchasedThisShop = false;

function renderShopLifeSection() {
    const container = document.getElementById('shopLifeSection');
    if (!container) return;

    if (!gameSystem.isLifeSystemEnabled()) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    const lives = gameSystem.getLives();
    const maxLives = gameSystem.getMaxLives();
    const price = gameSystem.getLifePrice();
    const canBuy = !lifePurchasedThisShop && lives < maxLives && gameSystem.getMoney() >= price;

    container.innerHTML = `
        <div class="shop-life-info">
            <span class="shop-life-icon">❤️</span>
            <span class="shop-life-text">ライフ ${lives}/${maxLives}</span>
        </div>
        <button class="shop-life-btn" ${canBuy ? '' : 'disabled'} id="buyLifeBtn">
            回復 💰${price}
        </button>
    `;

    const buyBtn = document.getElementById('buyLifeBtn');
    if (buyBtn && canBuy) {
        buyBtn.addEventListener('click', () => {
            gameSystem.addMoney(-price);
            gameSystem.gainLife();
            lifePurchasedThisShop = true;
            updateMoneyDisplay();
            renderShopLifeSection();
            showNotify('ライフ回復！', 'ライフを1回復しました');
        });
    }
}

// ===== 起動 =====
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupAdditionalEventListeners();
});
