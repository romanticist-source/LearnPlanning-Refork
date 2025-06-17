"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"

type Goal = {
  id: string
  title: string
  description: string
  deadline: string
  progress: number
  subgoals?: Goal[]
  completed?: boolean
}

const initialGoals: Goal[] = [
  {
    id: "1",
    title: "プログラミング基礎の習得",
    description: "プログラミングの基本概念と構文を理解する",
    deadline: "2025/6/30",
    progress: 75,
    subgoals: [
      {
        id: "1-1",
        title: "変数と型",
        description: "変数の宣言と基本的なデータ型を理解する",
        deadline: "2025/5/15",
        progress: 100,
        completed: true,
      },
      {
        id: "1-2",
        title: "制御構文",
        description: "条件分岐とループ処理を理解する",
        deadline: "2025/5/30",
        progress: 80,
        completed: false,
      },
      {
        id: "1-3",
        title: "関数とスコープ",
        description: "関数の定義と呼び出し、変数のスコープを理解する",
        deadline: "2025/6/15",
        progress: 60,
        completed: false,
      },
    ],
  },
  {
    id: "2",
    title: "Webフロントエンド開発",
    description: "HTML, CSS, JavaScriptを使ったWebフロントエンド開発の基礎を学ぶ",
    deadline: "2025/8/31",
    progress: 40,
    subgoals: [
      {
        id: "2-1",
        title: "HTML/CSS基礎",
        description: "HTMLの構造とCSSによるスタイリングを理解する",
        deadline: "2025/7/15",
        progress: 90,
        completed: false,
      },
      {
        id: "2-2",
        title: "JavaScript基礎",
        description: "JavaScriptの基本構文とDOM操作を理解する",
        deadline: "2025/7/31",
        progress: 50,
        completed: false,
      },
      {
        id: "2-3",
        title: "フレームワーク入門",
        description: "ReactやVueなどのフレームワークの基本を理解する",
        deadline: "2025/8/31",
        progress: 10,
        completed: false,
      },
    ],
  },
  {
    id: "3",
    title: "アルゴリズムとデータ構造",
    description: "基本的なアルゴリズムとデータ構造を理解し実装できるようになる",
    deadline: "2025/9/30",
    progress: 20,
    subgoals: [],
  },
]

export default function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({
    "1": true,
    "2": false,
    "3": false,
  })

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
