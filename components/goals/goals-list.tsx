"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"
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

export default function GoalsList({ status = 'all' }: { status?: 'all' | 'active' | 'completed' }) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({})

  // データを取得
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const statusParam = status !== 'all' ? `?status=${status}` : ''
        const response = await fetch(`/api/goals${statusParam}`)
        
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
  }, [status])

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
      {goals.map((goal) => (
        <div key={goal.id} className="border rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="p-0 h-8 w-8" onClick={() => toggleExpand(goal.id)}>
                  {expandedGoals[goal.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
                <h3 className="font-medium">{goal.title}</h3>
              </div>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                <MoreHorizontal size={18} />
              </Button>
            </div>
            <p className="text-sm text-gray-600 ml-10">{goal.description}</p>
            <div className="flex justify-between items-center mt-2 ml-10">
              <div className="flex items-center gap-2">
                <Progress value={goal.progress} className="w-32 h-2" />
                <span className="text-sm text-gray-600">{goal.progress}%</span>
              </div>
              <span className="text-sm text-gray-600">期限: {goal.deadline}</span>
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
