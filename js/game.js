/**
 * 大富豪 - ゲームエンジン（Phase 2: ジョーカー・役記録対応）
 */

// 役の種類
const HAND_TYPES = {
    INVALID: 'invalid',
    SINGLE: 'single',
    PAIR: 'pair',
    THREE_OF_A_KIND: 'three',
    FOUR_OF_A_KIND: 'four',
    SEQUENCE: 'sequence'
};

// 役の日本語名
const HAND_TYPE_NAMES = {
    [HAND_TYPES.SINGLE]: '単騎',
    [HAND_TYPES.PAIR]: 'ペア',
    [HAND_TYPES.THREE_OF_A_KIND]: 'スリーカード',
    [HAND_TYPES.FOUR_OF_A_KIND]: 'フォーカード',
    [HAND_TYPES.SEQUENCE]: '階段'
};

// プレイヤー種別
const PLAYER = {
    HUMAN: 'human',
    AI: 'ai'
};

/**
 * ゲームクラス
 */
class Game {
    constructor() {
        this.jokerManager = null;
        this.reset();
    }

    /**
     * ゲームをリセット
     */
    reset() {
        this.humanHand = [];
        this.aiHand = [];
        this.field = [];
        this.fieldType = null;
        this.isRevolution = false;
        this.isBackActive = false;      // バック効果による一時的な逆転
        this.currentPlayer = null;
        this.lastPlayer = null;
        this.gameOver = false;
        this.winner = null;
        this.message = '';

        // 役の記録
        this.handHistory = [];  // { player, handType, cards, joker, timestamp }

        // ジョーカー
        this.humanJokers = [];
        this.aiJokers = [];
        this.initialColorBonus = false;

        // 先攻決め用
        this.needsFirstPlayerSelection = false;
        this.firstPlayerCards = [];  // 山札から引いた2枚

        // ジョーカーマネージャー
        if (this.jokerManager) {
            this.jokerManager = new JokerManager(this);
        }
    }

    /**
     * ジョーカーマネージャーを設定
     */
    setJokerManager(manager) {
        this.jokerManager = manager;
    }

    /**
     * ジョーカーを設定
     */
    setJokers(humanJokers, aiJokers) {
        this.humanJokers = humanJokers || [];
        this.aiJokers = aiJokers || [];

        if (this.jokerManager) {
            this.humanJokers.forEach(j => this.jokerManager.addJoker(PLAYER.HUMAN, j));
            this.aiJokers.forEach(j => this.jokerManager.addJoker(PLAYER.AI, j));
        }
    }

    /**
     * ゲームを開始
     */
    start() {
        this.reset();
        this.jokerManager = new JokerManager(this);

        // デッキ生成・シャッフル
        let deck = shuffleDeck(createDeck());

        // ボーナストランプを山札に追加（gameSystemから取得）
        if (typeof gameSystem !== 'undefined') {
            const bonusTrumps = gameSystem.consumePendingBonusTrumps();
            bonusTrumps.forEach(bt => {
                deck.push(new Card(bt.suit, bt.rank, true));
            });
            // 再シャッフル
            deck = shuffleDeck(deck);
        }

        // 5枚ずつ配布
        this.humanHand = sortHand(deck.slice(0, 5));
        this.aiHand = sortHand(deck.slice(5, 10));

        // 初期手札カラーボーナス判定（全て赤 または 全て黒）
        const isAllRed = this.humanHand.every(c => c.isRed());
        const isAllBlack = this.humanHand.every(c => !c.isRed());
        this.initialColorBonus = isAllRed || isAllBlack;

        if (this.initialColorBonus) {
            this.message = `【初期手札ボーナス】全て${isAllRed ? '赤' : '黒'}色のカードです！`;
        }

        // 残りのデッキを保存（先攻決め用）
        this.remainingDeck = deck.slice(10);

        // 先攻決定（♦3を持っている方）
        const humanHasDiamond3 = this.humanHand.some(c => c.isDiamondThree());
        const aiHasDiamond3 = this.aiHand.some(c => c.isDiamondThree());

        if (humanHasDiamond3) {
            this.currentPlayer = PLAYER.HUMAN;
            this.message = 'あなたが♦3を持っているので先攻です！';
        } else if (aiHasDiamond3) {
            this.currentPlayer = PLAYER.AI;
            this.message = 'AIが♦3を持っているので先攻です';
        } else {
            // 先攻決めが必要
            this.needsFirstPlayerSelection = true;
            // ボーナストランプを除外した2枚を選出
            const normalCards = this.remainingDeck.filter(c => !c.isBonus);
            this.firstPlayerCards = [
                normalCards[0] || this.remainingDeck[0],
                normalCards[1] || this.remainingDeck[1]
            ];
            this.message = 'カードを選んで先攻を決めてください';
        }

        return {
            currentPlayer: this.currentPlayer,
            needsSelection: this.needsFirstPlayerSelection,
            selectionCards: this.firstPlayerCards
        };
    }

