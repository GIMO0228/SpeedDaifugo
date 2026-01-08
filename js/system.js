/**
 * 大富豪 - ゲームシステム（Phase 3: 報酬・ランク・ショップ拡張）
 */

// ===== ランク定義（調整済み）=====
const RANKS = {
    DAIHINMIN: { id: 'daihinmin', name: '大貧民', minMoney: 0, icon: '😭', lineupCount: 1 },
    HINMIN: { id: 'hinmin', name: '貧民', minMoney: 10, icon: '😢', lineupCount: 1 },
    HEIMIN: { id: 'heimin', name: '平民', minMoney: 30, icon: '😐', lineupCount: 2 },
    KOGANEMOCHI: { id: 'koganemochi', name: '小金持ち', minMoney: 100, icon: '🙂', lineupCount: 2 },
    FUGO: { id: 'fugo', name: '富豪', minMoney: 300, icon: '😊', lineupCount: 3 },
    DAIFUGO: { id: 'daifugo', name: '大富豪', minMoney: 800, icon: '😄', lineupCount: 4 },
    CHODAIFUGO: { id: 'chodaifugo', name: '超大富豪', minMoney: 2000, icon: '🤩', lineupCount: 5 },
    KING: { id: 'king', name: '王', minMoney: 5000, icon: '👑', lineupCount: 5 },
    GOD: { id: 'god', name: '神', minMoney: 15000, icon: '✨', lineupCount: 5 },
    JOKER: { id: 'joker', name: 'ジョーカー', minMoney: 50000, icon: '🃏', lineupCount: 5 }
};

const RANK_ORDER = [
    RANKS.DAIHINMIN,
    RANKS.HINMIN,
    RANKS.HEIMIN,
    RANKS.KOGANEMOCHI,
    RANKS.FUGO,
    RANKS.DAIFUGO,
    RANKS.CHODAIFUGO,
    RANKS.KING,
    RANKS.GOD,
    RANKS.JOKER
];

// ===== 役倍率（インフレ調整版）=====
const HAND_MULTIPLIERS = {
    single: 0,      // 単騎は合算しない
    pair: 3,        // ペア
    three: 5,       // 3カード
    four: 8,        // フォーカード
    sequence: 6     // 階段
};

// ===== ボーナス・ペナルティ =====
const REWARD_MODIFIERS = {
    NO_JOKER_USED: 5,       // ジョーカー不使用ボーナス
    JOKER_USED: 2,          // ジョーカー使用
    PENALTY_2_FINISH: -3,   // 2上がりペナルティ（通常時）
    PENALTY_3_FINISH: -3,   // 3上がり（革命時）ペナルティ
    BONUS_3_FINISH: 5,      // 3上がりボーナス（通常時）
    BONUS_2_FINISH: 5,      // 2上がりボーナス（革命時）
    WIN_STREAK_BASE: 1,     // 連勝ボーナス（連勝数×この値）
    WIN_STREAK_10: 10,      // 10連勝ごとの追加ボーナス
    DRAW_JOKER_WIN: 5,      // ドロージョーカー使用勝利ボーナス
    BONUS_TRUMP: 4,         // ボーナストランプ使用ボーナス
    INITIAL_COLOR_BONUS: 5  // 初期手札カラー統一ボーナス
};

// ===== ショップ設定 =====
const SHOP_CONFIG = {
    BASE_REROLL_COST: 3,    // リロール初回コスト
    REROLL_INCREMENT: 1     // 回数ごとの追加コスト
};

// ===== ゲームシステムクラス =====
class GameSystem {
    constructor() {
        this.loadData();
    }

    loadData() {
        const saved = localStorage.getItem('daifugo_system');
        if (saved) {
            const data = JSON.parse(saved);
            this.money = data.money || 0;
            this.lives = data.lives !== undefined ? data.lives : 5; // ライフ
            this.ownedJokers = (data.ownedJokers || []).map(j => {
                const joker = new Joker(j.type);
                joker.id = j.id;
                return joker;
            });
            this.settings = data.settings || this.getDefaultSettings();
            this.stats = data.stats || this.getDefaultStats();
            this.pendingBonusTrumps = data.pendingBonusTrumps || [];
        } else {
            this.money = 0;
            this.lives = 5; // ライフ初期値
            this.ownedJokers = [];
            this.settings = this.getDefaultSettings();
            this.stats = this.getDefaultStats();
            this.pendingBonusTrumps = [];
        }
    }

