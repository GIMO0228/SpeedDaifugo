/**
 * 大富豪 - カード関連クラス・定数
 */

// スート定義
const SUITS = {
    SPADE: '♠',
    HEART: '♥',
    DIAMOND: '♦',
    CLUB: '♣'
};

// ランク定義（表示用）
const RANK_DISPLAY = {
    3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
    11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '2'
};

// カードの強さ（通常時: 3が最弱、2が最強）
const RANK_STRENGTH_NORMAL = {
    3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8,
    11: 9, 12: 10, 13: 11, 14: 12, 15: 13
};

// カードの強さ（革命時: 2が最弱、3が最強）
const RANK_STRENGTH_REVOLUTION = {
    3: 13, 4: 12, 5: 11, 6: 10, 7: 9, 8: 8, 9: 7, 10: 6,
    11: 5, 12: 4, 13: 3, 14: 2, 15: 1
};

/**
 * カードクラス
 */
class Card {
    constructor(suit, rank, isBonus = false) {
        this.suit = suit;
        this.rank = rank;
        this.id = `${suit}${rank}${isBonus ? '_bonus_' + Date.now() + Math.random().toString(36).substr(2, 5) : ''}`;
        this.isBonus = isBonus;  // ボーナストランプかどうか
    }

    /**
     * カードの表示名を取得
     */
    getDisplayName() {
        return `${this.suit}${RANK_DISPLAY[this.rank]}`;
    }

    /**
     * カードの強さを取得
     * @param {boolean} isRevolution - 革命中かどうか
     */
    getStrength(isRevolution = false) {
        return isRevolution
            ? RANK_STRENGTH_REVOLUTION[this.rank]
            : RANK_STRENGTH_NORMAL[this.rank];
    }

    /**
     * ダイヤの3かどうか
     */
    isDiamondThree() {
        return this.suit === SUITS.DIAMOND && this.rank === 3;
    }

    /**
     * スートが赤かどうか（表示用）
     */
    isRed() {
        return this.suit === SUITS.HEART || this.suit === SUITS.DIAMOND;
    }
}

/**
 * デッキ生成（52枚）
 */
function createDeck() {
    const deck = [];
    const suits = Object.values(SUITS);

    for (const suit of suits) {
        for (let rank = 3; rank <= 15; rank++) {
            deck.push(new Card(suit, rank));
        }
    }

    return deck;
}

/**
 * デッキをシャッフル（Fisher-Yates）
 */
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 手札をソート（強さ順）
 */
function sortHand(hand, isRevolution = false) {
    return [...hand].sort((a, b) => {
        const strengthDiff = a.getStrength(isRevolution) - b.getStrength(isRevolution);
        if (strengthDiff !== 0) return strengthDiff;
        // 同じ強さならスートでソート
        const suitOrder = { '♠': 0, '♥': 1, '♦': 2, '♣': 3 };
        return suitOrder[a.suit] - suitOrder[b.suit];
    });
}

/**
 * ボーナストランプをランダム生成（3枚）
 */
function createBonusTrumpPack() {
    const suits = Object.values(SUITS);
    const cards = [];

    for (let i = 0; i < 3; i++) {
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const rank = Math.floor(Math.random() * 13) + 3;  // 3〜15
        cards.push(new Card(suit, rank, true));
    }

    return cards;
}

/**
 * 通常のカードかどうか（ボーナストランプでない）
 */
function isNormalCard(card) {
    return !card.isBonus;
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Card, SUITS, RANK_DISPLAY, createDeck, shuffleDeck, sortHand, createBonusTrumpPack, isNormalCard };
}

