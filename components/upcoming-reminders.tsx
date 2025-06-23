"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Check } from "lucide-react"

type Reminder = {
  id: string
  title: string
  description: string
  date: string
  time: string
  completed: boolean
}


export default function UpcomingReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        // TODO: 実際のリマインダーAPIから取得
        // const response = await fetch('/api/reminders')
        // const data = await response.json()
        // setReminders(data)
        
        // 現在は空の配列を設定
        setReminders([])
      } catch (error) {
        console.error('Failed to fetch reminders:', error)
        setReminders([])
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [])

  const toggleComplete = (id: string) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder) =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder,
      ),
    )
  }

  if (loading) {
    return (
      <ul className="space-y-3">
        {[1, 2, 3].map((i) => (
          <li key={i} className="animate-pulse flex items-start gap-3 p-3 rounded-lg border">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>リマインダーが設定されていません</p>
        <p className="text-sm mt-2">学習スケジュールを設定してみましょう</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {reminders.map((reminder) => (
        <li
          key={reminder.id}
          className={`flex items-start gap-3 p-3 rounded-lg border ${
            reminder.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"
          }`}
        >
          <Button
            variant="outline"
            size="sm"
            className={`h-8 w-8 p-0 rounded-full ${
              reminder.completed
                ? "bg-emerald-100 text-emerald-600 border-emerald-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
            onClick={() => toggleComplete(reminder.id)}
          >
            {reminder.completed ? <Check size={14} /> : <Clock size={14} />}
          </Button>

          <div className="flex-1">
            <h4 className={`font-medium ${reminder.completed ? "line-through text-gray-400" : ""}`}>
              {reminder.title}
            </h4>
            <p className="text-sm text-gray-600">{reminder.description}</p>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {reminder.date}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {reminder.time}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
