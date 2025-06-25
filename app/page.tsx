"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Target, Calendar, BarChart3, MessageSquare, Bell } from "lucide-react"
import { SignInButton, SignOutButton } from "@/components/auth/auth-button"
import { useState, useEffect } from "react"
import { subscribeUser } from "@/app/action"

// Notification Permission Component
function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission | "default">("default");
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSubscribing(true);
      
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        
        if (result === "granted") {
          // Register with your service worker
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '')
          });
          
          // Send subscription to your server
          const subscriptionResult = await subscribeUser(subscription.toJSON());
          
          if (subscriptionResult.success) {
            new Notification("通知が有効になりました", {
              body: "学習の進捗やリマインダーをお届けします",
              icon: "/icon-192x192.png"
            });
          } else {
            console.error("Failed to register subscription:", subscriptionResult.error);
          }
        }
      } catch (error) {
        console.error("Failed to subscribe to push notifications:", error);
      } finally {
        setIsSubscribing(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg mb-8">
      <h3 className="text-lg font-semibold mb-2">学習リマインダー通知</h3>
      <p className="text-sm text-gray-600 mb-3 text-center">
        通知を有効にして、学習スケジュールのリマインダーを受け取りましょう
      </p>
      <Button 
        onClick={requestPermission} 
        disabled={!("Notification" in window) || permission === "granted" || isSubscribing}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {(() => {
          if (isSubscribing) return "設定中...";
          if (permission === "granted") return "通知は有効です";
          return "通知を有効にする";
        })()}
        <Bell className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

// Helper function for VAPID key conversion
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダー */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Target className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Learn Planning</h1>
              <p className="text-sm text-gray-500">グループ学習管理プラットフォーム</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SignInButton />
            <SignOutButton />
            <Link href="/dashboard">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                ダッシュボードへ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">グループで学習目標を達成しよう</h1>
              <p className="text-lg text-gray-600 mb-8">
                モチベーション維持と進捗管理を支援するプラットフォーム。
                paizaとの連携で学習活動を可視化し、グループでの学習効果を最大化します。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    今すぐ始める
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  詳細を見る
                </Button>
              </div>
              
              {/* Add notification permission component */}
              {typeof window !== "undefined" && "Notification" in window && (
                <div className="mt-6">
                  <NotificationPermission />
                </div>
              )}
            </div>
            <div className="relative h-[400px]">
              <Image
                src="/modern-classroom-study.png"
                alt="グループ学習のイメージ"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">主な機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="h-10 w-10 text-emerald-600" />}
              title="学習目標設定"
              description="グループ共通の学習目標と個人の学習目標を設定。目標達成までの期日設定や階層化も可能。"
            />
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-emerald-600" />}
              title="学習スケジューリング"
              description="設定した学習目標に基づき、学習時間や内容をスケジュール化。リマインダー通知で学習の習慣化をサポート。"
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-emerald-600" />}
              title="コントリビューショングラフ"
              description="paizaの利用履歴をAPI連携し、日々の学習活動をGitHubのような形式で可視化。"
            />
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-emerald-600" />}
              title="進捗共有・質疑応答"
              description="学習進捗や成果をグループ内で共有。学習内容に関する疑問点をグループ内で質問・回答。"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-emerald-600" />}
              title="グループ管理"
              description="グループの作成・参加・脱退、メンバーの招待・承認、グループ管理者による権限設定。"
            />
            <FeatureCard
              icon={<Bell className="h-10 w-10 text-emerald-600" />}
              title="プッシュ通知"
              description="学習スケジュールの通知、グループ内の更新やコミュニケーションの通知。オフラインでも最新情報を受け取れます。"
            />
          </div>
        </div>
      </section>

      {/* Rest of the components remain unchanged */}
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  readonly icon: React.ReactNode
  readonly title: string
  readonly description: string
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
