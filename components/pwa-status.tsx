"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Download, 
  Wifi, 
  Bell, 
  Zap, 
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function PWAStatus() {
  const [pwaStatus, setPwaStatus] = useState({
    isInstalled: false,
    hasServiceWorker: false,
    hasNotifications: false,
    isOnline: navigator?.onLine || false,
    installPromptAvailable: false
  });

  useEffect(() => {
    // Check if PWA is installed
    const checkInstalled = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      setPwaStatus(prev => ({ ...prev, isInstalled }));
    };

    // Check Service Worker
    const checkServiceWorker = () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      setPwaStatus(prev => ({ ...prev, hasServiceWorker }));
    };

    // Check Notifications
    const checkNotifications = () => {
      const hasNotifications = 'Notification' in window && Notification.permission === 'granted';
      setPwaStatus(prev => ({ ...prev, hasNotifications }));
    };

    // Check online status
    const handleOnlineStatus = () => {
      setPwaStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    // Check install prompt
    const handleBeforeInstallPrompt = () => {
      setPwaStatus(prev => ({ ...prev, installPromptAvailable: true }));
    };

    checkInstalled();
    checkServiceWorker();
    checkNotifications();
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="h-5 w-5 text-green-600" /> : 
      <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusBadge = (status: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="ml-2">
        {status ? trueText : falseText}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            PWA ステータス
          </CardTitle>
          <CardDescription>
            Progressive Web App の機能状況を確認できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* インストール状況 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(pwaStatus.isInstalled)}
              <div>
                <p className="font-medium">アプリのインストール</p>
                <p className="text-sm text-gray-600">ホーム画面に追加済み</p>
              </div>
            </div>
            {getStatusBadge(pwaStatus.isInstalled, "インストール済み", "未インストール")}
          </div>

          {/* Service Worker */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(pwaStatus.hasServiceWorker)}
              <div>
                <p className="font-medium">Service Worker</p>
                <p className="text-sm text-gray-600">オフライン機能とキャッシュ</p>
              </div>
            </div>
            {getStatusBadge(pwaStatus.hasServiceWorker, "有効", "無効")}
          </div>

          {/* プッシュ通知 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(pwaStatus.hasNotifications)}
              <div>
                <p className="font-medium">プッシュ通知</p>
                <p className="text-sm text-gray-600">リマインダーと更新通知</p>
              </div>
            </div>
            {getStatusBadge(pwaStatus.hasNotifications, "許可済み", "未許可")}
          </div>

          {/* オンライン状況 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {pwaStatus.isOnline ? 
                <Wifi className="h-5 w-5 text-green-600" /> : 
                <AlertCircle className="h-5 w-5 text-amber-600" />
              }
              <div>
                <p className="font-medium">ネットワーク接続</p>
                <p className="text-sm text-gray-600">インターネット接続状況</p>
              </div>
            </div>
            {getStatusBadge(pwaStatus.isOnline, "オンライン", "オフライン")}
          </div>

          {/* PWA機能テスト */}
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              PWA機能テスト
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                ページリロード
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready.then(() => {
                      alert('Service Worker は正常に動作しています');
                    });
                  }
                }}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                SW動作確認
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  fetch('/api/test-notification', { method: 'POST' })
                    .then(() => alert('テスト通知を送信しました'))
                    .catch(() => alert('通知送信に失敗しました'));
                }}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                通知テスト
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  // キャッシュクリア
                  if ('caches' in window) {
                    caches.keys().then((names) => {
                      names.forEach(name => {
                        caches.delete(name);
                      });
                      alert('キャッシュをクリアしました');
                    });
                  }
                }}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                キャッシュクリア
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
