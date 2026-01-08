/**
 * 大富豪 - 画面遷移管理
 */

// 画面の種類
const SCREENS = {
    TITLE: 'title',
    MATCHMAKE: 'matchmake',
    PLAY: 'play',
    RESULT: 'result',
    SHOP: 'shop'
};

/**
 * 画面マネージャー
 */
class ScreenManager {
    constructor() {
        this.currentScreen = SCREENS.TITLE;
        this.previousScreen = null;
        this.screenData = {};  // 画面間でデータを渡す
    }

    /**
     * 画面を切り替え
     */
    switchTo(screen, data = {}) {
        this.previousScreen = this.currentScreen;
        this.currentScreen = screen;
        this.screenData = data;

        // 全画面を非表示
        document.querySelectorAll('.screen').forEach(el => {
            el.classList.add('hidden');
        });

        // 対象画面を表示
        const screenEl = document.getElementById(`${screen}Screen`);
        if (screenEl) {
            screenEl.classList.remove('hidden');
        }

        // 画面固有の初期化
        this.onScreenEnter(screen, data);

        return screen;
    }

    /**
     * 画面に入った時の処理
     */
    onScreenEnter(screen, data) {
        switch (screen) {
            case SCREENS.TITLE:
                this.initTitleScreen();
                break;
            case SCREENS.MATCHMAKE:
                this.initMatchmakeScreen();
                break;
            case SCREENS.PLAY:
                this.initPlayScreen(data);
                break;
            case SCREENS.RESULT:
                this.initResultScreen(data);
                break;
            case SCREENS.SHOP:
                this.initShopScreen(data);
                break;
        }
    }

    /**
     * タイトル画面初期化
     */
    initTitleScreen() {
        // タイトル画面の初期化処理
    }

    /**
     * マッチメイク画面初期化
     */
    initMatchmakeScreen() {
        // マッチメイク画面の初期化処理
    }

    /**
     * プレイ画面初期化
     */
    initPlayScreen(data) {
        // プレイ画面の初期化はapp.jsで行う
    }

    /**
     * リザルト画面初期化
     */
    initResultScreen(data) {
        // リザルト画面の初期化
    }

    /**
     * ショップ画面初期化
     */
    initShopScreen(data) {
        // ショップ画面の初期化
    }

    /**
     * 前の画面に戻る
     */
    goBack() {
        if (this.previousScreen) {
            this.switchTo(this.previousScreen);
        }
    }

    /**
     * 現在の画面を取得
     */
    getCurrentScreen() {
        return this.currentScreen;
    }

    /**
     * 画面データを取得
     */
    getScreenData() {
        return this.screenData;
    }
}

// シングルトンインスタンス
const screenManager = new ScreenManager();

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScreenManager, SCREENS, screenManager };
}
