"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Plus, Search, Users, Target, Calendar, MessageSquare } from "lucide-react"
import Header from "@/components/header"
import CreateGroupModal from "@/components/create-group-modal"
import Link from "next/link"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function GroupsPage() {
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
            <CreateGroupModal />
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
              招待
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GroupCard
                id="1"
                name="プログラミング勉強会"
                description="プログラミングの基礎から応用までを学ぶグループ"
                members={6}
                goals={12}
                activity="高"
              />
              <GroupCard
                id="2"
                name="アルゴリズム特訓"
                description="アルゴリズムとデータ構造を集中的に学ぶグループ"
                members={4}
                goals={8}
                activity="中"
              />
              <GroupCard
                id="3"
                name="Web開発チーム"
                description="Webアプリケーション開発を実践的に学ぶグループ"
                members={5}
                goals={10}
                activity="高"
              />
              <CreateGroupCard />
            </div>
          </TabsContent>

          <TabsContent value="discover">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GroupCard
                id="4"
                name="データベース勉強会"
                description="SQLとデータベース設計を学ぶグループ"
                members={8}
                goals={15}
                activity="中"
                joined={false}
              />
              <GroupCard
                id="5"
                name="機械学習入門"
                description="機械学習の基礎から実践までを学ぶグループ"
                members={12}
                goals={20}
                activity="高"
                joined={false}
              />
              <GroupCard
                id="6"
                name="モバイルアプリ開発"
                description="iOSとAndroidアプリ開発を学ぶグループ"
                members={7}
                goals={14}
                activity="中"
                joined={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="invitations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">招待一覧</CardTitle>
                  <CardDescription>参加招待されているグループ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">クラウドインフラ勉強会</h3>
                          <p className="text-sm text-gray-600">AWSやGCPなどのクラウドインフラを学ぶグループ</p>
                          <p className="text-xs text-gray-500 mt-1">招待者: 山田さん</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: "招待を拒否しました",
                                description: "クラウドインフラ勉強会への招待を拒否しました。",
                              })
                            }}
                          >
                            拒否
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "グループに参加しました",
                                description: "クラウドインフラ勉強会に参加しました。",
                                action: (
                                  <ToastAction altText="グループページへ">
                                    <Link href="/groups/7">グループページへ</Link>
                                  </ToastAction>
                                ),
                              })
                            }}
                          >
                            参加
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">セキュリティ勉強会</h3>
                          <p className="text-sm text-gray-600">Webアプリケーションのセキュリティを学ぶグループ</p>
                          <p className="text-xs text-gray-500 mt-1">招待者: 佐藤さん</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: "招待を拒否しました",
                                description: "セキュリティ勉強会への招待を拒否しました。",
                              })
                            }}
                          >
                            拒否
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "グループに参加しました",
                                description: "セキュリティ勉強会に参加しました。",
                                action: (
                                  <ToastAction altText="グループページへ">
                                    <Link href="/groups/8">グループページへ</Link>
                                  </ToastAction>
                                ),
                              })
                            }}
                          >
                            参加
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function GroupCard({ id, name, description, members, goals, activity, joined = true }) {
  const activityColor =
    activity === "高"
      ? "text-emerald-600 bg-emerald-50"
      : activity === "中"
        ? "text-amber-600 bg-amber-50"
        : "text-gray-600 bg-gray-50"

  const [isJoining, setIsJoining] = useState(false)

  const handleJoinRequest = () => {
    setIsJoining(true)

    // 実際のアプリケーションではAPIリクエストを送信します
    setTimeout(() => {
      setIsJoining(false)
      toast({
        title: "参加リクエストを送信しました",
        description: `${name}への参加リクエストを送信しました。承認されるまでお待ちください。`,
      })
    }, 1000)
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
      <CreateGroupModal />
    </Card>
  )
}
