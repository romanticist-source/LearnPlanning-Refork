import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Target, Users, BarChart3, MessageSquare, Plus } from "lucide-react"
import ContributionGraph from "@/components/contribution-graph"
import GoalsList from "@/components/goals-list"
import UpcomingReminders from "@/components/upcoming-reminders"
import GroupActivity from "@/components/group-activity"
import Header from "@/components/header"
import CreateGoalModal from "@/components/create-goal-modal"
import CreateQuestionModal from "@/components/create-question-modal"
import ScheduleView from "@/components/schedule-view"
import { Suspense } from "react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">ダッシュボード</h1>
            <p className="text-gray-500">学習の進捗状況と目標を管理します</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              スケジュール
            </Button>
            <CreateGoalModal />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">学習時間</CardTitle>
              <CardDescription>今週の合計</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12.5時間</div>
              <p className="text-sm text-emerald-600">先週より+2.3時間</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">達成した目標</CardTitle>
              <CardDescription>今月</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8個</div>
              <p className="text-sm text-emerald-600">目標の75%を達成</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">グループ活動</CardTitle>
              <CardDescription>アクティブなグループ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3グループ</div>
              <p className="text-sm text-gray-500">5人のメンバーと学習中</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="progress">
              <BarChart3 className="mr-2 h-4 w-4" />
              進捗状況
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="mr-2 h-4 w-4" />
              学習目標
            </TabsTrigger>
            <TabsTrigger value="groups">
              <Users className="mr-2 h-4 w-4" />
              グループ
            </TabsTrigger>
            <TabsTrigger value="discussions">
              <MessageSquare className="mr-2 h-4 w-4" />
              ディスカッション
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>学習活動の記録</CardTitle>
                <CardDescription>paizaの利用状況に基づいたコントリビューショングラフ</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-[150px] w-full bg-gray-100 animate-pulse rounded-md"></div>}>
                  <ContributionGraph />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>学習目標</CardTitle>
                  <CardDescription>設定した目標と進捗状況</CardDescription>
                </div>
                <CreateGoalModal />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md"></div>}>
                  <GoalsList />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>マイグループ</CardTitle>
                  <CardDescription>参加中のグループ</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-full">
                          <Users className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">プログラミング勉強会</p>
                          <p className="text-sm text-gray-500">メンバー: 6人</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/groups/1">表示</a>
                      </Button>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-full">
                          <Users className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">アルゴリズム特訓</p>
                          <p className="text-sm text-gray-500">メンバー: 4人</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/groups/2">表示</a>
                      </Button>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-full">
                          <Users className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">Web開発チーム</p>
                          <p className="text-sm text-gray-500">メンバー: 5人</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/groups/3">表示</a>
                      </Button>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    新しいグループを作成
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>グループ活動</CardTitle>
                  <CardDescription>最近のアクティビティ</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md"></div>}>
                    <GroupActivity />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="discussions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>ディスカッション</CardTitle>
                  <CardDescription>グループ内の質問と回答</CardDescription>
                </div>
                <CreateQuestionModal />
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="border-b pb-4">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium">再帰関数の最適化について</p>
                      <span className="text-sm text-gray-500">2時間前</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      再帰関数を使ったアルゴリズムの最適化方法について教えてください。
                    </p>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">プログラミング勉強会</span>
                      <span className="text-sm text-gray-500">回答: 3件</span>
                    </div>
                  </li>
                  <li className="border-b pb-4">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium">APIの認証方法について</p>
                      <span className="text-sm text-gray-500">昨日</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">RESTful APIでのJWT認証の実装方法を教えてください。</p>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Web開発チーム</span>
                      <span className="text-sm text-gray-500">回答: 5件</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex justify-between mb-2">
                      <p className="font-medium">ソートアルゴリズムの比較</p>
                      <span className="text-sm text-gray-500">3日前</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      クイックソートとマージソートのパフォーマンス比較について議論しましょう。
                    </p>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">アルゴリズム特訓</span>
                      <span className="text-sm text-gray-500">回答: 8件</span>
                    </div>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  すべての質問を表示
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>今後のリマインダー</CardTitle>
              <CardDescription>スケジュールされた学習タスク</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md"></div>}>
                <UpcomingReminders />
              </Suspense>
            </CardContent>
          </Card>

          <Suspense fallback={<div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-md"></div>}>
            <ScheduleView />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
