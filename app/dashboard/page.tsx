"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Target, Users, BarChart3, MessageSquare, Plus } from "lucide-react"
import ContributionGraph from "@/components/contribution-graph"
import PaizaContributionGraph from "@/components/paiza-contribution-graph"
import PaizaActivityModal from "@/components/paiza-activity-modal"
import GoalsList from "@/components/goals-list"
import UpcomingReminders from "@/components/upcoming-reminders"

import Header from "@/components/header"
import CreateGoalModal from "@/components/create-goal-modal"
import CreateQuestionModal from "@/components/create-question-modal"
import ScheduleView from "@/components/schedule-view"
import DiscussionDetailModal from "@/components/discussion-detail-modal"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"

interface DashboardStats {
  studyHours: number
  studyHoursChange: number
  completedGoals: number
  goalProgress: number
  activeGroups: number
  totalMembers: number
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
  const [groups, setGroups] = useState<Group[]>([])
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [paizaGraphKey, setPaizaGraphKey] = useState(0)
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null)
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 統計情報を取得（実際のAPIではこれらを個別に取得）
        const [goalsResponse, groupsResponse, userResponse] = await Promise.all([
          fetch('/api/goals'),
          fetch('/api/groups?type=my'),
          fetch('/api/users/me')
        ])

        if (goalsResponse.ok && groupsResponse.ok) {
          const goals = await goalsResponse.json()
          const userGroups = await groupsResponse.json()
          
          // ユーザー情報を設定
          if (userResponse.ok) {
            const user = await userResponse.json()
            setCurrentUser(user)
          }

          // 統計を計算
          const completedGoals = goals.filter((goal: any) => goal.completed).length
          const totalGoals = goals.length
          const goalProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
          const totalMembers = userGroups.reduce((sum: number, group: any) => sum + (group.memberCount || 0), 0)

          setStats({
            studyHours: 12.5, // TODO: 実際の学習時間APIから取得
            studyHoursChange: 2.3, // TODO: 実際の変化量APIから取得
            completedGoals,
            goalProgress,
            activeGroups: userGroups.length,
            totalMembers
          })

          setGroups(userGroups)
        }

        // ディスカッション（質問）データを取得
        try {
          const questionsResponse = await fetch('/api/questions')
          if (questionsResponse.ok) {
            const questions = await questionsResponse.json()
            // 質問データをディスカッション形式に変換
            const formattedDiscussions: Discussion[] = questions.map((q: any) => ({
              id: q.id,
              title: q.title,
              content: q.content,
              groupName: q.groupId ? `グループ ${q.groupId}` : '全体',
              createdAt: new Date(q.createdAt).toLocaleDateString('ja-JP'),
              answerCount: 0 // TODO: 回答数を実装
            }))
            setDiscussions(formattedDiscussions)
          }
        } catch (error) {
          console.error('Failed to fetch discussions:', error)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
        
        {/* ディスカッション詳細モーダル */}
        <DiscussionDetailModal
          discussionId={selectedDiscussionId}
          open={discussionModalOpen}
          onOpenChange={setDiscussionModalOpen}
        />
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Paiza学習活動</CardTitle>
                    <CardDescription>Paizaでの学習活動を記録・可視化</CardDescription>
                  </div>
                  {currentUser && (
                    <PaizaActivityModal 
                      userId={currentUser.id} 
                      onActivityAdded={() => setPaizaGraphKey(prev => prev + 1)}
                    />
                  )}
                </CardHeader>
                <CardContent>
                  {currentUser && (
                    <Suspense fallback={<div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md"></div>}>
                      <PaizaContributionGraph 
                        userId={currentUser.id} 
                        key={paizaGraphKey}
                      />
                    </Suspense>
                  )}
                </CardContent>
              </Card>

            </div>
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
                  {groups.length > 0 ? (
                    <ul className="space-y-4">
                      {groups.map((group) => (
                        <li key={group.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2 rounded-full">
                              <Users className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium">{group.name}</p>
                              <p className="text-sm text-gray-500">メンバー: {group.memberCount}人</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/groups/${group.id}`}>表示</Link>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>まだグループに参加していません</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    新しいグループを作成
                  </Button>
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
                {discussions.length > 0 ? (
                  <ul className="space-y-4">
                    {discussions.map((discussion, index) => (
                      <li key={discussion.id} className={index < discussions.length - 1 ? "border-b pb-4" : ""}>
                        <div 
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          onClick={() => {
                            setSelectedDiscussionId(discussion.id)
                            setDiscussionModalOpen(true)
                          }}
                        >
                          <div className="flex justify-between mb-2">
                            <p className="font-medium hover:text-blue-600">{discussion.title}</p>
                            <span className="text-sm text-gray-500">{discussion.createdAt}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{discussion.content}</p>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">{discussion.groupName}</span>
                            <span className="text-sm text-gray-500">回答: {discussion.answerCount}件</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>まだディスカッションがありません</p>
                  </div>
                )}
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
