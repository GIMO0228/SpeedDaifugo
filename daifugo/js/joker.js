/**
 * 大富豪 - ジョーカーシステム（Phase 3: 50種ジョーカー対応）
 */

// ===== ジョーカーの種類 =====
const JOKER_CATEGORY = {
    ACTIVE: 'active',   // 使い切り
    PASSIVE: 'passive'  // 半永続効果
};

// ===== レアリティ =====
const JOKER_RARITY = {
    COMMON: { id: 'common', name: 'コモン', price: 5, color: '#9ca3af' },
    UNCOMMON: { id: 'uncommon', name: 'アンコモン', price: 15, color: '#22c55e' },
    RARE: { id: 'rare', name: 'レア', price: 40, color: '#3b82f6' },
    EPIC: { id: 'epic', name: 'エピック', price: 100, color: '#a855f7' },
    LEGENDARY: { id: 'legendary', name: 'レジェンダリー', price: 250, color: '#f59e0b' }
};

// ===== ジョーカーの種類定義 =====
const JOKER_TYPES = {
    // ===== 既存ジョーカー（アクティブ）=====
    WATASHI: 'watashi',
    SUTE: 'sute',
    KIRI: 'kiri',
    BACK: 'back',
    BOMBER: 'bomber',
    SHIBARI: 'shibari',
    GEKISHIBA: 'gekishiba',
    DECOY: 'decoy',
    DOGEZA: 'dogeza',

    // ===== 新規アクティブジョーカー =====
    DESTROY: 'destroy',
    STEAL: 'steal',
    MIRROR: 'mirror',
    DOUBLE: 'double',
    SHIELD: 'shield',
    PEEK: 'peek',
    SWAP: 'swap',
    WILD: 'wild',
    RUSH: 'rush',
    FREEZE: 'freeze',
    RECYCLE: 'recycle',
    AMPLIFY: 'amplify',
    NULLIFY: 'nullify',
    DRAW: 'draw',
    HEAL: 'heal',
    GAMBLE: 'gamble',
    SCOUT: 'scout',
    LOCK: 'lock',
    BURST: 'burst',
    CHAIN: 'chain',
    REVERSE_TIME: 'reverse_time',
    CLONE: 'clone',
    EXILE: 'exile',
    FORTUNE: 'fortune',
    ABSORB: 'absorb',
    LIFE: 'life',  // ライフジョーカー

    // ===== パッシブジョーカー =====
    POWER_UP: 'power_up',
    ECONOMY: 'economy',
    COMBO_MASTER: 'combo_master',
    LUCKY: 'lucky',
    TANK: 'tank',
    COLLECTOR: 'collector',
    OBSERVER: 'observer',
    INTIMIDATE: 'intimidate',
    QUICK_HAND: 'quick_hand',
    FORTRESS: 'fortress',
    VAMPIRE: 'vampire',
    PHOENIX: 'phoenix',
    MERCHANT: 'merchant',
    GAMBLER_SPIRIT: 'gambler_spirit',
    PRESSURE: 'pressure',
    MOMENTUM: 'momentum',
    RESISTANCE: 'resistance',
    ADAPTATION: 'adaptation',
    GREED: 'greed',
    WISDOM: 'wisdom',
    STEALTH: 'stealth',
    AURA: 'aura',
    MIRROR_SHIELD: 'mirror_shield',
    TRUMP_CARD: 'trump_card',
    FINAL_STAND: 'final_stand'
};

