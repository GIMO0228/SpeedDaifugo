/**
 * 大富豪 - AIロジック（Phase 2: ジョーカー対応）
 */

class AI {
    constructor(game) {
        this.game = game;
    }

    /**
     * AIのターンを実行
     * @returns {{action: string, cards: Card[]|null, joker: Joker|null, jokerParams: Object}}
     */
    takeTurn() {
        const legalMoves = this.getLegalMoves();

        // ジョーカー使用判定
        const jokerDecision = this.decideJokerUse(legalMoves);

        if (legalMoves.length === 0 && !jokerDecision.useDecoy) {
            // パス
            return { action: 'pass', cards: null, joker: null, jokerParams: {} };
        }

        // デコイ単体使用
        if (legalMoves.length === 0 && jokerDecision.useDecoy) {
            return {
                action: 'play',
                cards: [],
                joker: jokerDecision.joker,
                jokerParams: {}
            };
        }

        // ランダムに手を選択
        const randomIndex = Math.floor(Math.random() * legalMoves.length);
        const selectedCards = legalMoves[randomIndex];

        return {
            action: 'play',
            cards: selectedCards,
            joker: jokerDecision.joker,
            jokerParams: jokerDecision.params
        };
    }

    /**
     * ジョーカー使用を決定（戦略的判断）
     */
    decideJokerUse(legalMoves) {
        const aiJokers = this.game.jokerManager ?
            this.game.jokerManager.getJokers(PLAYER.AI) : [];

        if (aiJokers.length === 0) {
            return { joker: null, params: {}, useDecoy: false };
        }

        const hand = this.game.aiHand;
        const humanHandCount = this.game.humanHand.length;

        // 出せる手がない場合、デコイを探す
        if (legalMoves.length === 0) {
            const decoy = aiJokers.find(j => j.type === JOKER_TYPES.DECOY);
            if (decoy) {
                return { joker: decoy, params: {}, useDecoy: true };
            }
            return { joker: null, params: {}, useDecoy: false };
        }

        // ===== 戦略的ジョーカー使用判断 =====

        // 1. プレイヤーの手札が少ない（2枚以下）ときは攻撃的にジョーカー使用
        const isPlayerNearWin = humanHandCount <= 2;

        // 2. 自分の手札が少ない（2枚以下）ときも積極的に使用
        const isAINearWin = hand.length <= 2;

        // 3. 状況に応じたジョーカー選択
        for (const joker of aiJokers) {
            // 切り：場が空でない＆自分が有利な時に使用
            if (joker.type === JOKER_TYPES.KIRI && this.game.field.length > 0) {
                if (isAINearWin || Math.random() < 0.5) {
                    return { joker, params: {}, useDecoy: false };
                }
            }

            // バック：革命中でない時に使用して有利にする
            if (joker.type === JOKER_TYPES.BACK && !this.game.isRevolution) {
                if (Math.random() < 0.6) {
                    return { joker, params: {}, useDecoy: false };
                }
            }

            // 縛り：場にカードがある時に使用
            if (joker.type === JOKER_TYPES.SHIBARI && this.game.field.length > 0) {
                if (Math.random() < 0.7) {
                    return { joker, params: {}, useDecoy: false };
                }
            }

            // ボンバー：プレイヤーの手札が多い時に使用
            if (joker.type === JOKER_TYPES.BOMBER && humanHandCount >= 3) {
                const mostCommonRank = this.findMostCommonRank();
                if (mostCommonRank) {
                    return { joker, params: { rank: mostCommonRank }, useDecoy: false };
                }
            }

            // 渡し：プレイヤーが勝ちそうな時に使用
            if (joker.type === JOKER_TYPES.WATASHI && isPlayerNearWin) {
                return { joker, params: {}, useDecoy: false };
            }

            // 捨て：手札に弱いカードが多い時
            if (joker.type === JOKER_TYPES.SUTE && hand.length >= 3) {
                if (Math.random() < 0.5) {
                    return { joker, params: {}, useDecoy: false };
                }
            }

            // フリーズ：プレイヤーが有利な時
            if (joker.type === JOKER_TYPES.FREEZE && isPlayerNearWin) {
                return { joker, params: {}, useDecoy: false };
            }

            // ドロー：手札が少ない時
            if (joker.type === JOKER_TYPES.DRAW && hand.length <= 2) {
                return { joker, params: {}, useDecoy: false };
            }
        }

        // 通常時：60%の確率で使用可能なジョーカーを使う（積極的に）
        if (Math.random() < 0.6) {
            // パッシブ以外のジョーカーから選択
            const activeJokers = aiJokers.filter(j => !j.isPassive());
            if (activeJokers.length > 0) {
                const randomJoker = activeJokers[Math.floor(Math.random() * activeJokers.length)];
                const params = this.generateJokerParams(randomJoker);
                return { joker: randomJoker, params: params, useDecoy: false };
            }
        }

        return { joker: null, params: {}, useDecoy: false };
    }