    saveData() {
        const data = {
            money: this.money,
            lives: this.lives,
            ownedJokers: this.ownedJokers.map(j => ({ type: j.type, id: j.id })),
            settings: this.settings,
            stats: this.stats,
            pendingBonusTrumps: this.pendingBonusTrumps || []
        };
        localStorage.setItem('daifugo_system', JSON.stringify(data));
    }

    // ボーナストランプを取得してクリア
    consumePendingBonusTrumps() {
        const trumps = this.pendingBonusTrumps || [];
        this.pendingBonusTrumps = [];
        this.saveData();
        return trumps;
    }

    // ゲームデータをリセット（所持金・ランク・ジョーカー）
    resetGame() {
        this.money = 0;
        this.lives = 5;
        this.ownedJokers = [];
        this.stats = this.getDefaultStats();
        this.pendingBonusTrumps = [];
        // 設定は維持する
        this.saveData();
    }

    // ===== ライフシステム =====
    getLives() {
        return this.lives;
    }

    getMaxLives() {
        return 5;
    }

    isLifeSystemEnabled() {
        return this.settings.lifeSystemEnabled || false;
    }

    loseLife() {
        if (!this.isLifeSystemEnabled()) return false;

        this.lives = Math.max(0, this.lives - 1);
        this.saveData();
        return this.lives === 0; // ゲームオーバーかどうか
    }

    gainLife(amount = 1) {
        this.lives = Math.min(this.getMaxLives(), this.lives + amount);
        this.saveData();
    }

    // ライフ購入価格（所持金の50%）
    getLifePrice() {
        const money = this.getMoney();
        return Math.max(1, Math.floor(money * 0.5)); // 最低1、所持金の50%
    }

    // ゲームオーバー処理
    triggerGameOver() {
        this.money = 0;
        this.lives = 5;
        this.ownedJokers = [];
        this.pendingBonusTrumps = [];
        // ランクは自動的に貧民になる（所持金0のため）
        this.saveData();
    }

    // ゲームオーバー時のストーリー生成
    generateGameOverStory() {
        const stats = this.stats;
        const totalGames = stats.wins + stats.losses;
        const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

        let story = '';

        if (totalGames < 5) {
            story = 'たった数回の勝負で人生が終わった。これが神の戦いの厳しさだ。';
        } else if (winRate >= 60) {
            story = `${totalGames}回の勝負、勝率${winRate}%。強者だったが、最後に運が尽きた。栄光と転落の物語。`;
        } else if (winRate >= 40) {
            story = `${totalGames}回の勝負。一進一退の戦いだったが、次第に負けが込み、ついに全てを失った。`;
        } else {
            story = `${totalGames}回の勝負、勝率${winRate}%。苦戦の連続だった。そして今、すべてが終わる。`;
        }

        if (stats.currentStreak > 0) {
            story += `\n最後は${stats.currentStreak}連勝中だったのに…`;
        } else if (stats.maxStreak >= 5) {
            story += `\nかつて${stats.maxStreak}連勝を達成した栄光もあった。`;
        }

        return story;
    }

    getDefaultSettings() {
        return {
            autoPass: false,
            bgmVolume: 0.5,
            seVolume: 0.5,
            speed: 'normal',
            disabledJokers: [],
            lifeSystemEnabled: true // ライフ制ON/OFF
        };
    }

    /**
     * ジョーカーの有効/無効を切り替え
     */
    toggleJokerDisabled(type) {
        if (!this.settings.disabledJokers) {
            this.settings.disabledJokers = [];
        }

        const index = this.settings.disabledJokers.indexOf(type);
        if (index === -1) {
            this.settings.disabledJokers.push(type);
            return false; // 無効化された（有効でない）
        } else {
            this.settings.disabledJokers.splice(index, 1);
            return true; // 有効化された
        }
    }

    /**
     * ジョーカーが有効かどうか
     */
    isJokerEnabled(type) {
        if (!this.settings.disabledJokers) {
            return true;
        }
        return !this.settings.disabledJokers.includes(type);
    }

