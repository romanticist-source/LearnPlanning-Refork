"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Plus, Search, Target, Clock, Users } from "lucide-react"
import Header from "@/components/header"
import GoalsList from "@/components/goals-list"
import CreateGoalModal from "@/components/create-goal-modal"

export default function GoalsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">学習目標</h1>
            <p className="text-gray-500">学習目標を設定し、進捗を管理します</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="目標を検索..." className="pl-9" />
            </div>
            <CreateGoalModal />
          </div>
        </div>

        <Tabs defaultValue="all-goals">
          <TabsList className="mb-8">
            <TabsTrigger value="all-goals">
              <Target className="mr-2 h-4 w-4" />
              すべての目標
            </TabsTrigger>
            <TabsTrigger value="active">
              <Clock className="mr-2 h-4 w-4" />
              進行中
            </TabsTrigger>
            <TabsTrigger value="completed">
              <Target className="mr-2 h-4 w-4" />
              達成済み
            </TabsTrigger>
            <TabsTrigger value="group-goals">
              <Users className="mr-2 h-4 w-4" />
              グループ目標
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-goals">
            <Card>
              <CardHeader>
                <CardTitle>学習目標一覧</CardTitle>
                <CardDescription>設定したすべての学習目標と進捗状況</CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsList status="all" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>進行中の目標</CardTitle>
                <CardDescription>現在取り組んでいる学習目標</CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsList status="active" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>達成済みの目標</CardTitle>
                <CardDescription>達成した学習目標の履歴</CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsList status="completed" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="group-goals">
            <Card>
              <CardHeader>
                <CardTitle>グループ目標</CardTitle>
                <CardDescription>参加しているグループの共通目標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">プログラミング勉強会</h3>
                    <GoalsList status="all" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">アルゴリズム特訓</h3>
                    <GoalsList status="all" />
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
