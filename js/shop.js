/**
 * 大富豪 - ショップシステム（Phase 3: 価格・リロール対応）
 */

/**
 * ショップクラス
 */
class Shop {
    constructor() {
        this.lineup = [];
        this.lineupSize = 3;
        this.purchasedJokers = [];
        this.rerollCount = 0;
        this.passives = [];  // パッシブ効果（割引等に使用）
    }

    /**
     * パッシブを設定
     */
    setPassives(passives) {
        this.passives = passives || [];
    }

    /**
     * ラインナップ数をランクに応じて設定
     */
    setLineupSizeByRank() {
        this.lineupSize = gameSystem.getLineupCount();
    }

    /**
     * ラインナップを生成（ランク別レアリティフィルタリング付き）
     */
    generateLineup() {
        this.lineup = [];
        this.setLineupSizeByRank();

        const rankRarityWeights = this.getRarityWeightsByRank();
        const disabledJokers = gameSystem.settings.disabledJokers || [];

        for (let i = 0; i < this.lineupSize; i++) {
            const joker = createRandomJokerByRarity(rankRarityWeights, disabledJokers);
            const price = this.getDiscountedPrice(joker);

            this.lineup.push({
                joker: joker,
                price: price,
                originalPrice: joker.getPrice(),
                purchased: false
            });
        }

        // ボーナストランプパックを追加
        this.addBonusTrumpPack();

        return this.lineup;
    }

    /**
     * ランクに応じたレアリティ重みを取得
     */
    getRarityWeightsByRank() {
        const rank = gameSystem.getRank();
        const rankIndex = RANK_ORDER.findIndex(r => r.id === rank.id);

        // ランクに応じたレアリティ制限
        // 大貧民・貧民: Common, Uncommon中心
        // 平民・小金持ち: Common, Uncommon, Rare
        // 富豪・大富豪: Uncommon, Rare, Epic
        // 超大富豪以上: Rare, Epic, Legendary

        if (rankIndex <= 1) {
            // 大貧民・貧民
            return { common: 50, uncommon: 40, rare: 10, epic: 0, legendary: 0 };
        } else if (rankIndex <= 3) {
            // 平民・小金持ち
            return { common: 35, uncommon: 40, rare: 20, epic: 5, legendary: 0 };
        } else if (rankIndex <= 5) {
            // 富豪・大富豪
            return { common: 10, uncommon: 35, rare: 35, epic: 18, legendary: 2 };
        } else {
            // 超大富豪以上
            return { common: 0, uncommon: 15, rare: 35, epic: 35, legendary: 15 };
        }
    }

    /**
     * ボーナストランプパックを追加
     */
    addBonusTrumpPack() {
        const packPrice = 18;  // 固定価格

        this.lineup.push({
            isPack: true,
            packType: 'bonusTrump',
            price: this.getDiscountedPrice({ getPrice: () => packPrice }),
            originalPrice: packPrice,
            purchased: false,
            name: 'ボーナストランプパック',
            icon: '🎁',
            description: '3枚から1枚選択して山札に追加'
        });
    }

    /**
     * リロール
     */
    reroll() {
        const cost = this.getRerollCost();

        if (gameSystem.getMoney() < cost) {
            return { success: false, message: 'お金が足りません' };
        }

        gameSystem.subtractMoney(cost);
        this.rerollCount++;
        this.generateLineup();

        return { success: true, cost: cost };
    }

    /**
     * リロールコストを取得
     */
    getRerollCost() {
        return gameSystem.getRerollCost(this.rerollCount, this.passives);
    }

    /**
     * 割引価格を取得
     */
    getDiscountedPrice(joker) {
        return gameSystem.getDiscountedPrice(joker.getPrice(), this.passives);
    }