// ===== ジョーカー情報 =====
const JOKER_INFO = {
    // ===== 既存ジョーカー =====
    [JOKER_TYPES.WATASHI]: {
        name: '渡し',
        description: '出した枚数分、相手に手札を渡す',
        icon: '🎁',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: true,
        requiresSelection: true,
        selectionType: 'give'
    },
    [JOKER_TYPES.SUTE]: {
        name: '捨て',
        description: '出した枚数分、手札を捨てる',
        icon: '🗑️',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: true,
        requiresSelection: true,
        selectionType: 'discard'
    },
    [JOKER_TYPES.KIRI]: {
        name: '切り',
        description: '場を強制的に流す',
        icon: '✂️',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.BACK]: {
        name: 'バック',
        description: '一時的にカードの強さが逆転',
        icon: '🔄',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.BOMBER]: {
        name: 'ボンバー',
        description: '宣言した数字を両者の手札から捨てる',
        icon: '💣',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.EPIC,
        requiresCards: true,
        requiresSelection: true,
        selectionType: 'rank'
    },
    [JOKER_TYPES.SHIBARI]: {
        name: '縛り',
        description: '場が流れるまで同じスートのみ',
        icon: '🔗',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.GEKISHIBA]: {
        name: '激しば',
        description: '縛り効果＋連番のみ',
        icon: '⛓️',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.DECOY]: {
        name: 'デコイ',
        description: 'ワイルドカード',
        icon: '🃏',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: false,
        isWildcard: true
    },
    [JOKER_TYPES.DOGEZA]: {
        name: '土下座',
        description: '負け確定時に再戦可能',
        icon: '🙇',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.COMMON,
        requiresCards: false,
        requiresSelection: false,
        isSpecial: true,
        rankRestricted: true,
        price: 0
    },

    // ===== 新規アクティブジョーカー =====
    [JOKER_TYPES.DESTROY]: {
        name: '破壊',
        description: '出した枚数分、相手のジョーカーを破壊',
        icon: '💥',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.EPIC,
        requiresCards: true,
        requiresSelection: true,
        selectionType: 'enemy_joker'
    },
    [JOKER_TYPES.STEAL]: {
        name: '強奪',
        description: '相手のジョーカーを1枚奪う',
        icon: '🦹',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.LEGENDARY,
        requiresCards: true,
        requiresSelection: true,
        selectionType: 'enemy_joker'
    },
    [JOKER_TYPES.MIRROR]: {
        name: 'ミラー',
        description: '相手の最後の手を完全コピー',
        icon: '🪞',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.DOUBLE]: {
        name: 'ダブル',
        description: '次の役の報酬を2倍',
        icon: '✌️',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.SHIELD]: {
        name: 'シールド',
        description: '次のジョーカー攻撃を無効化',
        icon: '🛡️',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.PEEK]: {
        name: '覗き見',
        description: '相手の手札を3秒間表示',
        icon: '👁️',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.COMMON,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.SWAP]: {
        name: 'スワップ',
        description: '手札を1枚相手と交換',
        icon: '🔀',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: true,
        requiresSelection: true,
        selectionType: 'own_card'
    },
    [JOKER_TYPES.WILD]: {
        name: 'ワイルド',
        description: '任意のカードとして使用',
        icon: '🌟',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: true,
        selectionType: 'wild_card',
        isWildcard: true
    },
    [JOKER_TYPES.RUSH]: {
        name: 'ラッシュ',
        description: 'このターン2回行動可能',
        icon: '⚡',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.EPIC,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.FREEZE]: {
        name: 'フリーズ',
        description: '相手を1ターン休み',
        icon: '❄️',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.EPIC,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.RECYCLE]: {
        name: 'リサイクル',
        description: '捨て札から1枚回収',
        icon: '♻️',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.AMPLIFY]: {
        name: 'アンプリファイ',
        description: '場の枚数分、報酬倍率追加',
        icon: '📈',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.NULLIFY]: {
        name: '無効化',
        description: '相手のパッシブを1つ無効化',
        icon: '🚫',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: true,
        requiresSelection: true,
        selectionType: 'enemy_passive'
    },
    [JOKER_TYPES.DRAW]: {
        name: 'ドロー',
        description: '山札から2枚引く',
        icon: '📥',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.COMMON,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.HEAL]: {
        name: 'ヒール',
        description: '没収された金額の20%を回復',
        icon: '💚',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.GAMBLE]: {
        name: 'ギャンブル',
        description: '50%で報酬2倍、50%で0',
        icon: '🎰',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.COMMON,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.SCOUT]: {
        name: 'スカウト',
        description: '山札の次の3枚を確認',
        icon: '🔍',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.COMMON,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.LOCK]: {
        name: 'ロック',
        description: '相手のジョーカー1枚を封印',
        icon: '🔒',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: true,
        requiresSelection: true,
        selectionType: 'enemy_joker'
    },
    [JOKER_TYPES.BURST]: {
        name: 'バースト',
        description: '4枚以上で革命発動',
        icon: '🌋',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.EPIC,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.CHAIN]: {
        name: 'チェーン',
        description: '階段を+1枚延長可能',
        icon: '🔗',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.REVERSE_TIME]: {
        name: '時戻し',
        description: '直前の行動を取り消し',
        icon: '⏪',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.LEGENDARY,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.CLONE]: {
        name: 'クローン',
        description: '所持ジョーカーを1枚複製',
        icon: '👥',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.LEGENDARY,
        requiresCards: false,
        requiresSelection: true,
        selectionType: 'own_joker'
    },
    [JOKER_TYPES.EXILE]: {
        name: '追放',
        description: '場のカードを全て追放',
        icon: '🌀',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.FORTUNE]: {
        name: 'フォーチュン',
        description: 'ランダムでコモンジョーカー入手',
        icon: '🎁',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.COMMON,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.ABSORB]: {
        name: '吸収',
        description: '相手の次のジョーカーを奪う',
        icon: '🧲',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.EPIC,
        requiresCards: true,
        requiresSelection: false
    },
    [JOKER_TYPES.LIFE]: {
        name: 'ライフ',
        description: '使用するとライフを1回復',
        icon: '❤️‍🩹',
        category: JOKER_CATEGORY.ACTIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: false
    },

    // ===== パッシブジョーカー =====
    [JOKER_TYPES.POWER_UP]: {
        name: 'パワーアップ',
        description: '全カードの強さ+1',
        icon: '💪',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.ECONOMY]: {
        name: '節約家',
        description: 'ショップ価格10%OFF',
        icon: '💰',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.COMBO_MASTER]: {
        name: 'コンボマスター',
        description: 'ペア以上の倍率+1',
        icon: '🎯',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.LUCKY]: {
        name: '幸運',
        description: '勝利報酬+20%',
        icon: '🍀',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.TANK]: {
        name: 'タンク',
        description: 'ペナルティを半減',
        icon: '🛡️',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.COLLECTOR]: {
        name: 'コレクター',
        description: 'ターン開始時5%で1円獲得',
        icon: '🪙',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.COMMON,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.OBSERVER]: {
        name: '観察者',
        description: '相手の残り枚数常時表示',
        icon: '🔭',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.COMMON,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.INTIMIDATE]: {
        name: '威圧',
        description: '相手のパス確率上昇',
        icon: '😠',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.QUICK_HAND]: {
        name: '早技',
        description: '単騎が場を流す',
        icon: '👋',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.EPIC,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.FORTRESS]: {
        name: '要塞',
        description: '破壊ジョーカー無効',
        icon: '🏰',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.EPIC,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.VAMPIRE]: {
        name: '吸血鬼',
        description: '勝利時に相手から1円奪う',
        icon: '🧛',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.PHOENIX]: {
        name: '不死鳥',
        description: '1度だけ敗北を回避',
        icon: '🔥',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.LEGENDARY,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.MERCHANT]: {
        name: '商人',
        description: '売却価格2倍',
        icon: '🏪',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.GAMBLER_SPIRIT]: {
        name: '博打魂',
        description: 'ギャンブル成功率60%',
        icon: '🎲',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.PRESSURE]: {
        name: 'プレッシャー',
        description: '相手のカード効果-1',
        icon: '😰',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.MOMENTUM]: {
        name: '勢い',
        description: '連勝で報酬+10%/勝',
        icon: '🚀',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.RESISTANCE]: {
        name: '耐性',
        description: '縛り効果を受けない',
        icon: '💎',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.ADAPTATION]: {
        name: '適応',
        description: '革命時デメリット無効',
        icon: '🦎',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.GREED]: {
        name: '強欲',
        description: '報酬+30%、ペナルティ+30%',
        icon: '👹',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.EPIC,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.WISDOM]: {
        name: '知恵',
        description: 'リロールコスト-1',
        icon: '📚',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.COMMON,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.STEALTH]: {
        name: 'ステルス',
        description: 'ジョーカー数を隠す',
        icon: '🥷',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.UNCOMMON,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.AURA]: {
        name: 'オーラ',
        description: 'パッシブ効果1.5倍',
        icon: '✨',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.LEGENDARY,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.MIRROR_SHIELD]: {
        name: '鏡の盾',
        description: '攻撃系ジョーカー反射',
        icon: '🔮',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.EPIC,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.TRUMP_CARD]: {
        name: '切り札',
        description: '最後の1枚が2ランク上昇',
        icon: '🎴',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.RARE,
        requiresCards: false,
        requiresSelection: false
    },
    [JOKER_TYPES.FINAL_STAND]: {
        name: '最後の砦',
        description: '残り1枚で全効果2倍',
        icon: '⚔️',
        category: JOKER_CATEGORY.PASSIVE,
        rarity: JOKER_RARITY.LEGENDARY,
        requiresCards: false,
        requiresSelection: false
    }
};

