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
  Settings,
  Plus,
  Send,
  FileText,
  ImageIcon,
} from "lucide-react"
import Header from "@/components/header"
import { Input } from "@/components/ui/input"

import GoalsList from "@/components/goals-list"
import GroupChatMessages from "@/components/group-chat-messages"
import CreateGoalModal from "@/components/create-goal-modal"
import CreateEventModal from "@/components/create-event-modal"
import InviteMemberForm from "@/components/invite-member-form"
import GroupSchedule from "@/components/group-schedule"
import { useState, useEffect, use } from "react"

interface GroupMember {
  id: string
  name: string
  role: string
  avatar?: string
}

interface GroupData {
  id: string
  name: string
  description: string
  createdAt: string
  ownerId: string
  isPublic: boolean
  memberCount: number
  tags?: string[]
  goalCompletionRate?: number
  meetingInfo?: string
  activity?: string
  members?: GroupMember[]
}

interface GroupMembership {
  id: string
  userId: string
  role: string
  joinedAt: string
}

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [groupData, setGroupData] = useState<GroupData | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showInviteForm, setShowInviteForm] = useState(false)

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true)
        
        // グループ詳細情報を取得（メンバー情報も含まれる）
        const groupResponse = await fetch(`/api/groups/${resolvedParams.id}`)
        
        if (!groupResponse.ok) {
          if (groupResponse.status === 404) {
            setError('グループが見つかりません')
          } else if (groupResponse.status === 403) {
            setError('このグループにアクセスする権限がありません')
          } else {
            setError('グループ情報の取得に失敗しました')
          }
          return
        }

        const group = await groupResponse.json()
        setGroupData(group)
        
        // メンバー情報がレスポンスに含まれている場合は使用
        if (group.members) {
          setMembers(group.members)
        } else {
                     // フォールバック: 個別にメンバー情報を取得
           try {
             const membersResponse = await fetch(`/api/groups/${resolvedParams.id}/members`)
             if (membersResponse.ok) {
               const membersData = await membersResponse.json()
               setMembers(membersData)
             }
           } catch (error) {
             console.error('メンバー情報の取得に失敗:', error)
           }
        }

                 // 目標情報を取得
         try {
           const goalsResponse = await fetch(`/api/goals?groupId=${resolvedParams.id}`)
           if (goalsResponse.ok) {
             const goalsData = await goalsResponse.json()
             setGoals(goalsData)
           }
         } catch (error) {
           console.error('目標情報の取得に失敗:', error)
         }
        
      } catch (error) {
        console.error('Failed to fetch group data:', error)
        setError('データの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchGroupData()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-200 rounded-full h-16 w-16"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !groupData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{error || 'グループが見つかりません'}</h1>
            <p className="text-gray-600 mb-4">指定されたグループは存在しないか、アクセス権限がありません。</p>
            <Button asChild>
              <a href="/dashboard">ダッシュボードに戻る</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const completedGoals = goals.filter(goal => goal.completed).length
  const goalCompletionRate = groupData.goalCompletionRate !== undefined 
    ? groupData.goalCompletionRate 
    : (goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0)

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
                <p className="text-gray-500">作成日: {new Date(groupData.createdAt).toLocaleDateString('ja-JP')}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{groupData.description}</p>

            {groupData.tags && groupData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {groupData.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">メンバー</span>
                </div>
                <p className="text-2xl font-bold">{groupData.memberCount || members.length}人</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">目標達成率</span>
                </div>
                <p className="text-2xl font-bold">{goalCompletionRate}%</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">ミーティング</span>
                </div>
                <p className="text-sm font-medium">{groupData.meetingInfo || '設定されていません'}</p>
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
                {members.length > 0 ? (
                  members.map((member) => (
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
                      {member.role === "admin" && (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">管理者</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">メンバー情報を読み込み中...</p>
                  </div>
                )}
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
                    <GroupChatMessages groupId={resolvedParams.id} />
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
                <GoalsList groupId={resolvedParams.id} />
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
                <GroupSchedule groupId={resolvedParams.id} />
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
                        <Input defaultValue={groupData.name} readOnly />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">説明</label>
                        <Input defaultValue={groupData.description} readOnly />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">ミーティングスケジュール</label>
                        <Input defaultValue="設定されていません" readOnly />
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