    /**
     * ジョーカーを購入
     */
    purchase(index) {
        if (index < 0 || index >= this.lineup.length) {
            return { success: false, message: '無効な選択です' };
        }

        const item = this.lineup[index];
        if (item.purchased) {
            return { success: false, message: 'すでに選択済みです' };
        }

        // 所持上限チェック
        const currentOwned = gameSystem.getOwnedJokers().length;
        const pendingPurchase = this.purchasedJokers.length;
        if (currentOwned + pendingPurchase >= 5) {
            return { success: false, message: 'ジョーカーの所持上限（5枚）に達しています', limitReached: true };
        }

        // 所持金チェック
        if (gameSystem.getMoney() < item.price) {
            return { success: false, message: 'お金が足りません', noMoney: true };
        }

        gameSystem.subtractMoney(item.price);
        item.purchased = true;
        this.purchasedJokers.push(item.joker);

        return {
            success: true,
            message: `${item.joker.getName()}を購入しました`,
            joker: item.joker
        };
    }

    /**
     * 購入をキャンセル
     */
    cancelPurchase(index) {
        if (index < 0 || index >= this.lineup.length) {
            return { success: false };
        }

        const item = this.lineup[index];
        if (!item.purchased) {
            return { success: false };
        }

        // 返金
        gameSystem.addMoney(item.price);
        item.purchased = false;
        this.purchasedJokers = this.purchasedJokers.filter(j => j.id !== item.joker.id);

        return { success: true };
    }

    /**
     * 購入したジョーカーを取得してクリア
     */
    collectPurchasedJokers() {
        const jokers = [...this.purchasedJokers];
        this.purchasedJokers = [];
        this.rerollCount = 0;
        return jokers;
    }

    /**
     * ラインナップをクリア
     */
    clear() {
        this.lineup = [];
        this.purchasedJokers = [];
        this.rerollCount = 0;
    }

    /**
     * ラインナップサイズを手動設定
     */
    setLineupSize(size) {
        this.lineupSize = Math.max(1, Math.min(size, 8));
    }

    /**
     * 土下座ジョーカーを追加（大貧民・貧民ランク時）
     */
    addDogezaIfEligible() {
        if (gameSystem.isLowRank() && !gameSystem.hasDogeza()) {
            const dogezaJoker = new Joker(JOKER_TYPES.DOGEZA);
            this.lineup.push({
                joker: dogezaJoker,
                price: 0,
                originalPrice: 0,
                purchased: false,
                isSpecial: true
            });
        }
    }
}

/**
 * AI用ショップ - ランダムにジョーカーを選択
 */
class AIShop {
    /**
     * AIのジョーカーを生成（ランダム）
     */
    static generateAIJokers(count = 1) {
        const jokers = [];
        for (let i = 0; i < count; i++) {
            jokers.push(createRandomJokerByRarity({
                common: 30,
                uncommon: 35,
                rare: 25,
                epic: 8,
                legendary: 2
            }));
        }
        return jokers;
    }

    /**
     * ランクに基づいてジョーカーを選択
     */
    static selectByRank(playerRank, count = 1) {
        // プレイヤーランクが高いほどAIのジョーカーも強力に
        const rankIndex = RANK_ORDER.findIndex(r => r.id === playerRank.id);
        const weights = {
            common: Math.max(10, 40 - rankIndex * 4),
            uncommon: 30,
            rare: Math.min(40, 20 + rankIndex * 3),
            epic: Math.min(20, 8 + rankIndex * 2),
            legendary: Math.min(10, 2 + rankIndex)
        };

        const jokers = [];
        for (let i = 0; i < count; i++) {
            jokers.push(createRandomJokerByRarity(weights));
        }
        return jokers;
    }

    /**
     * AIのジョーカー数をランクに応じて決定
     */
    static getAIJokerCount(playerRank) {
        const rankIndex = RANK_ORDER.findIndex(r => r.id === playerRank.id);

        if (rankIndex <= 2) return 1;       // 平民以下
        if (rankIndex <= 4) return 2;       // 富豪まで
        if (rankIndex <= 6) return 3;       // 超大富豪まで
        return Math.min(5, rankIndex - 4);  // それ以上
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Shop, AIShop };
}