    /**
     * 先攻決めカード選択
     * @param {number} selectedIndex - プレイヤーが選んだカードのインデックス（0 or 1）
     */
    selectFirstPlayer(selectedIndex) {
        if (!this.needsFirstPlayerSelection) {
            return { success: false, message: 'カード選択は不要です' };
        }

        const playerCard = this.firstPlayerCards[selectedIndex];
        const aiCard = this.firstPlayerCards[1 - selectedIndex];

        const playerStrength = this.getHandStrength(playerCard.rank);
        const aiStrength = this.getHandStrength(aiCard.rank);

        if (playerStrength > aiStrength) {
            this.currentPlayer = PLAYER.HUMAN;
            this.message = `あなたの${playerCard.getDisplayName()}がAIの${aiCard.getDisplayName()}より強いので先攻です！`;
        } else if (aiStrength > playerStrength) {
            this.currentPlayer = PLAYER.AI;
            this.message = `AIの${aiCard.getDisplayName()}があなたの${playerCard.getDisplayName()}より強いのでAIが先攻です`;
        } else {
            // 同じ強さならランダム
            this.currentPlayer = Math.random() < 0.5 ? PLAYER.HUMAN : PLAYER.AI;
            this.message = `同じ強さなのでランダムで${this.currentPlayer === PLAYER.HUMAN ? 'あなた' : 'AI'}が先攻です`;
        }

        this.needsFirstPlayerSelection = false;
        this.firstPlayerCards = [];

        return {
            success: true,
            playerCard: playerCard,
            aiCard: aiCard,
            firstPlayer: this.currentPlayer
        };
    }

    /**
     * 役を判定
     */
    analyzeHand(cards, hasDecoy = false) {
        if (!cards || cards.length === 0) {
            // デコイ単体使用
            if (hasDecoy) {
                return {
                    type: HAND_TYPES.SINGLE,
                    rank: 15,  // 2相当
                    count: 1,
                    triggersRevolution: false,
                    hasDecoy: true
                };
            }
            return { type: HAND_TYPES.INVALID, rank: 0, count: 0 };
        }

        const count = cards.length + (hasDecoy ? 1 : 0);

        // 単騎
        if (count === 1) {
            return {
                type: HAND_TYPES.SINGLE,
                rank: cards[0].rank,
                count: 1,
                triggersRevolution: false
            };
        }

        // 全て同じランクかチェック
        const allSameRank = cards.every(c => c.rank === cards[0].rank);

        if (allSameRank || hasDecoy) {
            // デコイがある場合は同ランク扱い
            const baseRank = cards.length > 0 ? cards[0].rank : 15;

            if (count === 2) {
                return {
                    type: HAND_TYPES.PAIR,
                    rank: baseRank,
                    count: 2,
                    triggersRevolution: false,
                    hasDecoy: hasDecoy
                };
            }
            if (count === 3) {
                return {
                    type: HAND_TYPES.THREE_OF_A_KIND,
                    rank: baseRank,
                    count: 3,
                    triggersRevolution: false,
                    hasDecoy: hasDecoy
                };
            }
            if (count === 4 && allSameRank && !hasDecoy) {
                // デコイなしのフォーカードのみ革命
                return {
                    type: HAND_TYPES.FOUR_OF_A_KIND,
                    rank: baseRank,
                    count: 4,
                    triggersRevolution: true
                };
            }
            if (count === 4 && hasDecoy) {
                // デコイありは革命なし
                return {
                    type: HAND_TYPES.FOUR_OF_A_KIND,
                    rank: baseRank,
                    count: 4,
                    triggersRevolution: false,
                    hasDecoy: true
                };
            }
        }

        // 階段チェック（同スート・連続3枚以上）
        if (cards.length >= 3 && !hasDecoy) {
            const seqResult = this.checkSequence(cards);
            if (seqResult.isSequence) {
                return {
                    type: HAND_TYPES.SEQUENCE,
                    rank: seqResult.highestRank,
                    count: cards.length,
                    triggersRevolution: cards.length >= 4
                };
            }
        }

        return { type: HAND_TYPES.INVALID, rank: 0, count: 0 };
    }

