"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, List, ChevronLeft, ChevronRight, Clock, MapPin, Users, Download } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isFuture } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { downloadICalFile, generateFilename, type CalendarEvent } from "@/lib/ical-utils"

type Event = {
  id: string
  title: string
  description: string
  date: Date
  startTime?: string
  endTime?: string
  eventType: "meeting" | "deadline" | "event"
  isOnline: boolean
  location?: string
  groupId: string
}

interface GroupScheduleProps {
  groupId: string
}

export default function GroupSchedule({ groupId }: GroupScheduleProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [view, setView] = useState<"month" | "list">("list")

  // イベントデータの状態管理
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  // イベントデータをAPIから取得
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events?groupId=${groupId}`)
        if (response.ok) {
          const eventsData = await response.json()
          const formattedEvents: Event[] = eventsData.map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description || '',
            date: new Date(event.date),
            startTime: event.startTime,
            endTime: event.endTime,
            eventType: event.eventType || 'event',
            isOnline: event.isOnline || false,
            location: event.location,
            groupId: event.groupId
          }))
          setEvents(formattedEvents)
        }
      } catch (error) {
        console.error('Failed to fetch group events:', error)
      } finally {
        setLoading(false)
      }
    }

    if (groupId) {
      fetchEvents()
    }
  }, [groupId])

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    return eachDayOfInterval({ start, end })
  }

  // メモ化された日付データ
  const daysInMonth = useMemo(() => getDaysInMonth(currentMonth), [currentMonth])

  // 月の最初の日の曜日（空のセル用）
  const firstDayOfMonth = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(),
    [currentMonth],
  )

  // メモ化されたイベント取得関数
  const getEventsForDay = useCallback(
    (day: Date) => {
      return events.filter((event) => isSameDay(event.date, day))
    },
    [events],
  )

  // 今後のイベントをメモ化
  const upcomingEvents = useMemo(() => {
    return events
      .filter((event) => isFuture(event.date) || isToday(event.date))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 10) // 最大10件表示
  }, [events])

  // 月のイベントをメモ化
  const monthEvents = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return events.filter((event) => {
      return event.date >= start && event.date <= end
    })
  }, [currentMonth, events])

  const getEventTypeStyles = (type: Event["eventType"]) => {
    switch (type) {
      case "meeting":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "deadline":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "event":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getEventTypeLabel = (type: Event["eventType"]) => {
    switch (type) {
      case "meeting":
        return "ミーティング"
      case "deadline":
        return "締切"
      case "event":
        return "イベント"
      default:
        return "その他"
    }
  }

  // iCalファイルを生成して出力する関数
  const exportToICalendar = () => {
    // 表示モードに応じてイベントを選択
    const targetEvents = view === "month" ? monthEvents : upcomingEvents
    
    // イベントデータをCalendarEvent形式に変換
    const calendarEvents: CalendarEvent[] = targetEvents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      eventType: event.eventType,
      isOnline: event.isOnline,
      groupName: `グループ ${event.groupId}`,
    }))

    const filename = view === "month" 
      ? generateFilename("group-schedule", currentMonth)
      : generateFilename("group-schedule-upcoming", new Date())
    downloadICalFile(calendarEvents, filename)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>このグループにはまだスケジュールが設定されていません</p>
        <p className="text-sm mt-1">「+ 予定を追加」ボタンから新しいイベントを作成しましょう</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={view} onValueChange={(v) => setView(v as "month" | "list")}>
        <TabsList>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            リスト表示
          </TabsTrigger>
          <TabsTrigger value="month">
            <CalendarIcon className="h-4 w-4 mr-2" />
            カレンダー表示
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">今後の予定</h3>
              {upcomingEvents.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportToICalendar}>
                  <Download className="h-4 w-4 mr-1" />
                  iCal出力
                </Button>
              )}
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>今後の予定はありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className={cn("border-l-4", getEventTypeStyles(event.eventType))}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{event.title}</h4>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              getEventTypeStyles(event.eventType)
                            )}>
                              {getEventTypeLabel(event.eventType)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{format(event.date, "yyyy年M月d日(E)", { locale: ja })}</span>
                            </div>
                            
                            {(event.startTime || event.endTime) && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {event.startTime}
                                  {event.endTime && ` - ${event.endTime}`}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.isOnline ? "オンライン" : event.location || "場所未設定"}</span>
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="month">
          <div className="bg-white rounded-lg border">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {format(currentMonth, "yyyy年M月", { locale: ja })}
              </h3>
              <div className="flex items-center gap-2">
                {events.length > 0 && (
                  <Button variant="outline" size="sm" onClick={exportToICalendar}>
                    <Download className="h-4 w-4 mr-1" />
                    iCal出力
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* 月の最初の日までの空のセル */}
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`} className="h-24"></div>
                ))}

                {/* 月の日付 */}
                {daysInMonth.map((day) => {
                  const dayEvents = getEventsForDay(day)
                  const isCurrentDay = isToday(day)

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "h-24 p-1 border border-gray-100 rounded",
                        isCurrentDay && "bg-emerald-50 border-emerald-200"
                      )}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        isCurrentDay ? "text-emerald-600" : "text-gray-900"
                      )}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs p-1 rounded truncate",
                              getEventTypeStyles(event.eventType)
                            )}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2}件
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 