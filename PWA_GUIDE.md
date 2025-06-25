# PWA（Progressive Web App）機能

## 概要
LearnPlanningアプリをPWA（Progressive Web App）として実装しました。これにより、ネイティブアプリのような体験をWebアプリで提供できます。

## PWA機能一覧

### 📱 **インストール機能**
- **ホーム画面への追加**: ブラウザの「ホーム画面に追加」でアプリをインストール
- **自動インストールプロンプト**: 条件を満たすと自動でインストール案内を表示
- **ショートカット**: ダッシュボード、目標、グループへの直接アクセス

### 🔄 **オフライン対応**
- **Service Worker**: リソースをキャッシュしてオフライン時も基本機能を利用可能
- **オフライン表示**: ネットワーク状況をリアルタイム表示
- **自動同期**: オンライン復帰時にデータを自動同期

### 🔔 **プッシュ通知**
- **リマインダー通知**: イベントやタスクの通知
- **グループ通知**: 招待や更新の通知
- **バックグラウンド動作**: アプリが閉じていても通知を受信

### 🎨 **ネイティブ体験**
- **スタンドアロン表示**: ブラウザUIを非表示にしてアプリ感を演出
- **スプラッシュスクリーン**: 起動時の美しいスプラッシュ画面
- **テーマカラー**: OSに合わせたテーマ色の適用

## インストール方法

### 🌐 **ブラウザからのインストール**

#### Chrome / Edge (Android / Windows)
1. アプリにアクセス
2. アドレスバーの「インストール」アイコンをクリック
3. 「インストール」をクリック

#### Safari (iOS / macOS)
1. アプリにアクセス
2. 共有ボタン（📤）をタップ
3. 「ホーム画面に追加」を選択

#### Firefox
1. アプリにアクセス
2. メニュー（⋮）を開く
3. 「ホーム画面に追加」を選択

### 📲 **自動インストールプロンプト**
アプリを数回使用すると、自動でインストール案内が表示されます。

## 技術実装

### 📄 **マニフェストファイル**
```json
{
  "name": "LearnPlanning - 学習計画支援アプリ",
  "short_name": "LearnPlanning",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#059669",
  "background_color": "#ffffff"
}
```

### ⚙️ **Service Worker機能**
- **キャッシュ戦略**: Cache First + Network Fallback
- **プッシュ通知**: Web Push API
- **バックグラウンド同期**: Background Sync API
- **オフライン対応**: ネットワーク切断時の代替表示

### 🔧 **PWA要件**
- ✅ HTTPS対応
- ✅ マニフェストファイル
- ✅ Service Worker
- ✅ レスポンシブデザイン
- ✅ 十分なメタデータ

## PWA機能の確認

### 🧪 **テストページ**
`/pwa-test` にアクセスして、PWA機能の動作状況を確認できます。

### 📊 **確認項目**
- [ ] アプリがインストール済みか
- [ ] Service Workerが動作しているか
- [ ] プッシュ通知が許可されているか
- [ ] オンライン/オフライン状況
- [ ] キャッシュ機能

### 🛠 **デバッグツール**
- **Chrome DevTools**: Application タブでPWA情報を確認
- **Lighthouse**: PWA スコアを測定
- **PWA Builder**: Microsoft のPWA検証ツール

## 対応ブラウザ

### ✅ **完全対応**
- Chrome 67+
- Edge 79+
- Firefox 44+
- Safari 11.1+

### ⚠️ **一部対応**
- Internet Explorer: 非対応
- 古いブラウザ: 基本機能のみ

## トラブルシューティング

### 🔧 **よくある問題**

#### インストールプロンプトが表示されない
- HTTPSで接続しているか確認
- Service Workerが正常に登録されているか確認
- マニフェストファイルにエラーがないか確認

#### オフライン時に動作しない
- Service Workerが有効か確認
- キャッシュが正常に作成されているか確認
- ネットワークタブでキャッシュヒット状況を確認

#### プッシュ通知が来ない
- 通知許可が与えられているか確認
- Service Workerが動作しているか確認
- VAPID設定が正しいか確認

### 🔍 **デバッグ方法**
1. Chrome DevTools → Application → Service Workers
2. Chrome DevTools → Application → Manifest
3. Chrome DevTools → Network → Disable cache でテスト
4. Lighthouse でPWAスコアを確認

## 本番環境での注意点

### 🚀 **デプロイ時**
- HTTPS必須
- 適切なCache-Controlヘッダー
- Service Workerの更新戦略
- CDNでのキャッシュ設定

### 📈 **パフォーマンス最適化**
- Critical Resource Hints
- Code Splitting
- Image Optimization
- Service Worker Precaching

これでLearnPlanningが完全なPWAとして動作し、ユーザーにネイティブアプリと同等の体験を提供できます！
