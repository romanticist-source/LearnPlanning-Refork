import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Target, Calendar, BarChart3, MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダー */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-bold">Learn Planning</h1>
          </div>
          <div>
            <Link href="/dashboard">
              <Button>
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
              icon={<ArrowRight className="h-10 w-10 text-emerald-600" />}
              title="API連携"
              description="paiza APIと連携し、学習履歴を自動的に記録。効率的な進捗管理を実現。"
            />
          </div>
        </div>
      </section>

      {/* アピールポイントセクション */}
      <section className="py-16 bg-emerald-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">アピールポイント</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">モチベーション向上</h3>
              <p>グループで共に学習することで、孤独感を解消し、モチベーションを高く維持できます。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">進捗の可視化</h3>
              <p>
                コントリビューショングラフにより、日々の努力が目に見える形で実感でき、達成感と継続意欲に繋がります。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">効率的な学習</h3>
              <p>
                スケジュール機能と進捗共有により、計画的に学習を進め、互いに刺激し合いながら効率的に目標達成を目指せます。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">学習効果の向上</h3>
              <p>質疑応答機能を通じて、疑問点をすぐに解決し、理解を深めることができます。</p>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <Target className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-bold">Learn Planning</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h3 className="font-semibold mb-2">製品</h3>
                <ul className="space-y-1">
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white">
                      機能
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white">
                      料金プラン
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white">
                      API連携
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">会社</h3>
                <ul className="space-y-1">
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white">
                      会社概要
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white">
                      お問い合わせ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white">
                      採用情報
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">リソース</h3>
                <ul className="space-y-1">
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white">
                      ヘルプセンター
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white">
                      ブログ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white">
                      コミュニティ
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center md:text-left">
            <p className="text-gray-400">© 2025 Learn Planning. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
