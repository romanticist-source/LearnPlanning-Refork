"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Target,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
  Send,
  FileText,
  ImageIcon,
} from "lucide-react"
import Header from "@/components/header"
import { Input } from "@/components/ui/input"
import ContributionGraph from "@/components/contribution-graph"
import GoalsList from "@/components/goals-list"
import GroupChatMessages from "@/components/group-chat-messages"
import CreateGoalModal from "@/components/create-goal-modal"
import CreateEventModal from "@/components/create-event-modal"
import InviteMemberForm from "@/components/invite-member-form"
import { useState } from "react"

export default function GroupPage({ params }: { params: { id: string } }) {
  // この例では、グループIDに基づいてグループデータをフェッチする代わりに、
  // ハードコードされたデータを使用します
  const groupData = {
    id: params.id,
    name: "プログラミング勉強会",
    description:
      "プログラミングの基礎から応用までを学ぶグループです。初心者から上級者まで、一緒にスキルアップを目指しましょう。",
    createdAt: "2025年1月15日",
    members: [
      { id: "1", name: "田中太郎", role: "管理者", avatar: "/diverse-user-avatars.png" },
      { id: "2", name: "佐藤花子", role: "メンバー", avatar: "/diverse-user-avatars.png" },
      { id: "3", name: "鈴木一郎", role: "メンバー", avatar: "/diverse-user-avatars.png" },
      { id: "4", name: "高橋和子", role: "メンバー", avatar: "/diverse-user-avatars.png" },
      { id: "5", name: "伊藤健太", role: "メンバー", avatar: "/diverse-user-avatars.png" },
      { id: "6", name: "渡辺美咲", role: "メンバー", avatar: "/diverse-user-avatars.png" },
    ],
    goals: 12,
    completedGoals: 5,
    activity: "高",
    meetingSchedule: "毎週水曜日 20:00-21:30",
    tags: ["プログラミング", "JavaScript", "Python", "アルゴリズム", "Web開発"],
  }

  const [showInviteForm, setShowInviteForm] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div className="w-full md:w-2/3">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{groupData.name}</h1>
                <p className="text-gray-500">作成日: {groupData.createdAt}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{groupData.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {groupData.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">メンバー</span>
                </div>
                <p className="text-2xl font-bold">{groupData.members.length}人</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">目標達成率</span>
                </div>
                <p className="text-2xl font-bold">{Math.round((groupData.completedGoals / groupData.goals) * 100)}%</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">ミーティング</span>
                </div>
                <p className="text-sm font-medium">{groupData.meetingSchedule}</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/3 bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">メンバー</h2>
              <Button variant="outline" size="sm" onClick={() => setShowInviteForm(!showInviteForm)}>
                <Plus className="h-4 w-4 mr-1" />
                招待
              </Button>
            </div>
            {showInviteForm ? (
              <div className="mb-4">
                <InviteMemberForm />
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setShowInviteForm(false)}>
                  キャンセル
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {groupData.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    {member.role === "管理者" && (
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">管理者</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="chat">
          <TabsList className="mb-6">
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              チャット
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              グループ目標
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              スケジュール
            </TabsTrigger>
            <TabsTrigger value="activity">
              <BarChart3 className="h-4 w-4 mr-2" />
              活動記録
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              設定
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>グループチャット</CardTitle>
                <CardDescription>メンバーとコミュニケーションを取りましょう</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col h-[500px]">
                  <div className="flex-1 overflow-y-auto mb-4">
                    <GroupChatMessages groupId={params.id} />
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="shrink-0">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Input placeholder="メッセージを入力..." className="flex-1" />
                    <Button size="icon" className="shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>グループ目標</CardTitle>
                  <CardDescription>グループで設定した学習目標</CardDescription>
                </div>
                <CreateGoalModal />
              </CardHeader>
              <CardContent>
                <GoalsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>グループスケジュール</CardTitle>
                  <CardDescription>学習ミーティングやイベントのスケジュール</CardDescription>
                </div>
                <CreateEventModal />
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                  <h3 className="font-medium mb-2">次回のミーティング</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <span>2025年5月15日（水）20:00-21:30</span>
                  </div>
                  <p className="text-gray-600 mb-3">テーマ: Reactフックの基本と応用</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      詳細
                    </Button>
                    <Button size="sm">参加する</Button>
                  </div>
                </div>

                <h3 className="font-medium mb-3">今後のスケジュール</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">JavaScriptの非同期処理</h4>
                        <span className="text-sm text-gray-500">5月22日（水）</span>
                      </div>
                      <p className="text-sm text-gray-600">Promise、async/await、コールバックについて学びます</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">20:00-21:30</span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          ミーティング
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Target className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Todoアプリ制作締切</h4>
                        <span className="text-sm text-gray-500">5月25日（土）</span>
                      </div>
                      <p className="text-sm text-gray-600">JavaScriptを使ったTodoアプリの提出期限です</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">終日</span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">締切</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">コードレビュー会</h4>
                        <span className="text-sm text-gray-500">5月29日（水）</span>
                      </div>
                      <p className="text-sm text-gray-600">作成したTodoアプリのコードレビューを行います</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">20:00-22:00</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">イベント</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>活動記録</CardTitle>
                <CardDescription>グループメンバーの学習活動</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="font-medium mb-3">グループ全体の活動</h3>
                  <ContributionGraph />
                </div>

                <h3 className="font-medium mb-3">メンバー別の活動状況</h3>
                <div className="space-y-4">
                  {groupData.members.map((member) => (
                    <div key={member.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">今週の活動</span>
                      </div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium w-24">学習時間:</span>
                        <Progress value={Math.random() * 100} className="h-2 flex-1" />
                        <span className="text-sm">{Math.floor(Math.random() * 20) + 5}時間</span>
                      </div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium w-24">達成目標:</span>
                        <Progress value={Math.random() * 100} className="h-2 flex-1" />
                        <span className="text-sm">{Math.floor(Math.random() * 5) + 1}個</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-24">貢献度:</span>
                        <Progress value={Math.random() * 100} className="h-2 flex-1" />
                        <span className="text-sm">{Math.floor(Math.random() * 100)}ポイント</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>グループ設定</CardTitle>
                <CardDescription>グループの設定を管理します</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">基本情報</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium block mb-1">グループ名</label>
                        <Input defaultValue={groupData.name} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">説明</label>
                        <Input defaultValue={groupData.description} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">ミーティングスケジュール</label>
                        <Input defaultValue={groupData.meetingSchedule} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">通知設定</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>チャットメッセージ</span>
                        <Button variant="outline" size="sm">
                          有効
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>目標リマインダー</span>
                        <Button variant="outline" size="sm">
                          有効
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ミーティング通知</span>
                        <Button variant="outline" size="sm">
                          有効
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">権限設定</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>メンバーの招待</span>
                        <Button variant="outline" size="sm">
                          管理者のみ
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>目標の作成</span>
                        <Button variant="outline" size="sm">
                          全員
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>スケジュールの編集</span>
                        <Button variant="outline" size="sm">
                          管理者のみ
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium text-red-600 mb-3">危険な操作</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                        グループを退会する
                      </Button>
                      <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                        グループを削除する
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