/**
 * ジョーカークラス
 */
class Joker {
    constructor(type) {
        this.type = type;
        this.id = `joker_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.info = JOKER_INFO[type];
        this.used = false;
        this.locked = false;  // ロックされているか
        this.activated = false;  // パッシブが発動済みか
    }

    getName() {
        return this.info.name;
    }

    getDescription() {
        return this.info.description;
    }

    getIcon() {
        return this.info.icon;
    }

    getCategory() {
        return this.info.category;
    }

    getRarity() {
        return this.info.rarity;
    }

    getPrice() {
        if (this.info.price !== undefined) {
            return this.info.price;
        }
        return this.info.rarity.price;
    }

    isPassive() {
        return this.info.category === JOKER_CATEGORY.PASSIVE;
    }

    isActive() {
        return this.info.category === JOKER_CATEGORY.ACTIVE;
    }

    requiresCards() {
        return this.info.requiresCards;
    }

    requiresSelection() {
        return this.info.requiresSelection || false;
    }

    getSelectionType() {
        return this.info.selectionType || null;
    }

    isWildcard() {
        return this.info.isWildcard || false;
    }

    isSpecial() {
        return this.info.isSpecial || false;
    }
}

/**
 * ジョーカーマネージャー - ゲーム中のジョーカー効果管理
 */
class JokerManager {
    constructor(game) {
        this.game = game;
        this.humanJokers = [];
        this.aiJokers = [];
        this.humanPassives = [];  // 発動中のパッシブ
        this.aiPassives = [];
        this.activeEffects = {
            back: false,
            shibari: null,
            gekishiba: null,
            shield: { human: false, ai: false },
            freeze: { human: false, ai: false },
            absorb: { human: false, ai: false },
            doubleReward: { human: false, ai: false }
        };
        this.pendingAction = null;
        this.usedJokerIds = [];  // 使用済みジョーカーID
    }

    addJoker(player, joker) {
        if (player === PLAYER.HUMAN) {
            this.humanJokers.push(joker);
        } else {
            this.aiJokers.push(joker);
        }
    }

    getJokers(player) {
        return player === PLAYER.HUMAN ? this.humanJokers : this.aiJokers;
    }

    getPassives(player) {
        return player === PLAYER.HUMAN ? this.humanPassives : this.aiPassives;
    }

    // パッシブジョーカーを発動
    activatePassive(player, joker) {
        if (!joker.isPassive()) return;

        joker.activated = true;
        if (player === PLAYER.HUMAN) {
            this.humanPassives.push(joker);
        } else {
            this.aiPassives.push(joker);
        }
    }

    // パッシブ効果があるか確認
    hasPassive(player, type) {
        const passives = this.getPassives(player);
        return passives.some(p => p.type === type && !p.locked);
    }

    // 使用済みジョーカーを記録
    markAsUsed(jokerId) {
        this.usedJokerIds.push(jokerId);
    }

    // 使用済みジョーカーIDを取得
    getUsedJokerIds() {
        return this.usedJokerIds;
    }

    onFieldCleared() {
        if (this.activeEffects.back) {
            this.activeEffects.back = false;
        }
        this.activeEffects.shibari = null;
        this.activeEffects.gekishiba = null;
    }

    applyJoker(player, joker, cards, params = {}) {
        joker.used = true;
        this.markAsUsed(joker.id);

        // ジョーカーリストから削除
        if (player === PLAYER.HUMAN) {
            this.humanJokers = this.humanJokers.filter(j => j.id !== joker.id);
        } else {
            this.aiJokers = this.aiJokers.filter(j => j.id !== joker.id);
        }

        const result = { success: true, message: '', pendingAction: null };

        switch (joker.type) {
            case JOKER_TYPES.WATASHI:
                result.pendingAction = { type: 'give', count: cards.length, player: player };
                result.message = `${cards.length}枚を相手に渡してください`;
                break;

            case JOKER_TYPES.SUTE:
                result.pendingAction = { type: 'discard', count: cards.length, player: player };
                result.message = `${cards.length}枚を捨ててください`;
                break;

            case JOKER_TYPES.KIRI:
                result.clearField = true;
                result.delayedClearField = true;
                result.message = '切り！場を流しました';
                break;

            case JOKER_TYPES.BACK:
                this.activeEffects.back = true;
                result.message = 'バック！一時的に強さが逆転';
                break;

            case JOKER_TYPES.BOMBER:
                result.bomber = { rank: params.rank, removedFromHuman: [], removedFromAI: [] };
                result.message = `ボンバー！${RANK_DISPLAY[params.rank]}を全て捨てる`;
                break;

            case JOKER_TYPES.SHIBARI:
                this.activeEffects.shibari = { suits: cards.map(c => c.suit), player: player };
                result.message = `縛り！${cards.map(c => c.suit).join('')}のみ`;
                break;

            case JOKER_TYPES.GEKISHIBA:
                this.activeEffects.gekishiba = {
                    suits: cards.map(c => c.suit),
                    lastRank: Math.max(...cards.map(c => c.rank)),
                    player: player
                };
                result.message = `激しば！${cards.map(c => c.suit).join('')}の連番のみ`;
                break;

            case JOKER_TYPES.DECOY:
                result.message = 'デコイ使用！';
                break;

            case JOKER_TYPES.DESTROY:
                result.pendingAction = { type: 'destroy', count: cards.length, player: player };
                result.message = `破壊！相手のジョーカーを${cards.length}枚選んで破壊`;
                break;

            case JOKER_TYPES.SHIELD:
                this.activeEffects.shield[player] = true;
                result.message = 'シールド発動！次の攻撃を無効化';
                break;

            case JOKER_TYPES.FREEZE:
                const target = player === PLAYER.HUMAN ? PLAYER.AI : PLAYER.HUMAN;
                this.activeEffects.freeze[target] = true;
                result.message = 'フリーズ！相手は1ターン休み';
                break;

            case JOKER_TYPES.DOUBLE:
                this.activeEffects.doubleReward[player] = true;
                result.message = 'ダブル！次の役の報酬2倍';
                break;

            case JOKER_TYPES.DRAW:
                result.draw = 2;
                result.message = '山札から2枚ドロー！';
                break;

            case JOKER_TYPES.PEEK:
                result.peek = true;
                result.message = '覗き見！相手の手札を確認';
                break;

            case JOKER_TYPES.LIFE:
                // ライフを1回復
                if (typeof gameSystem !== 'undefined' && gameSystem.isLifeSystemEnabled()) {
                    gameSystem.gainLife(1);
                    result.message = 'ライフを1回復！';
                } else {
                    result.message = 'ライフジョーカー使用（ライフ制OFF）';
                }
                break;

            default:
                result.message = `${joker.getName()}使用！`;
                break;
        }

        this.pendingAction = result.pendingAction;
        return result;
    }

    checkRestrictions(cards) {
        if (this.activeEffects.shibari) {
            const requiredSuits = this.activeEffects.shibari.suits;
            const cardSuits = cards.map(c => c.suit);

            if (cardSuits.length !== requiredSuits.length) {
                return { valid: false, reason: `${requiredSuits.join('')}縛り中です` };
            }

            const sortedRequired = [...requiredSuits].sort();
            const sortedCards = [...cardSuits].sort();

            for (let i = 0; i < sortedRequired.length; i++) {
                if (sortedRequired[i] !== sortedCards[i]) {
                    return { valid: false, reason: `${requiredSuits.join('')}縛り中です` };
                }
            }
        }

        if (this.activeEffects.gekishiba) {
            const { suits, lastRank } = this.activeEffects.gekishiba;
            const cardSuits = cards.map(c => c.suit);
            const cardRanks = cards.map(c => c.rank);

            const sortedRequired = [...suits].sort();
            const sortedCards = [...cardSuits].sort();

            if (cardSuits.length !== suits.length) {
                return { valid: false, reason: `激しば中：${suits.join('')}の連番のみ` };
            }

            for (let i = 0; i < sortedRequired.length; i++) {
                if (sortedRequired[i] !== sortedCards[i]) {
                    return { valid: false, reason: `激しば中：${suits.join('')}の連番のみ` };
                }
            }

            const expectedRank = lastRank + 1;
            if (!cardRanks.every(r => r === expectedRank)) {
                return { valid: false, reason: `激しば中：${RANK_DISPLAY[expectedRank]}のみ出せます` };
            }
        }

        return { valid: true, reason: '' };
    }

    updateGekishibaRank(newRank) {
        if (this.activeEffects.gekishiba) {
            this.activeEffects.gekishiba.lastRank = newRank;
        }
    }

    analyzeHandWithDecoy(cards, hasDecoy) {
        if (!hasDecoy) return null;

        if (cards.length === 0) {
            return { type: HAND_TYPES.SINGLE, rank: 15, count: 1, triggersRevolution: false, hasDecoy: true };
        }

        const totalCount = cards.length + 1;

        if (totalCount === 1) {
            return { type: HAND_TYPES.SINGLE, rank: cards[0].rank, count: 1, triggersRevolution: false, hasDecoy: true };
        }

        const cardRanks = cards.map(c => c.rank);
        const uniqueRanks = [...new Set(cardRanks)];

        if (uniqueRanks.length === 1) {
            return {
                type: this.getHandTypeByCount(totalCount),
                rank: uniqueRanks[0],
                count: totalCount,
                triggersRevolution: false,
                hasDecoy: true
            };
        }

        return { type: HAND_TYPES.INVALID, rank: 0, count: 0 };
    }

    getHandTypeByCount(count) {
        switch (count) {
            case 1: return HAND_TYPES.SINGLE;
            case 2: return HAND_TYPES.PAIR;
            case 3: return HAND_TYPES.THREE_OF_A_KIND;
            case 4: return HAND_TYPES.FOUR_OF_A_KIND;
            default: return HAND_TYPES.INVALID;
        }
    }

    executeBomber(targetRank) {
        const result = { removedFromHuman: [], removedFromAI: [] };

        result.removedFromHuman = this.game.humanHand.filter(c => c.rank === targetRank);
        this.game.humanHand = this.game.humanHand.filter(c => c.rank !== targetRank);

        result.removedFromAI = this.game.aiHand.filter(c => c.rank === targetRank);
        this.game.aiHand = this.game.aiHand.filter(c => c.rank !== targetRank);

        return result;
    }

    executeGive(fromPlayer, cardIds) {
        const fromHand = fromPlayer === PLAYER.HUMAN ? this.game.humanHand : this.game.aiHand;
        const cardsToGive = fromHand.filter(c => cardIds.includes(c.id));

        if (fromPlayer === PLAYER.HUMAN) {
            this.game.humanHand = fromHand.filter(c => !cardIds.includes(c.id));
            this.game.aiHand.push(...cardsToGive);
            this.game.aiHand = sortHand(this.game.aiHand, this.game.isRevolution);
        } else {
            this.game.aiHand = fromHand.filter(c => !cardIds.includes(c.id));
            this.game.humanHand.push(...cardsToGive);
            this.game.humanHand = sortHand(this.game.humanHand, this.game.isRevolution);
        }

        this.pendingAction = null;
        return cardsToGive;
    }

    executeDiscard(player, cardIds) {
        if (player === PLAYER.HUMAN) {
            this.game.humanHand = this.game.humanHand.filter(c => !cardIds.includes(c.id));
        } else {
            this.game.aiHand = this.game.aiHand.filter(c => !cardIds.includes(c.id));
        }
        this.pendingAction = null;
    }

    // 破壊ジョーカーの実行
    executeDestroy(targetPlayer, jokerIds) {
        // 要塞パッシブチェック
        if (this.hasPassive(targetPlayer, JOKER_TYPES.FORTRESS)) {
            return { success: false, message: '要塞により破壊無効！' };
        }

        const targetJokers = targetPlayer === PLAYER.HUMAN ? this.humanJokers : this.aiJokers;
        const destroyed = [];

        jokerIds.forEach(id => {
            const idx = targetJokers.findIndex(j => j.id === id);
            if (idx >= 0) {
                destroyed.push(targetJokers[idx]);
                targetJokers.splice(idx, 1);
            }
        });

        // パッシブも破壊対象
        const targetPassives = targetPlayer === PLAYER.HUMAN ? this.humanPassives : this.aiPassives;
        jokerIds.forEach(id => {
            const idx = targetPassives.findIndex(j => j.id === id);
            if (idx >= 0) {
                destroyed.push(targetPassives[idx]);
                targetPassives.splice(idx, 1);
            }
        });

        this.pendingAction = null;
        return { success: true, destroyed };
    }
}

// ===== ユーティリティ関数 =====

function getAllJokerTypes() {
    return Object.values(JOKER_TYPES);
}

function getShopJokerTypes() {
    // 土下座以外の全ジョーカー
    return Object.values(JOKER_TYPES).filter(t => t !== JOKER_TYPES.DOGEZA);
}

function getJokersByRarity(rarity) {
    return Object.entries(JOKER_INFO)
        .filter(([_, info]) => info.rarity.id === rarity.id)
        .map(([type, _]) => type);
}

function createRandomJoker() {
    const types = getShopJokerTypes();
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new Joker(randomType);
}

function createJoker(type) {
    return new Joker(type);
}

function createRandomJokerByRarity(weights = { common: 40, uncommon: 30, rare: 20, epic: 8, legendary: 2 }, excludedTypes = []) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;

    let selectedRarity = JOKER_RARITY.COMMON;
    for (const [rarity, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) {
            selectedRarity = JOKER_RARITY[rarity.toUpperCase()];
            break;
        }
    }

    // 指定レアリティかつ除外されていないジョーカーを取得
    let jokerTypes = getJokersByRarity(selectedRarity)
        .filter(type => !excludedTypes.includes(type));

    // もしそのレアリティのジョーカーが全て除外されている場合、
    // 除外されていないジョーカー全体からランダムに選ぶ（フォールバック）
    if (jokerTypes.length === 0) {
        const allShopTypes = getShopJokerTypes();
        const availableTypes = allShopTypes.filter(type => !excludedTypes.includes(type));

        // 全て除外されている場合（ありえないはずだが）は、全タイプから選ぶ
        if (availableTypes.length === 0) {
            jokerTypes = allShopTypes;
        } else {
            jokerTypes = availableTypes;
        }
    }

    if (jokerTypes.length === 0) {
        return createRandomJoker();
    }

    const randomType = jokerTypes[Math.floor(Math.random() * jokerTypes.length)];
    return new Joker(randomType);
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Joker, JokerManager, JOKER_TYPES, JOKER_INFO, JOKER_CATEGORY, JOKER_RARITY,
        getAllJokerTypes, getShopJokerTypes, createRandomJoker, createJoker, createRandomJokerByRarity
    };
}
