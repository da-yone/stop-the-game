# Stop The Game 🎮💤

**Windows PC用スリープアラーム - ゲームを止めて健康的な生活リズムを！**

[![Build Status](https://github.com/da-yone/stop-the-game/actions/workflows/ci.yml/badge.svg)](https://github.com/da-yone/stop-the-game/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 概要

**Stop The Game** は、Windows PC用の自動スリープアラームアプリケーションです。毎日決まった時間（デフォルト：21:00）にアラーム音を鳴らし、PCを自動的にスリープモードに移行させることで、健康的な生活リズムをサポートします。

### 🎯 主な機能

- **⏰ 自動アラーム**: 毎日21:00に30秒間のアラーム音
- **💻 自動スリープ**: アラーム後にPCを自動的にスリープモード
- **⌨️ キャンセル機能**: キー入力でアラームをキャンセル
- **🔄 再開機能**: キャンセル後10秒でアラーム再開
- **🎵 カスタム音声**: アラーム音の変更・音量調整
- **🖱️ システムトレイ**: バックグラウンドでの快適な操作
- **⚙️ 設定管理**: アラーム時刻やオプションの変更

## 🚀 インストール・セットアップ

### 前提条件

- **Windows 10/11** (推奨)
- **Node.js 18.x** 以上
- **npm** パッケージマネージャー

### インストール手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/da-yone/stop-the-game.git
cd stop-the-game
```

2. **依存関係のインストール**
```bash
npm install
```

3. **TypeScriptビルド**
```bash
npm run build
```

4. **アラーム音ファイルの配置**
```bash
mkdir sounds
# お好みの.wavファイルを sounds/alarm.wav として配置
```

## 🎮 使用方法

### 基本的な使い方

1. **アプリケーション起動**
```bash
npm start
```

2. **システムトレイから操作**
   - システムトレイのアイコンを右クリック
   - メニューから操作を選択：
     - **Start Alarm**: アラーム開始
     - **Stop Alarm**: アラーム停止
     - **Settings**: 設定画面
     - **Exit**: アプリケーション終了

3. **アラーム時の操作**
   - アラーム音が鳴ったら：
     - **何もしない**: 30秒後に自動でPCスリープ
     - **キー入力**: アラームキャンセル → 10秒後に再開
     - **Ctrl+C**: アプリケーション終了

### 設定のカスタマイズ

設定ファイル `./config/settings.json` で各種設定を変更できます：

```json
{
  "alarmTime": "21:00",
  "soundFile": "./sounds/alarm.wav",
  "volume": 1.0,
  "duration": 30,
  "enabled": true
}
```

#### 設定項目

| 項目 | 説明 | デフォルト値 | 範囲・形式 |
|------|------|-------------|-----------|
| `alarmTime` | アラーム時刻 | "21:00" | HH:MM形式 |
| `soundFile` | アラーム音ファイル | "./sounds/alarm.wav" | ファイルパス |
| `volume` | 音量 | 1.0 | 0.0-1.0 |
| `duration` | アラーム継続時間（秒） | 30 | 正の整数 |
| `enabled` | アラーム有効/無効 | true | true/false |

### コマンドライン操作

```bash
# アプリケーション起動
npm start

# 開発モード（ホットリロード）
npm run dev

# テスト実行
npm test

# TypeScriptコンパイル
npm run build

# コード品質チェック
npm run lint
npm run type-check
```

## 🏗️ 技術仕様

### アーキテクチャ

- **言語**: TypeScript 5.2
- **ランタイム**: Node.js 18.x
- **テストフレームワーク**: Jest
- **開発手法**: TDD (Test-Driven Development)
- **品質管理**: ESLint + TypeScript strict mode

### 主要ライブラリ

| ライブラリ | 用途 | バージョン |
|-----------|------|-----------|
| `node-cron` | スケジューリング | 3.x |
| `winston` | ログ管理 | 3.x |
| `play-sound` | 音声再生 | 1.x |
| `keypress` | キーボード入力 | 2.x |
| `systray2` | システムトレイ | 2.x |

### ディレクトリ構造

```
stop-the-game/
├── src/                    # ソースコード
│   ├── scheduler.ts        # アラームスケジューラー
│   ├── alarm-sound.ts      # アラーム音管理
│   ├── cancellation-handler.ts # キャンセル処理
│   ├── restart-manager.ts  # 再開管理
│   ├── sleep-manager.ts    # スリープ処理
│   ├── system-tray.ts      # システムトレイ
│   ├── settings-manager.ts # 設定管理
│   └── logger.ts          # ログシステム
├── test/                   # テストコード
├── types/                  # 型定義
├── sounds/                 # アラーム音ファイル
├── config/                 # 設定ファイル
└── logs/                   # ログファイル
```

## 🧪 開発・テスト

### テスト実行

```bash
# 全テスト実行
npm test

# 特定のテストファイル実行
npm test -- test/scheduler.test.ts

# テストカバレッジ
npm run test:coverage
```

### コード品質

```bash
# ESLint実行
npm run lint

# TypeScript型チェック
npm run type-check

# すべてのチェック実行
npm run quality-check
```

### TDD開発フロー

このプロジェクトはTDD（テスト駆動開発）で構築されています：

1. **Red**: 失敗するテストを先に書く
2. **Green**: テストが通る最小限の実装
3. **Refactor**: コードをクリーンアップ

## 🛠️ トラブルシューティング

### よくある問題

**Q: アラーム音が鳴らない**
- A: `./sounds/alarm.wav`ファイルが存在することを確認
- A: Windows音声設定でミュートになっていないか確認
- A: 設定の`volume`が0.0になっていないか確認

**Q: PCがスリープしない**
- A: Windows管理者権限で実行
- A: 電源オプションでスリープが許可されているか確認
- A: 他のアプリケーションがスリープを阻害していないか確認

**Q: システムトレイにアイコンが表示されない**
- A: Windows通知領域の設定を確認
- A: 管理者権限で実行

**Q: 設定が保存されない**
- A: `./config/`フォルダの書き込み権限を確認
- A: `settings.json`の JSON形式が正しいか確認

### ログ確認

問題発生時は `./logs/` フォルダのログファイルを確認してください：

```bash
# 最新のログを確認
cat logs/app.log

# エラーログのみ確認
grep "error" logs/app.log
```

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 開発に参加する

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### 開発ガイドライン

- **TDD**: 新機能は必ずテストファーストで開発
- **TypeScript**: 型安全性を重視
- **ESLint**: コードスタイルを統一
- **コミットメッセージ**: 日本語で簡潔に

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🙏 謝辞

- **Node.jsコミュニティ** - 素晴らしい開発環境を提供
- **TypeScriptチーム** - 型安全な開発体験を実現
- **オープンソースコミュニティ** - 多くのライブラリとツールに感謝

---

**健康的な生活リズムで、より良い明日を！** 💤✨

**🤖 Generated with [Claude Code](https://claude.ai/code)**