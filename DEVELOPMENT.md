# 開発方針・戦略ドキュメント

## ブランチ戦略

### メインブランチ
- `main`: 本番環境用の安定版

### 開発ブランチ構成
各Phaseごとに専用ブランチを作成し、機能完了後にPull Requestを作成

```
main
├── feature/phase1-foundation
├── feature/phase2-core-features  
├── feature/phase3-ui-ux
├── feature/phase4-testing
└── feature/phase5-finalization
```

### ブランチ命名規則
- `feature/phase[番号]-[概要]`
- 例: `feature/phase1-foundation`

## コミット戦略

### コミットタイミング
- **各Phase内の小項目ごとに1コミット**
- 機能が完成した時点で即座にコミット
- コミットメッセージは日本語で記述

### コミットメッセージ形式
```
[Phase番号] 小項目名

詳細説明（必要に応じて）

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Phase別コミット計画

#### Phase 1: 基盤構築 (`feature/phase1-foundation`)
1. `[Phase1] package.json作成`
2. `[Phase1] 基本ファイル構造作成` 
3. `[Phase1] ログシステム実装`

#### Phase 2: コア機能実装 (`feature/phase2-core-features`)
1. `[Phase2] スケジューラー実装`
2. `[Phase2] アラーム機能実装`
3. `[Phase2] スリープ機能実装`
4. `[Phase2] キャンセル・再始動機能実装`

#### Phase 3: UI・UX改善 (`feature/phase3-ui-ux`)
1. `[Phase3] システムトレイ実装`
2. `[Phase3] 設定変更機能実装`

#### Phase 4: テスト・検証 (`feature/phase4-testing`)
1. `[Phase4] ユニットテスト作成`
2. `[Phase4] デモ機能実装`
3. `[Phase4] 統合テスト実施`

#### Phase 5: 仕上げ (`feature/phase5-finalization`)
1. `[Phase5] ドキュメント作成`
2. `[Phase5] 最終動作確認`

## Pull Request戦略

### PR作成タイミング
- 各Phase完了時に`main`ブランチに対してPRを作成

### PR命名規則
```
[Phase番号] Phase名 - 実装完了

例: [Phase1] Foundation - 基盤構築実装完了
```

### PRテンプレート
```markdown
## 概要
Phase[番号]の実装が完了しました

## 実装内容
- [ ] 小項目1
- [ ] 小項目2  
- [ ] 小項目3

## テスト実行結果
- [ ] ユニットテスト: Pass
- [ ] 動作確認: OK

## 確認事項
- [ ] コードレビュー完了
- [ ] テスト実行完了
- [ ] 動作確認完了

🤖 Generated with [Claude Code](https://claude.ai/code)
```

### PRレビュー・マージ方針
- 全テストがPassしていることを確認
- 動作確認が完了していることを確認  
- PRマージ後は即座に次のPhaseブランチを作成

## 開発手法

### TDD（テスト駆動開発）の採用
全ての機能実装においてTDDサイクルに従って開発を進行

#### TDDサイクル
1. **Red**: 失敗するテストを先に書く
2. **Green**: テストが通る最小限のコードを実装
3. **Refactor**: コードをクリーンアップ・最適化

#### 実装順序
各機能に対して以下の順序で実装：
1. テストケース設計・実装
2. 最小限の機能実装（テスト通過）
3. リファクタリング・最適化
4. 追加テストケース（エッジケース等）

#### 技術仕様
- **プラットフォーム**: Windows
- **ランタイム**: Node.js 14以上  
- **言語**: TypeScript
- **主要ライブラリ**: node-cron, play-sound, winston, keypress, node-systray
- **TypeScript設定**: 厳密な型チェック、ES2020ターゲット

#### テストファイル作成規則
- 実装ファイルと同時にテストファイルを作成
- TypeScriptファイル命名: `[機能名].ts` / `[機能名].test.ts`
- テストディレクトリ: `test/`配下
- 型定義ファイル: `types/`配下

## 品質管理

### テスト実行タイミング
- **TDDサイクル毎**（Red→Green→Refactor）
- 各コミット前
- PR作成前
- マージ前

### コードチェック項目
- [ ] TDDサイクル完了
- [ ] TypeScriptコンパイルエラーなし
- [ ] テスト実行結果Pass（100%）
- [ ] テストカバレッジ確認
- [ ] ESLintエラーなし
- [ ] 型チェック完了
- [ ] 動作確認OK
- [ ] ログ出力確認

### 動作確認項目（Phase完了時）
- [ ] 基本機能動作
- [ ] エラーハンドリング
- [ ] ログ出力
- [ ] Windows互換性
- [ ] 全テストケースPass

### TDD実装例（TypeScript）
```typescript
// 1. Red: 失敗するテストを先に書く
import { AlarmScheduler } from '../src/scheduler';

test('should schedule alarm at specified time', () => {
  const scheduler = new AlarmScheduler();
  expect(scheduler.setAlarmTime('21:00')).toBe(true);
});

// 2. Green: 最小限の実装
export class AlarmScheduler {
  setAlarmTime(time: string): boolean {
    return true; // 最小限の実装
  }
}

// 3. Refactor: 実際の機能実装
export class AlarmScheduler {
  setAlarmTime(time: string): boolean {
    // 実際のスケジューリング処理
    return this.isValidTime(time);
  }
  
  private isValidTime(time: string): boolean {
    // 時刻妥当性チェック
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }
}
```

この開発方針に従ってTDD方式で実装を進めます。