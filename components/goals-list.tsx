"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, MoreHorizontal, Check, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

type Goal = {
  id: string
  title: string
  description: string
  deadline: string
  progress: number
  subgoals?: Goal[]
  completed?: boolean
}

export default function GoalsList({ status = 'all', groupId }: { status?: 'all' | 'active' | 'completed', groupId?: string }) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({})
  const [showCompleted, setShowCompleted] = useState(true)

  // データを取得
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const params = new URLSearchParams()
        if (status !== 'all') params.append('status', status)
        if (groupId) params.append('groupId', groupId)
        
        const queryString = params.toString()
        const response = await fetch(`/api/goals${queryString ? `?${queryString}` : ''}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch goals')
        }
        
        const data = await response.json()
        
        // 日付フォーマットを調整
        const formattedGoals = data.map((goal: any) => ({
          ...goal,
          deadline: goal.deadline ? format(new Date(goal.deadline), 'yyyy/MM/dd', { locale: ja }) : '',
          subgoals: goal.subgoals?.map((subgoal: any) => ({
            ...subgoal,
            deadline: subgoal.deadline ? format(new Date(subgoal.deadline), 'yyyy/MM/dd', { locale: ja }) : ''
          })) || []
        }))
        
        setGoals(formattedGoals)
        
        // 最初の目標を展開状態にする
        if (formattedGoals.length > 0) {
          setExpandedGoals({ [formattedGoals[0].id]: true })
        }
      } catch (error) {
        console.error('Error fetching goals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [status, groupId])

  const toggleExpand = (goalId: string) => {
    setExpandedGoals((prev) => ({
      ...prev,
      [goalId]: !prev[goalId],
    }))
  }

  const toggleSubgoalComplete = (goalId: string, subgoalId: string) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) => {
        if (goal.id === goalId && goal.subgoals) {
          return {
            ...goal,
            subgoals: goal.subgoals.map((subgoal) => {
              if (subgoal.id === subgoalId) {
                const completed = !subgoal.completed
                return {
                  ...subgoal,
                  completed,
                  progress: completed ? 100 : subgoal.progress,
                }
              }
              return subgoal
            }),
            progress: calculateGoalProgress(
              goal.subgoals.map((subgoal) =>
                subgoal.id === subgoalId
                  ? { ...subgoal, completed: !subgoal.completed, progress: !subgoal.completed ? 100 : subgoal.progress }
                  : subgoal,
              ),
            ),
          }
        }
        return goal
      }),
    )
  }

  const calculateGoalProgress = (subgoals: Goal[]) => {
    if (!subgoals.length) return 0
    const totalProgress = subgoals.reduce((sum, subgoal) => sum + subgoal.progress, 0)
    return Math.round(totalProgress / subgoals.length)
  }

  // 目標を完了状態にマークする
  const markGoalAsCompleted = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true,
          progress: 100,
          completedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark goal as completed')
      }

      // 目標リストを更新
      setGoals((prevGoals) =>
        prevGoals.map((goal) =>
          goal.id === goalId
            ? { ...goal, completed: true, progress: 100 }
            : goal
        )
      )

      // 成功メッセージ
      alert('目標を完了としてマークしました！')
    } catch (error) {
      console.error('Error marking goal as completed:', error)
      alert('目標の完了処理に失敗しました')
    }
  }

  // 目標を削除する
  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete goal')
      }

      // 目標リストから削除
      setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId))

      // 成功メッセージ
      alert('目標を削除しました')
    } catch (error) {
      console.error('Error deleting goal:', error)
      alert('目標の削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
            <div className="p-4 bg-gray-50">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 表示する目標をフィルタリング
  const displayGoals = showCompleted 
    ? goals 
    : goals.filter(goal => !goal.completed)

  if (goals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>目標がまだ設定されていません</p>
        <p className="text-sm mt-2">新しい目標を作成して学習を始めましょう</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 完了した目標の表示/非表示切り替え */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          目標 {displayGoals.length} 件 {goals.length > displayGoals.length && `(完了済み ${goals.length - displayGoals.length} 件を非表示)`}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? '完了済みを非表示' : '完了済みを表示'}
        </Button>
      </div>
      {displayGoals.map((goal) => (
        <div key={goal.id} className="border rounded-lg overflow-hidden">
          <div className={`p-4 ${goal.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="p-0 h-8 w-8" onClick={() => toggleExpand(goal.id)}>
                  {expandedGoals[goal.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
                <h3 className={`font-medium ${goal.completed ? 'line-through text-gray-400' : ''}`}>
                  {goal.title}
                  {goal.completed && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      完了
                    </span>
                  )}
                </h3>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                <MoreHorizontal size={18} />
              </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!goal.completed && (
                    <>
                      <DropdownMenuItem onClick={() => markGoalAsCompleted(goal.id)}>
                        <Check className="mr-2 h-4 w-4" />
                        完了としてマーク
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>目標を削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          この操作は取り消せません。目標「{goal.title}」とすべてのサブ目標が削除されます。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 text-white hover:bg-red-700"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          削除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-gray-600 ml-10">{goal.description}</p>
            <div className="flex justify-between items-center mt-2 ml-10">
              <div className="flex items-center gap-2">
                <Progress 
                  value={goal.progress} 
                  className={`w-32 h-2 ${goal.completed ? 'bg-green-200' : ''}`}
                />
                <span className={`text-sm ${goal.completed ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                  {goal.progress}%
                </span>
              </div>
              <span className={`text-sm ${goal.completed ? 'text-green-600' : 'text-gray-600'}`}>
                期限: {goal.deadline}
              </span>
            </div>
          </div>

          {expandedGoals[goal.id] && goal.subgoals && goal.subgoals.length > 0 && (
            <div className="p-4 border-t">
              <ul className="space-y-3">
                {goal.subgoals.map((subgoal) => (
                  <li key={subgoal.id} className="flex items-start gap-3">
                    <Checkbox
                      id={subgoal.id}
                      checked={subgoal.completed}
                      onCheckedChange={() => toggleSubgoalComplete(goal.id, subgoal.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={subgoal.id}
                        className={`font-medium ${subgoal.completed ? "line-through text-gray-400" : ""}`}
                      >
                        {subgoal.title}
                      </label>
                      <p className="text-sm text-gray-600">{subgoal.description}</p>
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center gap-2">
                          <Progress value={subgoal.progress} className="w-24 h-2" />
                          <span className="text-xs text-gray-600">{subgoal.progress}%</span>
                        </div>
                        <span className="text-xs text-gray-600">期限: {subgoal.deadline}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
