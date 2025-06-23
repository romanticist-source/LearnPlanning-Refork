# DB 統合実装計画 - TODO リスト

## セッション概要

- 日付: 2025-06-23 12:46
- 目的: 既存 UI を DB 接続に変更し完全な機能を実装
- 現状: UI は完成、ダミーデータ使用中

## 実装タスク一覧

### 1. ユーザー認証とセッション管理 【高優先度】

#### 1-1. NextAuth.js 完全設定

- [x] GitHub OAuth 設定完了確認
- [x] 環境変数設定 (AUTH_GITHUB_ID, AUTH_GITHUB_SECRET)
- [x] NextAuth 設定の検証とテスト
- [x] `app/api/auth/[...nextauth]/route.ts` の実装確認

#### 1-2. ユーザープロファイル管理

- [ ] User モデルを db.json に追加
- [ ] ユーザー登録 API 実装 (POST /api/users)
- [ ] ユーザー情報取得 API 実装 (GET /api/users/me)
- [ ] プロファイル更新 API 実装 (PUT /api/users/me)

#### 1-3. セッション状態管理

- [ ] components/auth/auth-button.tsx の実装確認
- [ ] ログイン状態の UI 表示修正
- [ ] セッション保護されたページの実装

### 2. 目標管理 API 実装 【高優先度】

#### 2-1. データモデル設計

- [ ] goals テーブル設計 (db.json)
- [ ] subgoals 関連データ構造設計
- [ ] 進捗計算ロジック設計

#### 2-2. 目標 CRUD API 実装

- [ ] 目標作成 API (POST /api/goals)
- [ ] 目標一覧取得 API (GET /api/goals)
- [ ] 目標詳細取得 API (GET /api/goals/:id)
- [ ] 目標更新 API (PUT /api/goals/:id)
- [ ] 目標削除 API (DELETE /api/goals/:id)

#### 2-3. UI 統合

- [ ] CreateGoalModal の form 送信処理実装
- [ ] GoalsList コンポーネントの API 連携
- [ ] 進捗更新機能の実装
- [ ] エラーハンドリングとローディング状態

### 3. グループ管理 API 実装 【高優先度】

#### 3-1. データモデル設計

- [ ] groups テーブル設計
- [ ] group_members 関連テーブル設計
- [ ] 招待システムのデータ構造設計

#### 3-2. グループ CRUD API 実装

- [ ] グループ作成 API (POST /api/groups)
- [ ] グループ一覧取得 API (GET /api/groups)
- [ ] グループ詳細取得 API (GET /api/groups/:id)
- [ ] グループ更新 API (PUT /api/groups/:id)
- [ ] グループ削除 API (DELETE /api/groups/:id)

#### 3-3. メンバーシップ管理 API

- [ ] メンバー招待 API (POST /api/groups/:id/invite)
- [ ] 参加リクエスト API (POST /api/groups/:id/join)
- [ ] 招待承認/拒否 API (PUT /api/invitations/:id)
- [ ] メンバー除名 API (DELETE /api/groups/:id/members/:userId)

#### 3-4. UI 統合

- [ ] CreateGroupModal の form 送信処理実装
- [ ] app/groups/page.tsx の API 連携
- [ ] app/groups/[id]/page.tsx のデータ取得実装
- [ ] 招待機能の実装

### 4. チャット・メッセージ機能実装 【中優先度】

#### 4-1. メッセージデータモデル

- [ ] messages テーブル設計
- [ ] ファイル添付データ構造設計

#### 4-2. メッセージ API 実装

- [ ] メッセージ送信 API (POST /api/groups/:id/messages)
- [ ] メッセージ取得 API (GET /api/groups/:id/messages)
- [ ] メッセージ削除 API (DELETE /api/messages/:id)

#### 4-3. リアルタイム機能

- [ ] WebSocket または Server-Sent Events 実装
- [ ] リアルタイムメッセージ受信機能

#### 4-4. UI 統合

- [ ] GroupChatMessages コンポーネントの API 連携
- [ ] メッセージ送信フォームの実装
- [ ] ファイル添付機能の実装

### 5. スケジュール・イベント API 実装 【中優先度】

#### 5-1. イベントデータモデル

- [ ] events テーブル設計
- [ ] リマインダー設定データ構造

#### 5-2. イベント API 実装

- [ ] イベント作成 API (POST /api/events)
- [ ] イベント取得 API (GET /api/events)
- [ ] イベント更新 API (PUT /api/events/:id)
- [ ] イベント削除 API (DELETE /api/events/:id)

#### 5-3. UI 統合

- [ ] CreateEventModal の form 送信処理実装
- [ ] ScheduleView コンポーネントの API 連携
- [ ] カレンダー表示機能の実装

### 6. 学習活動記録と統計 API 実装 【低優先度】

#### 6-1. 活動記録データモデル

- [ ] activities テーブル設計
- [ ] 統計データ集計設計

#### 6-2. 活動記録 API 実装

- [ ] 活動記録 API (POST /api/activities)
- [ ] 活動履歴取得 API (GET /api/activities)
- [ ] 統計データ API (GET /api/statistics)

#### 6-3. 外部 API 連携

- [ ] paiza API 連携設定
- [ ] 学習データ同期機能

#### 6-4. UI 統合

- [ ] ContributionGraph コンポーネントの API 連携
- [ ] GroupActivity コンポーネントの実装
- [ ] ダッシュボード統計表示の実装

## 実装順序

1. 認証システム → 目標管理 → グループ管理 → チャット → スケジュール → 統計

## 注意事項

- 各段階でテストを実施
- エラーハンドリングを適切に実装
- ローディング状態の適切な表示
- セキュリティ考慮事項の確認
