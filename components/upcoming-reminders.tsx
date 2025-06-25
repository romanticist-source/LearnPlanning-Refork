"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Calendar, Clock } from "lucide-react"

interface Reminder {
  id: string
  title: string
  description: string
  deadline: string
  type: 'goal' | 'task' | 'event'
  priority: 'high' | 'medium' | 'low'
}

export default function UpcomingReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        // 近日中の目標やタスクを取得
        const response = await fetch('/api/goals?status=active')
        
        if (!response.ok) {
          throw new Error('Failed to fetch reminders')
        }
        
        const goals = await response.json()
        
        // 期限が近い目標をリマインダーとして設定
        const now = new Date()
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        const upcomingGoals = goals
          .filter((goal: any) => {
            if (!goal.deadline) return false
            const deadline = new Date(goal.deadline)
            return deadline > now && deadline <= nextWeek
          })
          .map((goal: any) => ({
            id: goal.id,
            title: goal.title,
            description: goal.description,
            deadline: goal.deadline,
            type: 'goal' as const,
            priority: goal.priority || 'medium' as const
          }))
          .sort((a: Reminder, b: Reminder) => 
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          )
        
        setReminders(upcomingGoals)
      } catch (error) {
        console.error('Failed to fetch reminders:', error)
        setReminders([])
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse border rounded-lg p-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>今後7日間のリマインダーはありません</p>
        <p className="text-sm mt-2">新しい目標を設定してみましょう</p>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return '🎯'
      case 'task':
        return '📝'
      case 'event':
        return '📅'
      default:
        return '⏰'
    }
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <div key={reminder.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <span className="text-lg">{getTypeIcon(reminder.type)}</span>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{reminder.title}</h4>
                {reminder.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {reminder.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {format(new Date(reminder.deadline), 'M月d日(E)', { locale: ja })}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(reminder.priority)}`}>
                    {reminder.priority === 'high' ? '高' : 
                     reminder.priority === 'medium' ? '中' : '低'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
