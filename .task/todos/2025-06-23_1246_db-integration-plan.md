# DB統合実装計画 - TODOリスト

## セッション概要
- 日付: 2025-06-23 12:46
- 目的: 既存UIをDB接続に変更し完全な機能を実装
- 現状: UIは完成、ダミーデータ使用中

## 実装タスク一覧

### 1. ユーザー認証とセッション管理 【高優先度】

#### 1-1. NextAuth.js完全設定
- [ ] GitHub OAuth設定完了確認
- [ ] 環境変数設定 (AUTH_GITHUB_ID, AUTH_GITHUB_SECRET)
- [ ] NextAuth設定の検証とテスト
- [ ] `app/api/auth/[...nextauth]/route.ts` の実装確認

#### 1-2. ユーザープロファイル管理
- [ ] User モデルをdb.jsonに追加
- [ ] ユーザー登録API実装 (POST /api/users)
- [ ] ユーザー情報取得API実装 (GET /api/users/me)
- [ ] プロファイル更新API実装 (PUT /api/users/me)

#### 1-3. セッション状態管理
- [ ] components/auth/auth-button.tsx の実装確認
- [ ] ログイン状態のUI表示修正
- [ ] セッション保護されたページの実装

### 2. 目標管理API実装 【高優先度】

#### 2-1. データモデル設計
- [ ] goals テーブル設計 (db.json)
- [ ] subgoals 関連データ構造設計
- [ ] 進捗計算ロジック設計

#### 2-2. 目標CRUD API実装
- [ ] 目標作成API (POST /api/goals)
- [ ] 目標一覧取得API (GET /api/goals)
- [ ] 目標詳細取得API (GET /api/goals/:id)
- [ ] 目標更新API (PUT /api/goals/:id)
- [ ] 目標削除API (DELETE /api/goals/:id)

#### 2-3. UI統合
- [ ] CreateGoalModal のform送信処理実装
- [ ] GoalsList コンポーネントのAPI連携
- [ ] 進捗更新機能の実装
- [ ] エラーハンドリングとローディング状態

### 3. グループ管理API実装 【高優先度】

#### 3-1. データモデル設計
- [ ] groups テーブル設計
- [ ] group_members 関連テーブル設計
- [ ] 招待システムのデータ構造設計

#### 3-2. グループCRUD API実装
- [ ] グループ作成API (POST /api/groups)
- [ ] グループ一覧取得API (GET /api/groups)
- [ ] グループ詳細取得API (GET /api/groups/:id)
- [ ] グループ更新API (PUT /api/groups/:id)
- [ ] グループ削除API (DELETE /api/groups/:id)

#### 3-3. メンバーシップ管理API
- [ ] メンバー招待API (POST /api/groups/:id/invite)
- [ ] 参加リクエストAPI (POST /api/groups/:id/join)
- [ ] 招待承認/拒否API (PUT /api/invitations/:id)
- [ ] メンバー除名API (DELETE /api/groups/:id/members/:userId)

#### 3-4. UI統合
- [ ] CreateGroupModal のform送信処理実装
- [ ] app/groups/page.tsx のAPI連携
- [ ] app/groups/[id]/page.tsx のデータ取得実装
- [ ] 招待機能の実装

### 4. チャット・メッセージ機能実装 【中優先度】

#### 4-1. メッセージデータモデル
- [ ] messages テーブル設計
- [ ] ファイル添付データ構造設計

#### 4-2. メッセージAPI実装
- [ ] メッセージ送信API (POST /api/groups/:id/messages)
- [ ] メッセージ取得API (GET /api/groups/:id/messages)
- [ ] メッセージ削除API (DELETE /api/messages/:id)

#### 4-3. リアルタイム機能
- [ ] WebSocket または Server-Sent Events実装
- [ ] リアルタイムメッセージ受信機能

#### 4-4. UI統合
- [ ] GroupChatMessages コンポーネントのAPI連携
- [ ] メッセージ送信フォームの実装
- [ ] ファイル添付機能の実装

### 5. スケジュール・イベントAPI実装 【中優先度】

#### 5-1. イベントデータモデル
- [ ] events テーブル設計
- [ ] リマインダー設定データ構造

#### 5-2. イベントAPI実装
- [ ] イベント作成API (POST /api/events)
- [ ] イベント取得API (GET /api/events)
- [ ] イベント更新API (PUT /api/events/:id)
- [ ] イベント削除API (DELETE /api/events/:id)

#### 5-3. UI統合
- [ ] CreateEventModal のform送信処理実装
- [ ] ScheduleView コンポーネントのAPI連携
- [ ] カレンダー表示機能の実装

### 6. 学習活動記録と統計API実装 【低優先度】

#### 6-1. 活動記録データモデル
- [ ] activities テーブル設計
- [ ] 統計データ集計設計

#### 6-2. 活動記録API実装
- [ ] 活動記録API (POST /api/activities)
- [ ] 活動履歴取得API (GET /api/activities)
- [ ] 統計データAPI (GET /api/statistics)

#### 6-3. 外部API連携
- [ ] paiza API連携設定
- [ ] 学習データ同期機能

#### 6-4. UI統合
- [ ] ContributionGraph コンポーネントのAPI連携
- [ ] GroupActivity コンポーネントの実装
- [ ] ダッシュボード統計表示の実装

## 実装順序
1. 認証システム → 目標管理 → グループ管理 → チャット → スケジュール → 統計

## 注意事項
- 各段階でテストを実施
- エラーハンドリングを適切に実装
- ローディング状態の適切な表示
- セキュリティ考慮事項の確認