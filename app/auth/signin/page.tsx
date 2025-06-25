import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Github, Target, Users, BarChart3, Calendar } from "lucide-react"
import { SignInButton } from "@/components/auth/auth-button"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* ヘッダー */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Target className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Learn Planning</h1>
              <p className="text-sm text-gray-500">グループ学習管理プラットフォーム</p>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              ホームに戻る
            </Button>
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* 左側：サインインフォーム */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                学習の旅を<br />
                始めましょう
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                グループで学習目標を設定し、共に成長していくプラットフォームへようこそ。
                GitHubアカウントで簡単にサインインできます。
              </p>
            </div>

            <Card className="w-full max-w-md mx-auto lg:mx-0 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="bg-emerald-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Github className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">サインイン</CardTitle>
                <CardDescription className="text-gray-600">
                  GitHubアカウントでサインインしてください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SignInButton />
                <p className="text-xs text-gray-500 text-center">
                  サインインすることで、
                  <Link href="#" className="text-emerald-600 hover:underline">利用規約</Link>
                  および
                  <Link href="#" className="text-emerald-600 hover:underline">プライバシーポリシー</Link>
                  に同意したものとみなされます。
                </p>
              </CardContent>
            </Card>

            {/* 機能ハイライト */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="text-center p-4 bg-white/60 rounded-lg border">
                <Users className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">グループ学習</p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-lg border">
                <BarChart3 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">進捗可視化</p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-lg border">
                <Calendar className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">スケジュール管理</p>
              </div>
            </div>
          </div>

          {/* 右側：イメージと説明 */}
          <div className="space-y-8">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-emerald-100 to-blue-100">
              <Image
                src="/modern-classroom-study.png"
                alt="グループ学習のイメージ"
                fill
                className="object-contain p-8"
                priority
              />
            </div>

            {/* 特徴リスト */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Learn Planningの特徴</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">共同学習</p>
                    <p className="text-sm text-gray-600">仲間と一緒に学習目標を設定し、お互いを励まし合いながら成長できます</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">進捗の可視化</p>
                    <p className="text-sm text-gray-600">学習活動をコントリビューショングラフで可視化し、モチベーションを維持</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">スケジュール管理</p>
                    <p className="text-sm text-gray-600">学習計画を立てて実行し、リマインダーで習慣化をサポート</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-auto border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Target className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-gray-900">Learn Planning</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="#" className="hover:text-emerald-600 transition-colors">利用規約</Link>
              <Link href="#" className="hover:text-emerald-600 transition-colors">プライバシーポリシー</Link>
              <Link href="#" className="hover:text-emerald-600 transition-colors">お問い合わせ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 