    /**
     * 最も多いランクを見つける（ボンバー用）
     */
    findMostCommonRank() {
        const humanHand = this.game.humanHand;
        if (humanHand.length === 0) return null;

        const rankCount = {};
        for (const card of humanHand) {
            rankCount[card.rank] = (rankCount[card.rank] || 0) + 1;
        }

        let maxCount = 0;
        let mostCommon = null;
        for (const [rank, count] of Object.entries(rankCount)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = parseInt(rank);
            }
        }

        return mostCommon;
    }

    /**
     * ジョーカー用のパラメータを生成
     */
    generateJokerParams(joker) {
        if (joker.type === JOKER_TYPES.BOMBER) {
            const mostCommon = this.findMostCommonRank();
            if (mostCommon) return { rank: mostCommon };
            // フォールバック：ランダム
            const possibleRanks = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            return { rank: possibleRanks[Math.floor(Math.random() * possibleRanks.length)] };
        }
        return {};
    }

    /**
     * AIの渡しカード選択（ランダム）
     */
    selectCardsToGive(count) {
        const hand = this.game.aiHand;
        if (hand.length < count) {
            return hand.map(c => c.id);
        }

        // ランダムに選択
        const shuffled = [...hand].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(c => c.id);
    }

    /**
     * AIの捨てカード選択（弱いカードを優先）
     */
    selectCardsToDiscard(count) {
        const hand = this.game.aiHand;
        if (hand.length < count) {
            return hand.map(c => c.id);
        }

        // 弱いカードから選択
        const sorted = [...hand].sort((a, b) =>
            this.game.getHandStrength(a.rank) - this.game.getHandStrength(b.rank)
        );
        return sorted.slice(0, count).map(c => c.id);
    }

    /**
     * すべての合法手を取得
     */
    getLegalMoves() {
        const hand = this.game.aiHand;
        const moves = [];

        // 縛り・激しばの確認
        const hasRestrictions = this.game.jokerManager &&
            (this.game.jokerManager.activeEffects.shibari ||
                this.game.jokerManager.activeEffects.gekishiba);

        // 場が空（親）の場合
        if (this.game.field.length === 0) {
            // 単騎
            for (const card of hand) {
                if (this.checkMoveValid([card])) {
                    moves.push([card]);
                }
            }

            // ペア以上
            const rankGroups = this.groupByRank(hand);
            for (const cards of Object.values(rankGroups)) {
                if (cards.length >= 2 && this.checkMoveValid(cards.slice(0, 2))) {
                    moves.push(cards.slice(0, 2));
                }
                if (cards.length >= 3 && this.checkMoveValid(cards.slice(0, 3))) {
                    moves.push(cards.slice(0, 3));
                }
                if (cards.length >= 4 && this.checkMoveValid(cards.slice(0, 4))) {
                    moves.push(cards.slice(0, 4));
                }
            }

            // 階段
            const sequences = this.findSequences(hand);
            for (const seq of sequences) {
                if (this.checkMoveValid(seq)) {
                    moves.push(seq);
                }
            }

            return moves;
        }

        // 場にカードがある場合
        const fieldInfo = this.game.analyzeHand(this.game.field);
        const fieldStrength = this.game.getHandStrength(fieldInfo.rank);

        switch (fieldInfo.type) {
            case HAND_TYPES.SINGLE:
                for (const card of hand) {
                    if (this.game.getHandStrength(card.rank) > fieldStrength &&
                        this.checkMoveValid([card])) {
                        moves.push([card]);
                    }
                }
                break;

            case HAND_TYPES.PAIR:
                this.findStrongerSameRankCombos(hand, 2, fieldStrength, moves);
                break;

            case HAND_TYPES.THREE_OF_A_KIND:
                this.findStrongerSameRankCombos(hand, 3, fieldStrength, moves);
                break;

            case HAND_TYPES.FOUR_OF_A_KIND:
                this.findStrongerSameRankCombos(hand, 4, fieldStrength, moves);
                break;

            case HAND_TYPES.SEQUENCE:
                const sequences = this.findSequences(hand, fieldInfo.count);
                for (const seq of sequences) {
                    const seqInfo = this.game.analyzeHand(seq);
                    if (this.game.getHandStrength(seqInfo.rank) > fieldStrength &&
                        this.checkMoveValid(seq)) {
                        moves.push(seq);
                    }
                }
                break;
        }

        return moves;
    }

    /**
     * 手が縛り・激しばに適合するかチェック
     */
    checkMoveValid(cards) {
        if (!this.game.jokerManager) return true;
        const check = this.game.jokerManager.checkRestrictions(cards);
        return check.valid;
    }

    /**
     * ランク別にグループ化
     */
    groupByRank(cards) {
        const groups = {};
        for (const card of cards) {
            if (!groups[card.rank]) {
                groups[card.rank] = [];
            }
            groups[card.rank].push(card);
        }
        return groups;
    }

    /**
     * スート別にグループ化
     */
    groupBySuit(cards) {
        const groups = {};
        for (const card of cards) {
            if (!groups[card.suit]) {
                groups[card.suit] = [];
            }
            groups[card.suit].push(card);
        }
        return groups;
    }

    /**
     * 場より強い同ランク組み合わせを探す
     */
    findStrongerSameRankCombos(hand, count, fieldStrength, moves) {
        const rankGroups = this.groupByRank(hand);
        for (const [rank, cards] of Object.entries(rankGroups)) {
            if (cards.length >= count) {
                const strength = this.game.getHandStrength(parseInt(rank));
                if (strength > fieldStrength) {
                    const combo = cards.slice(0, count);
                    if (this.checkMoveValid(combo)) {
                        moves.push(combo);
                    }
                }
            }
        }
    }

    /**
     * 階段を探す
     */
    findSequences(hand, requiredLength = null) {
        const sequences = [];
        const suitGroups = this.groupBySuit(hand);

        for (const cards of Object.values(suitGroups)) {
            if (cards.length < 3) continue;

            const sorted = [...cards].sort((a, b) => a.rank - b.rank);

            for (let start = 0; start < sorted.length - 2; start++) {
                for (let end = start + 2; end < sorted.length; end++) {
                    const subset = sorted.slice(start, end + 1);

                    let isConsecutive = true;
                    for (let i = 1; i < subset.length; i++) {
                        if (subset[i].rank !== subset[i - 1].rank + 1) {
                            isConsecutive = false;
                            break;
                        }
                    }

                    if (isConsecutive) {
                        if (requiredLength === null || subset.length === requiredLength) {
                            sequences.push(subset);
                        }
                    }
                }
            }
        }

        return sequences;
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AI };
}
