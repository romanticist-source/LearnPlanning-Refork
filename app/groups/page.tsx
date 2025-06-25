"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Plus, Search, Users, Target, Calendar, MessageSquare } from "lucide-react"
import Header from "@/components/header"
import CreateGroupForm from "@/components/create-group-form"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

type Group = {
  id: string
  name: string
  description: string
  memberCount: number
  goals: number
  activity: string
  userRole?: string
}

export default function GroupsPage() {
  const [myGroups, setMyGroups] = useState<Group[]>([])
  const [discoverGroups, setDiscoverGroups] = useState<Group[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // マイグループを取得
        const myGroupsResponse = await fetch('/api/groups?type=my')
        if (myGroupsResponse.ok) {
          setMyGroups(await myGroupsResponse.json())
        }

        // 探索用グループを取得
        const discoverResponse = await fetch('/api/groups?type=discover')
        if (discoverResponse.ok) {
          setDiscoverGroups(await discoverResponse.json())
        }

        // 招待を取得
        const invitationsResponse = await fetch('/api/invitations?type=received')
        if (invitationsResponse.ok) {
          setInvitations(await invitationsResponse.json())
        }
      } catch (error) {
        console.error('Error fetching groups data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 招待への応答を処理
  const handleInvitationResponse = async (invitationId: string, accept: boolean) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: accept ? 'accept' : 'reject' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update invitation')
      }

      const result = await response.json()

      toast({
        title: accept ? 'グループに参加しました' : '招待を拒否しました',
        description: result.message,
        action: accept ? (
          <ToastAction altText="グループページへ" onClick={() => router.push(`/groups/${result.invitation.groupId}`)}>
            グループページへ
          </ToastAction>
        ) : undefined,
      })

      // 招待一覧をリロード
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
      // 他データも必要なら fetchData 再実行
    } catch (error) {
      console.error('Error updating invitation:', error)
      toast({
        title: 'エラー',
        description: '招待の更新に失敗しました。',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">グループ</h1>
            <p className="text-gray-500">学習グループを管理・参加します</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="グループを検索..." className="pl-9" />
            </div>
            <CreateGroupForm />
          </div>
        </div>

        <Tabs defaultValue="my-groups">
          <TabsList className="mb-8">
            <TabsTrigger value="my-groups">
              <Users className="mr-2 h-4 w-4" />
              マイグループ
            </TabsTrigger>
            <TabsTrigger value="discover">
              <Search className="mr-2 h-4 w-4" />
              グループを探す
            </TabsTrigger>
            <TabsTrigger value="invitations">
              <MessageSquare className="mr-2 h-4 w-4" />
              招待 {invitations.length > 0 && `(${invitations.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    description={group.description}
                    members={group.memberCount}
                    goals={group.goals || 0}
                    activity={group.activity || "中"}
                    joined={true}
                  />
                ))}
                <CreateGroupCard />
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {discoverGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    description={group.description}
                    members={group.memberCount}
                    goals={group.goals || 0}
                    activity={group.activity || "中"}
                    joined={false}
                  />
                ))}
                {discoverGroups.length === 0 && !loading && (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <p>参加可能なグループがありません</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invitations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">招待一覧</CardTitle>
                  <CardDescription>参加招待されているグループ</CardDescription>
                </CardHeader>
                <CardContent>
                  {invitations.length === 0 ? (
                    <p className="text-sm text-gray-500">招待はありません</p>
                  ) : (
                    <div className="space-y-4">
                      {invitations.map((invitation) => (
                        <div key={invitation.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{invitation.group?.name ?? 'Unnamed Group'}</h3>
                              {invitation.group?.description && (
                                <p className="text-sm text-gray-600">{invitation.group.description}</p>
                              )}
                              {invitation.inviter && (
                                <p className="text-xs text-gray-500 mt-1">招待者: {invitation.inviter.name}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  await handleInvitationResponse(invitation.id, false)
                                }}
                              >
                                拒否
                              </Button>
                              <Button
                                size="sm"
                                onClick={async () => {
                                  await handleInvitationResponse(invitation.id, true)
                                }}
                              >
                                参加
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function GroupCard({ id, name, description, members, goals, activity, joined = true }: {
  id: string
  name: string
  description: string
  members: number
  goals: number
  activity: string
  joined?: boolean
}) {
  const activityColor =
    activity === "高"
      ? "text-emerald-600 bg-emerald-50"
      : activity === "中"
        ? "text-amber-600 bg-amber-50"
        : "text-gray-600 bg-gray-50"

  const [isJoining, setIsJoining] = useState(false)

  const handleJoinRequest = async () => {
    setIsJoining(true)

    try {
      const response = await fetch(`/api/groups/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join group')
      }

      const result = await response.json()
      toast({
        title: "参加リクエストを送信しました",
        description: result.message,
      })

      // ページをリロードして状態を更新
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Error joining group:', error)
      toast({
        title: "エラー",
        description: "参加リクエストの送信に失敗しました。",
        variant: "destructive"
      })
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-3 bg-emerald-600"></div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{name}</CardTitle>
          <span className={`text-xs px-2 py-1 rounded-full ${activityColor}`}>活動: {activity}</span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{members}人</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{goals}個の目標</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">週3回</span>
          </div>
        </div>
        {joined ? (
          <Button className="w-full" asChild>
            <Link href={`/groups/${id}`}>グループページへ</Link>
          </Button>
        ) : (
          <Button className="w-full" onClick={handleJoinRequest} disabled={isJoining}>
            {isJoining ? "送信中..." : "参加リクエスト"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function CreateGroupCard() {
  return (
    <Card className="border-dashed flex flex-col items-center justify-center p-6 h-full">
      <div className="rounded-full bg-emerald-50 p-3 mb-4">
        <Plus className="h-6 w-6 text-emerald-600" />
      </div>
      <h3 className="font-medium text-center mb-2">新しいグループを作成</h3>
      <p className="text-sm text-gray-500 text-center mb-4">自分だけのグループを作成して、仲間と一緒に学習しましょう</p>
      <CreateGroupForm />
    </Card>
  )
}
