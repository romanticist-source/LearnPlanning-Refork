# LearnPlanning-Refork

学習計画と進捗管理を行う Web アプリケーション

## 概要

LearnPlanning-Refoark は、個人およびグループでの学習目標設定、進捗追跡、Paiza アクティビティ記録を可能にする Next.js ベースの Web アプリケーションです。

## 主要機能

### ✅ API Route 統合完了

- **認証システム**: NextAuth.js によるセキュアな認証
- **学習目標管理**: 目標の作成、編集、進捗追跡
- **グループ機能**: グループ作成、参加、活動管理
- **Paiza アクティビティ**: コーディング活動の記録と可視化
- **統計とダッシュボード**: 学習進捗の統計表示
- **リマインダー**: 期限が近い目標の通知

### API エンドポイント

#### 認証

- `/api/auth/` - NextAuth.js 認証エンドポイント

#### ユーザー管理

- `GET /api/users/me` - 現在のユーザー情報取得
- `PUT /api/users/me` - ユーザー情報更新

#### 学習目標

- `GET /api/goals` - 目標一覧取得（フィルタリング対応）
- `POST /api/goals` - 新しい目標作成

#### グループ管理

- `GET /api/groups` - グループ一覧取得（タイプ別フィルタリング）
- `POST /api/groups` - 新しいグループ作成

#### 招待管理

- `GET /api/invitations` - 招待一覧取得
- `PUT /api/invitations/[id]` - 招待への回答

#### Paiza 活動

- `GET /api/paiza-activities` - Paiza アクティビティ取得
- `POST /api/paiza-activities` - 新しいアクティビティ記録

#### 統計情報

- `GET /api/stats?type=dashboard` - ダッシュボード統計
- `GET /api/stats?type=paiza` - Paiza 統計

#### アクティビティ

- `GET /api/activities` - グループアクティビティ取得
- `POST /api/activities` - 新しいアクティビティ作成

## 技術スタック

- **フロントエンド**: Next.js 14, React, TypeScript
- **スタイリング**: Tailwind CSS, shadcn/ui
- **認証**: NextAuth.js
- **データ可視化**: Canvas API (コントリビューショングラフ)
- **API**: Next.js API Routes
- **バックエンド**: JSON Server (開発時)

## セットアップ

1. 依存関係のインストール:

```bash
pnpm install
```

2. 環境変数の設定:

```bash
cp env.example .env.local
```

3. データベースのセットアップ:

```bash
node setup-database.js
```

4. 開発サーバーの起動:

```bash
# JSON Server（バックエンド）
pnpm run json-server

# Next.js開発サーバー
pnpm run dev
```

## 環境変数

```env
# NextAuth.js
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3005
```

## プロジェクト構造

```
├── app/
│   ├── api/           # API Routes
│   ├── dashboard/     # ダッシュボードページ
│   ├── goals/         # 目標管理ページ
│   ├── groups/        # グループ管理ページ
│   └── layout.tsx     # ルートレイアウト
├── components/        # 再利用可能コンポーネント
│   ├── ui/           # shadcn/ui コンポーネント
│   └── ...           # 各種機能コンポーネント
└── lib/              # ユーティリティ関数
```

## データベース構造

JSON ファイルベースのデータ構造：

- `users` - ユーザー情報
- `goals` - 学習目標
- `groups` - グループ情報
- `group_members` - グループメンバーシップ
- `invitations` - グループ招待
- `paiza_activities` - Paiza アクティビティ記録
- `paiza_user_stats` - Paiza 統計情報
- `activities` - グループアクティビティ

## 機能詳細

### ダッシュボード

- 学習統計の表示
- Paiza コントリビューショングラフ
- 目標進捗表示
- グループ活動一覧

### 目標管理

- 個人目標とグループ目標
- サブ目標対応
- 進捗追跡
- 期限管理

### グループ機能

- グループ作成・参加
- メンバー招待
- グループ目標共有
- 活動追跡
