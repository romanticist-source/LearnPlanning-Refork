"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Check, Download } from "lucide-react"
import { downloadICalFile, generateFilename, type CalendarEvent } from "@/lib/ical-utils"

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
  const [eventData, setEventData] = useState<any[]>([])

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        // イベントAPIからリマインダー設定されているイベントを取得
        const response = await fetch('/api/events')
        if (response.ok) {
          const events = await response.json()
          
          // リマインダー設定されているイベントのみフィルタリングし、今後の日付のみ表示
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // 今日の00:00:00
          
          const upcomingEvents = events.filter((event: any) => {
            // reminders配列があるか、hasReminderがtrueのイベントのみ
            const hasReminders = event.reminders?.length > 0 || event.hasReminder
            if (!hasReminders) return false
            
            // イベント日付を作成（時間も考慮）
            const eventDate = new Date(event.date)
            if (event.startTime) {
              const [hours, minutes] = event.startTime.split(':')
              eventDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)
            }
            
            // 今日以降のイベントのみ
            return eventDate >= today
          })
          
          // 日付・時刻順でソート（近い順）
          upcomingEvents.sort((a: any, b: any) => {
            const dateA = new Date(a.date)
            const dateB = new Date(b.date)
            
            // 時刻があれば追加
            if (a.startTime) {
              const [hoursA, minutesA] = a.startTime.split(':')
              dateA.setHours(Number.parseInt(hoursA), Number.parseInt(minutesA), 0, 0)
            }
            if (b.startTime) {
              const [hoursB, minutesB] = b.startTime.split(':')
              dateB.setHours(Number.parseInt(hoursB), Number.parseInt(minutesB), 0, 0)
            }
            
            return dateA.getTime() - dateB.getTime()
          })
          
          // 最大5件に制限（最も近い予定に焦点を当てる）
          const limitedEvents = upcomingEvents.slice(0, 20)
          
          // リマインダー形式に変換
          const reminderData: Reminder[] = limitedEvents.map((event: any) => {
            const eventDate = new Date(event.date)
            const endDate = event.endDate ? new Date(event.endDate) : null
            
            // 時間があれば設定
            if (event.startTime) {
              const [hours, minutes] = event.startTime.split(':')
              eventDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)
            }
            
            // 相対的な日付表示を生成
            const getRelativeDate = (date: Date): string => {
              const today = new Date()
              const tomorrow = new Date(today)
              tomorrow.setDate(tomorrow.getDate() + 1)
              const dayAfterTomorrow = new Date(today)
              dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
              
              const isSameDay = (date1: Date, date2: Date) => {
                return date1.getFullYear() === date2.getFullYear() &&
                       date1.getMonth() === date2.getMonth() &&
                       date1.getDate() === date2.getDate()
              }
              
              if (isSameDay(date, today)) {
                return '今日'
              } else if (isSameDay(date, tomorrow)) {
                return '明日'
              } else if (isSameDay(date, dayAfterTomorrow)) {
                return '明後日'
              } else {
                return date.toLocaleDateString('ja-JP', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short'
                })
              }
            }
            
            // 時間表示を生成
            const getTimeDisplay = (): string => {
              if (event.startTime && event.endTime) {
                return `${event.startTime} - ${event.endTime}`
              } else if (event.startTime) {
                return event.startTime
              } else if (endDate) {
                return `${eventDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
              } else {
                return '時間未設定'
              }
            }
            
            return {
              id: event.id,
              title: event.title,
              description: event.description || '予定の詳細はありません',
              date: getRelativeDate(eventDate),
              time: getTimeDisplay(),
              completed: false
            }
          })
          
          setReminders(reminderData)
          setEventData(limitedEvents)
        } else {
          setReminders([])
          setEventData([])
        }
      } catch (error) {
        console.error('Failed to fetch reminders:', error)
        setReminders([])
        setEventData([])
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

  // iCalファイルを生成して出力する関数
  const exportToICalendar = () => {
    // イベントデータをCalendarEvent形式に変換
    const calendarEvents: CalendarEvent[] = eventData.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description || "",
      date: new Date(event.date),
      startTime: event.startTime,
      endTime: event.endTime,
      eventType: event.eventType || "event",
      groupName: event.groupId ? `グループ ${event.groupId}` : undefined,
    }))

    const filename = generateFilename("upcoming-reminders", new Date())
    downloadICalFile(calendarEvents, filename)
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
    <div className="space-y-4">
      {reminders.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={exportToICalendar}>
            <Download className="h-4 w-4 mr-1" />
            iCal出力
          </Button>
        </div>
      )}
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
    </div>
  )
}
