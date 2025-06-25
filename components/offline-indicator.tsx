"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    // Initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (!showOfflineMessage) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96">
      <Card className="border border-amber-200 bg-amber-50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-amber-600" />
            <div>
              <CardTitle className="text-lg text-amber-800">
                オフライン
              </CardTitle>
              <CardDescription className="text-amber-700">
                インターネット接続を確認してください
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </Button>
            <div className="flex items-center gap-2 text-sm text-amber-600">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4" />
                  接続済み
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  オフライン
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