    /**
     * 階段判定
     */
    checkSequence(cards) {
        const allSameSuit = cards.every(c => c.suit === cards[0].suit);
        if (!allSameSuit) {
            return { isSequence: false };
        }

        const sorted = [...cards].sort((a, b) => a.rank - b.rank);

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].rank !== sorted[i - 1].rank + 1) {
                return { isSequence: false };
            }
        }

        return {
            isSequence: true,
            highestRank: sorted[sorted.length - 1].rank
        };
    }

    /**
     * 出せるかどうか判定
     */
    canPlay(cards, joker = null, hasDecoy = false) {
        const handInfo = this.analyzeHand(cards, hasDecoy);

        if (handInfo.type === HAND_TYPES.INVALID) {
            return { valid: false, reason: '無効な組み合わせです' };
        }

        // 縛り・激しばチェック
        if (this.jokerManager) {
            const restrictionCheck = this.jokerManager.checkRestrictions(cards);
            if (!restrictionCheck.valid) {
                return restrictionCheck;
            }
        }

        // 場が空（親）の場合は何でも出せる
        if (this.field.length === 0) {
            return { valid: true, reason: '' };
        }

        // 場の役と同じタイプ・枚数か
        const fieldInfo = this.analyzeHand(this.field);

        if (handInfo.type !== fieldInfo.type) {
            return { valid: false, reason: '場と同じ役を出してください' };
        }

        if (handInfo.count !== fieldInfo.count) {
            return { valid: false, reason: '場と同じ枚数を出してください' };
        }

        // 強さ比較
        const handStrength = this.getHandStrength(handInfo.rank);
        const fieldStrength = this.getHandStrength(fieldInfo.rank);

        if (handStrength <= fieldStrength) {
            return { valid: false, reason: '場より強いカードを出してください' };
        }

        return { valid: true, reason: '' };
    }

    /**
     * カードの強さを取得（革命・バック考慮）
     */
    getHandStrength(rank) {
        // バック効果とisRevolutionを組み合わせる
        const effectiveRevolution = this.isBackActive ? !this.isRevolution : this.isRevolution;
        return effectiveRevolution
            ? RANK_STRENGTH_REVOLUTION[rank]
            : RANK_STRENGTH_NORMAL[rank];
    }

    /**
     * カードを出す（ジョーカー対応）
     */
    playCards(player, cards, joker = null, jokerParams = {}) {
        const hasDecoy = joker && joker.type === JOKER_TYPES.DECOY;
        const validation = this.canPlay(cards, joker, hasDecoy);

        if (!validation.valid) {
            return { success: false, message: validation.reason };
        }

        // 手札からカードを除去
        const hand = player === PLAYER.HUMAN ? this.humanHand : this.aiHand;
        const cardIds = cards.map(c => c.id);

        if (player === PLAYER.HUMAN) {
            this.humanHand = hand.filter(c => !cardIds.includes(c.id));
        } else {
            this.aiHand = hand.filter(c => !cardIds.includes(c.id));
        }

        // 場に出す
        this.field = cards;
        this.fieldType = this.analyzeHand(cards, hasDecoy).type;
        this.lastPlayer = player;

        // 役を記録
        const handInfo = this.analyzeHand(cards, hasDecoy);
        this.recordHand(player, handInfo, cards, joker);

        // ジョーカー効果を適用
        let jokerResult = null;
        if (joker && this.jokerManager) {
            jokerResult = this.jokerManager.applyJoker(player, joker, cards, jokerParams);

            // 切り効果（カードを場に出してから一瞬後に流す）
            if (jokerResult.clearField) {
                // 場にカードは既に出している（this.field = cards）
                // clearFieldは呼ばずに、フラグで返す（UI側で一瞬表示してから流す）
                jokerResult.delayedClearField = true;
            }

            // バック効果
            if (joker.type === JOKER_TYPES.BACK) {
                this.isBackActive = true;
                this.humanHand = sortHand(this.humanHand, !this.isRevolution);
                this.aiHand = sortHand(this.aiHand, !this.isRevolution);
            }

            // ボンバー効果
            if (jokerResult.bomber) {
                const bomberResult = this.jokerManager.executeBomber(jokerResult.bomber.rank);
                jokerResult.bomber.removedFromHuman = bomberResult.removedFromHuman;
                jokerResult.bomber.removedFromAI = bomberResult.removedFromAI;
            }
        }

        // 激しば発動中の場合、ランクを更新
        if (this.jokerManager && this.jokerManager.activeEffects.gekishiba && cards.length > 0) {
            const playedRank = Math.max(...cards.map(c => c.rank));
            this.jokerManager.updateGekishibaRank(playedRank);
        }

        // 革命チェック（デコイ含まない場合のみ）
        if (handInfo.triggersRevolution && !hasDecoy) {
            this.isRevolution = !this.isRevolution;
            this.message = `革命発生！カードの強さが${this.isRevolution ? '逆転' : '元に戻り'}ました`;
            this.humanHand = sortHand(this.humanHand, this.isRevolution);
            this.aiHand = sortHand(this.aiHand, this.isRevolution);
        }

        // 勝利判定
        if (this.checkWinner()) {
            return {
                success: true,
                gameOver: true,
                jokerEffect: jokerResult
            };
        }

        // ターン交代
        this.currentPlayer = player === PLAYER.HUMAN ? PLAYER.AI : PLAYER.HUMAN;

        return {
            success: true,
            gameOver: false,
            jokerEffect: jokerResult,
            pendingAction: jokerResult?.pendingAction
        };
    }

    /**
     * 役を記録
     */
    recordHand(player, handInfo, cards, joker) {
        this.handHistory.push({
            player: player,
            handType: handInfo.type,
            handTypeName: HAND_TYPE_NAMES[handInfo.type] || handInfo.type,
            cards: cards.map(c => c.getDisplayName()),
            rank: handInfo.rank,
            joker: joker ? joker.getName() : null,
            timestamp: Date.now()
        });
    }

    /**
     * 場を流す
     */
    clearField() {
        this.field = [];
        this.fieldType = null;

        // バック効果解除
        if (this.isBackActive) {
            this.isBackActive = false;
            this.humanHand = sortHand(this.humanHand, this.isRevolution);
            this.aiHand = sortHand(this.aiHand, this.isRevolution);
        }

        // ジョーカー効果解除
        if (this.jokerManager) {
            this.jokerManager.onFieldCleared();
        }
    }

    /**
     * パス
     */
    pass(player) {
        this.clearField();
        this.currentPlayer = this.lastPlayer;
        this.message = `${player === PLAYER.HUMAN ? 'あなた' : 'AI'}がパスしました。場を流します。`;

        return { success: true };
    }

    /**
     * 勝利判定
     */
    checkWinner() {
        if (this.humanHand.length === 0) {
            this.gameOver = true;
            this.winner = PLAYER.HUMAN;
            this.message = 'おめでとうございます！あなたの勝利です！';
            return true;
        }
        if (this.aiHand.length === 0) {
            this.gameOver = true;
            this.winner = PLAYER.AI;
            this.message = 'AIの勝利です...';
            return true;
        }
        return false;
    }

    /**
     * 役履歴を取得
     */
    getHandHistory() {
        return this.handHistory;
    }

    /**
     * プレイヤーの役履歴のみ取得
     */
    getPlayerHandHistory() {
        return this.handHistory.filter(h => h.player === PLAYER.HUMAN);
    }

    /**
     * 現在の状態を取得
     */
    getState() {
        return {
            humanHand: this.humanHand,
            aiHand: this.aiHand,
            aiHandCount: this.aiHand.length,
            field: this.field,
            fieldType: this.fieldType,
            isRevolution: this.isRevolution,
            isBackActive: this.isBackActive,
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            winner: this.winner,
            message: this.message,
            humanJokers: this.jokerManager ? this.jokerManager.getJokers(PLAYER.HUMAN) : [],
            aiJokers: this.jokerManager ? this.jokerManager.getJokers(PLAYER.AI) : [],
            aiJokerCount: this.jokerManager ? this.jokerManager.getJokers(PLAYER.AI).length : 0,
            activeEffects: this.jokerManager ? this.jokerManager.activeEffects : {},
            pendingAction: this.jokerManager ? this.jokerManager.pendingAction : null,
            needsFirstPlayerSelection: this.needsFirstPlayerSelection,
            firstPlayerCards: this.firstPlayerCards,
            handHistory: this.handHistory
        };
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game, HAND_TYPES, HAND_TYPE_NAMES, PLAYER };
}
