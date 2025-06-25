"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Target, Users, BarChart3, MessageSquare, Plus } from "lucide-react"
import ContributionGraph from "@/components/contribution-graph"
import PaizaContributionGraph from "@/components/paiza-contribution-graph"
import PaizaActivityForm from "@/components/paiza-activity-form"
import GoalsList from "@/components/goals-list"
import UpcomingReminders from "@/components/upcoming-reminders"
import GroupActivity from "@/components/group-activity"
import Header from "@/components/header"
import CreateGoalModal from "@/components/create-goal-modal"
import CreateQuestionModal from "@/components/create-question-modal"
import ScheduleView from "@/components/schedule-view"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"

interface DashboardStats {
  studyHours: number
  studyHoursChange: number
  completedGoals: number
  goalProgress: number
  activeGroups: number
  totalMembers: number
  groups: Group[]
}

interface Group {
  id: string
  name: string
  memberCount: number
}

interface Discussion {
  id: string
  title: string
  content: string
  groupName: string
  createdAt: string
  answerCount: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [paizaGraphKey, setPaizaGraphKey] = useState(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 統計情報とユーザー情報を並行取得
        const [statsResponse, userResponse] = await Promise.all([
          fetch('/api/stats?type=dashboard'),
          fetch('/api/users/me')
        ])

        if (statsResponse.ok) {
          const dashboardStats = await statsResponse.json()
          setStats(dashboardStats)
        }

        if (userResponse.ok) {
          const user = await userResponse.json()
          setCurrentUser(user)
        }

        // TODO: ディスカッションAPIから取得
        setDiscussions([])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handlePaizaActivityAdded = () => {
    // Paizaグラフを更新するためにkeyを変更
    setPaizaGraphKey(prev => prev + 1)
    
    // 統計も再取得
    fetch('/api/stats?type=dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to refresh stats:', err))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

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
              <div className="text-3xl font-bold">{stats?.studyHours || 0}時間</div>
              <p className="text-sm text-emerald-600">先週より+{stats?.studyHoursChange || 0}時間</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">達成した目標</CardTitle>
              <CardDescription>今月</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.completedGoals || 0}個</div>
              <p className="text-sm text-emerald-600">目標の{stats?.goalProgress || 0}%を達成</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">グループ活動</CardTitle>
              <CardDescription>アクティブなグループ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.activeGroups || 0}グループ</div>
              <p className="text-sm text-gray-500">{stats?.totalMembers || 0}人のメンバーと学習中</p>
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
            <div className="space-y-6">
              {/* Paizaコントリビューショングラフ */}
              <Card>
                <CardHeader>
                  <CardTitle>Paiza学習活動</CardTitle>
                  <CardDescription>Paizaでの学習活動を記録・可視化</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentUser && (
                      <PaizaActivityForm 
                        userId={currentUser.id}
                        onActivityAdded={handlePaizaActivityAdded} 
                      />
                    )}
                    {currentUser && (
                      <PaizaContributionGraph 
                        key={paizaGraphKey}
                        userId={currentUser.id} 
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 全般的なコントリビューショングラフ */}
              <Card>
                <CardHeader>
                  <CardTitle>学習活動履歴</CardTitle>
                  <CardDescription>全体的な学習活動の可視化</CardDescription>
                </CardHeader>
                <CardContent>
                  <ContributionGraph />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>最近の目標</CardTitle>
                    <CardDescription>進行中の学習目標</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GoalsList status="active" />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>今後の予定</CardTitle>
                    <CardDescription>締切が近づいている目標</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UpcomingReminders />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>参加中のグループ</CardTitle>
                    <CardDescription>あなたが参加しているグループの一覧</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.groups?.map((group) => (
                        <Link key={group.id} href={`/groups/${group.id}`}>
                          <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">{group.name}</h3>
                                <p className="text-sm text-gray-500">{group.memberCount}人のメンバー</p>
                              </div>
                              <Users className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </Link>
                      ))}
                      {(!stats?.groups || stats.groups.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <p>参加しているグループがありません</p>
                          <p className="text-sm mt-2">
                            <Link href="/groups" className="text-blue-600 hover:underline">
                              グループページ
                            </Link>
                            でグループを探してみましょう
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>最近の活動</CardTitle>
                    <CardDescription>グループでの最新の活動</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GroupActivity limit={5} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discussions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>最新のディスカッション</CardTitle>
                      <CardDescription>グループで活発に議論されているトピック</CardDescription>
                    </div>
                    <CreateQuestionModal />
                  </CardHeader>
                  <CardContent>
                    {discussions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>ディスカッションがまだありません</p>
                        <p className="text-sm mt-2">質問を投稿して議論を始めましょう</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {discussions.map((discussion) => (
                          <div key={discussion.id} className="border-b pb-4 last:border-b-0">
                            <h3 className="font-medium mb-2">{discussion.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {discussion.content.substring(0, 100)}...
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{discussion.groupName}</span>
                              <span>{discussion.answerCount}件の回答</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>スケジュール</CardTitle>
                    <CardDescription>今日の予定</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 rounded"></div>}>
                      <ScheduleView />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
