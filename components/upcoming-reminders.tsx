"use client"

import { useState } from "react"
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

const initialReminders: Reminder[] = [
  {
    id: "1",
    title: "アルゴリズム学習",
    description: "再帰関数の基本概念を学ぶ",
    date: "2025/5/10",
    time: "19:00",
    completed: false,
  },
  {
    id: "2",
    title: "プログラミング演習",
    description: "配列操作の練習問題を解く",
    date: "2025/5/11",
    time: "14:00",
    completed: false,
  },
  {
    id: "3",
    title: "グループミーティング",
    description: "週間進捗報告と質疑応答",
    date: "2025/5/12",
    time: "20:00",
    completed: false,
  },
  {
    id: "4",
    title: "Webフロントエンド学習",
    description: "CSSレイアウトの基本を学ぶ",
    date: "2025/5/13",
    time: "18:30",
    completed: false,
  },
]

export default function UpcomingReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)

  const toggleComplete = (id: string) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder) =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder,
      ),
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