    getDefaultStats() {
        return {
            winStreak: 0,
            loseStreak: 0,
            totalWins: 0,
            totalLosses: 0,
            lastConfiscated: 0  // 直近の没収額（ヒール用）
        };
    }

    getMoney() {
        return this.money;
    }

    addMoney(amount) {
        this.money += Math.floor(amount);
        if (this.money < 0) this.money = 0;
        this.saveData();
        return this.money;
    }

    subtractMoney(amount) {
        this.money = Math.max(0, this.money - Math.floor(amount));
        this.saveData();
        return this.money;
    }

    confiscateHalf() {
        const confiscated = Math.floor(this.money / 2);
        this.money -= confiscated;
        this.stats.lastConfiscated = confiscated;
        this.saveData();
        return confiscated;
    }

    getRank() {
        for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
            if (this.money >= RANK_ORDER[i].minMoney) {
                return RANK_ORDER[i];
            }
        }
        return RANKS.DAIHINMIN;
    }

    getPreviousRank(previousMoney) {
        for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
            if (previousMoney >= RANK_ORDER[i].minMoney) {
                return RANK_ORDER[i];
            }
        }
        return RANKS.DAIHINMIN;
    }

    isLowRank() {
        const rank = this.getRank();
        return rank.id === 'daihinmin' || rank.id === 'hinmin';
    }

    getLineupCount() {
        return this.getRank().lineupCount;
    }

    /**
     * 勝利報酬を計算（インフレ調整版）
     */
    calculateReward(handHistory, usedJoker, finishCard, isRevolution, passives = [], options = {}) {
        const baseReward = 3;  // 基本報酬を増加
        let totalMultiplier = 0;
        const breakdown = [];
        const { usedDrawJoker = false, usedBonusTrumps = 0, initialColorBonus = false } = options;

        // 役倍率を合算（単騎は除外）
        handHistory.forEach(h => {
            const mult = HAND_MULTIPLIERS[h.handType] || 0;
            if (mult > 0) {
                breakdown.push({
                    name: h.handTypeName,
                    multiplier: mult,
                    type: 'hand'
                });
                totalMultiplier += mult;
            }
        });

        // ジョーカー使用/不使用ボーナス
        if (usedJoker) {
            breakdown.push({
                name: 'ジョーカー使用',
                multiplier: REWARD_MODIFIERS.JOKER_USED,
                type: 'bonus'
            });
            totalMultiplier += REWARD_MODIFIERS.JOKER_USED;
        } else {
            breakdown.push({
                name: 'ジョーカー不使用',
                multiplier: REWARD_MODIFIERS.NO_JOKER_USED,
                type: 'bonus'
            });
            totalMultiplier += REWARD_MODIFIERS.NO_JOKER_USED;
        }

        // ペナルティ・ボーナスチェック
        if (finishCard) {
            if (!isRevolution && finishCard.rank === 15) {  // 通常時2上がり
                breakdown.push({
                    name: '2上がりペナルティ',
                    multiplier: REWARD_MODIFIERS.PENALTY_2_FINISH,
                    type: 'penalty'
                });
                totalMultiplier += REWARD_MODIFIERS.PENALTY_2_FINISH;
            } else if (!isRevolution && finishCard.rank === 3) {  // 通常時3上がり
                breakdown.push({
                    name: '3上がりボーナス！',
                    multiplier: REWARD_MODIFIERS.BONUS_3_FINISH,
                    type: 'bonus'
                });
                totalMultiplier += REWARD_MODIFIERS.BONUS_3_FINISH;
            } else if (isRevolution && finishCard.rank === 3) {  // 革命時3上がり
                breakdown.push({
                    name: '3上がりペナルティ',
                    multiplier: REWARD_MODIFIERS.PENALTY_3_FINISH,
                    type: 'penalty'
                });
                totalMultiplier += REWARD_MODIFIERS.PENALTY_3_FINISH;
            } else if (isRevolution && finishCard.rank === 15) {  // 革命時2上がり
                breakdown.push({
                    name: '2上がりボーナス！',
                    multiplier: REWARD_MODIFIERS.BONUS_2_FINISH,
                    type: 'bonus'
                });
                totalMultiplier += REWARD_MODIFIERS.BONUS_2_FINISH;
            }
        }

        // 連勝ボーナス
        if (this.stats.winStreak > 0) {
            const streakBonus = this.stats.winStreak * REWARD_MODIFIERS.WIN_STREAK_BASE;
            breakdown.push({
                name: `${this.stats.winStreak + 1}連勝ボーナス`,
                multiplier: streakBonus,
                type: 'bonus'
            });
            totalMultiplier += streakBonus;

            // 10連勝ごとの追加ボーナス
            const tenStreakCount = Math.floor((this.stats.winStreak + 1) / 10);
            if (tenStreakCount > 0) {
                const tenBonus = tenStreakCount * REWARD_MODIFIERS.WIN_STREAK_10;
                breakdown.push({
                    name: `${tenStreakCount * 10}連勝達成ボーナス！`,
                    multiplier: tenBonus,
                    type: 'bonus'
                });
                totalMultiplier += tenBonus;
            }
        }

        // ドロージョーカー勝利ボーナス
        if (usedDrawJoker) {
            breakdown.push({
                name: 'ドロージョーカー勝利！',
                multiplier: REWARD_MODIFIERS.DRAW_JOKER_WIN,
                type: 'bonus'
            });
            totalMultiplier += REWARD_MODIFIERS.DRAW_JOKER_WIN;
        }

        // ボーナストランプ使用ボーナス
        if (usedBonusTrumps > 0) {
            const bonusTrumpReward = usedBonusTrumps * REWARD_MODIFIERS.BONUS_TRUMP;
            breakdown.push({
                name: `ボーナストランプ×${usedBonusTrumps}`,
                multiplier: bonusTrumpReward,
                type: 'bonus'
            });
            totalMultiplier += bonusTrumpReward;
        }

        // 初期手札カラー統一ボーナス
        if (initialColorBonus) {
            breakdown.push({
                name: '初期手札フラッシュ！',
                multiplier: REWARD_MODIFIERS.INITIAL_COLOR_BONUS,
                type: 'bonus'
            });
            totalMultiplier += REWARD_MODIFIERS.INITIAL_COLOR_BONUS;
        }

        // パッシブ効果
        let luckyBonus = 0;
        let greedBonus = 0;
        let comboBonus = 0;
        let momentumBonus = 0;

        passives.forEach(passive => {
            switch (passive.type) {
                case JOKER_TYPES.LUCKY:
                    luckyBonus = Math.floor(totalMultiplier * 0.2);
                    breakdown.push({ name: '幸運 (+20%)', multiplier: luckyBonus, type: 'passive' });
                    break;
                case JOKER_TYPES.GREED:
                    greedBonus = Math.floor(totalMultiplier * 0.3);
                    breakdown.push({ name: '強欲 (+30%)', multiplier: greedBonus, type: 'passive' });
                    break;
                case JOKER_TYPES.COMBO_MASTER:
                    const comboHands = handHistory.filter(h => h.handType !== 'single').length;
                    comboBonus = comboHands;
                    if (comboBonus > 0) {
                        breakdown.push({ name: 'コンボマスター', multiplier: comboBonus, type: 'passive' });
                    }
                    break;
                case JOKER_TYPES.MOMENTUM:
                    momentumBonus = Math.floor(this.stats.winStreak * 0.1 * totalMultiplier);
                    if (momentumBonus > 0) {
                        breakdown.push({ name: `勢い (${this.stats.winStreak}連勝)`, multiplier: momentumBonus, type: 'passive' });
                    }
                    break;
            }
        });

        totalMultiplier += luckyBonus + greedBonus + comboBonus + momentumBonus;

        // 最低1
        if (totalMultiplier < 1) totalMultiplier = 1;

        const totalReward = Math.floor(baseReward * totalMultiplier);

        return {
            baseReward,
            multiplier: totalMultiplier,
            totalReward,
            breakdown
        };
    }

    /**
     * 敗北ペナルティを計算
     */
    calculatePenalty(passives = []) {
        let penalty = Math.floor(this.money / 2);

        // タンクパッシブ
        if (passives.some(p => p.type === JOKER_TYPES.TANK)) {
            penalty = Math.floor(penalty / 2);
        }

        // 強欲パッシブ（ペナルティも増加）
        if (passives.some(p => p.type === JOKER_TYPES.GREED)) {
            penalty = Math.floor(penalty * 1.3);
        }

        return penalty;
    }

    // ===== ジョーカー管理 =====
    getOwnedJokers() {
        return this.ownedJokers;
    }

    addJoker(joker) {
        if (this.ownedJokers.length < 5) {
            this.ownedJokers.push(joker);
            this.saveData();
            return true;
        }
        return false;
    }

    removeJoker(jokerId) {
        const index = this.ownedJokers.findIndex(j => j.id === jokerId);
        if (index >= 0) {
            this.ownedJokers.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    // 使用されたジョーカーをシステムから削除
    removeUsedJokers(usedJokerIds) {
        this.ownedJokers = this.ownedJokers.filter(j => !usedJokerIds.includes(j.id));
        this.saveData();
    }

    hasDogeza() {
        return this.ownedJokers.some(j => j.type === JOKER_TYPES.DOGEZA);
    }

    discardDogeza() {
        const dogezaIndex = this.ownedJokers.findIndex(j => j.type === JOKER_TYPES.DOGEZA);
        if (dogezaIndex >= 0) {
            this.ownedJokers.splice(dogezaIndex, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    checkDogezaDiscard(previousMoney) {
        if (!this.hasDogeza()) return null;

        const previousRank = this.getPreviousRank(previousMoney);
        const currentRank = this.getRank();

        const wasLowRank = previousRank.id === 'daihinmin' || previousRank.id === 'hinmin';
        const isNowHigherRank = currentRank.id !== 'daihinmin' && currentRank.id !== 'hinmin';

        if (wasLowRank && isNowHigherRank) {
            this.discardDogeza();
            return {
                newRank: currentRank,
                message: this.generateDogezaDiscardMessage(currentRank)
            };
        }
        return null;
    }

    generateDogezaDiscardMessage(rank) {
        const messages = [
            `おめでとうございます、${rank.name}様！`,
            `あなたは這いつくばる日々から脱却し、`,
            `堂々と胸を張って歩けるようになりました。`,
            ``,
            `もう土下座なんて必要ありませんね？`,
            ``,
            `【土下座カードを破棄しました】`,
            ``,
            `さらばだ、哀れな過去の自分よ…`,
            `これからは${rank.name}として生きていくのだ！`
        ];
        return messages.join('\n');
    }

    // ===== 売却 =====
    getSellPrice(joker, passives = []) {
        let price = Math.floor(joker.getPrice() / 2);

        // 商人パッシブ
        if (passives.some(p => p.type === JOKER_TYPES.MERCHANT)) {
            price *= 2;
        }

        return price;
    }

    // ===== 統計 =====
    recordWin() {
        this.stats.winStreak++;
        this.stats.loseStreak = 0;
        this.stats.totalWins++;
        this.saveData();
    }

    recordLoss() {
        this.stats.loseStreak++;
        this.stats.winStreak = 0;
        this.stats.totalLosses++;
        this.saveData();
    }

    // ===== 設定 =====
    isAutoPassEnabled() {
        return this.settings.autoPass;
    }

    setAutoPass(enabled) {
        this.settings.autoPass = enabled;
        this.saveData();
    }

    getSettings() {
        return this.settings;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveData();
    }

    // ===== リロールコスト =====
    getRerollCost(rerollCount, passives = []) {
        let cost = SHOP_CONFIG.BASE_REROLL_COST + (rerollCount * SHOP_CONFIG.REROLL_INCREMENT);

        // 知恵パッシブ
        if (passives.some(p => p.type === JOKER_TYPES.WISDOM)) {
            cost = Math.max(1, cost - 1);
        }

        return cost;
    }

    // ===== 価格割引 =====
    getDiscountedPrice(originalPrice, passives = []) {
        let price = originalPrice;

        // 節約家パッシブ
        if (passives.some(p => p.type === JOKER_TYPES.ECONOMY)) {
            price = Math.floor(price * 0.9);
        }

        return price;
    }

    // ===== ヒール計算 =====
    getHealAmount() {
        return Math.floor(this.stats.lastConfiscated * 0.2);
    }
}

const gameSystem = new GameSystem();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameSystem, gameSystem, RANKS, RANK_ORDER, HAND_MULTIPLIERS, REWARD_MODIFIERS, SHOP_CONFIG };
}
