"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, List, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import CreateEventModal from "@/components/create-event-modal"

type Event = {
  id: string
  title: string
  description: string
  date: Date
  time?: string
  type: "meeting" | "deadline" | "event"
  groupId?: string
  groupName?: string
}

export default function ScheduleView() {
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState<"month" | "list">("month")
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // ダミーイベントデータ
  const initialEvents: Event[] = [
    {
      id: "1",
      title: "JavaScriptの非同期処理",
      description: "Promise、async/await、コールバックについて学びます",
      date: new Date(2025, 4, 22), // 5月22日
      time: "20:00-21:30",
      type: "meeting",
      groupId: "1",
      groupName: "プログラミング勉強会",
    },
    {
      id: "2",
      title: "Todoアプリ制作締切",
      description: "JavaScriptを使ったTodoアプリの提出期限です",
      date: new Date(2025, 4, 25), // 5月25日
      type: "deadline",
      groupId: "1",
      groupName: "プログラミング勉強会",
    },
    {
      id: "3",
      title: "コードレビュー会",
      description: "作成したTodoアプリのコードレビューを行います",
      date: new Date(2025, 4, 29), // 5月29日
      time: "20:00-22:00",
      type: "event",
      groupId: "1",
      groupName: "プログラミング勉強会",
    },
    {
      id: "4",
      title: "アルゴリズム勉強会",
      description: "ソートアルゴリズムについて学びます",
      date: new Date(2025, 4, 18), // 5月18日
      time: "19:00-20:30",
      type: "meeting",
      groupId: "2",
      groupName: "アルゴリズム特訓",
    },
    {
      id: "5",
      title: "Reactフックの基本と応用",
      description: "Reactのフックについて学びます",
      date: new Date(2025, 4, 15), // 5月15日
      time: "20:00-21:30",
      type: "meeting",
      groupId: "1",
      groupName: "プログラミング勉強会",
    },
  ]

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
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const getEventsForDay = useCallback(
    (day: Date) => {
      return events.filter((event) => isSameDay(event.date, day))
    },
    [events],
  )

  // 月のイベントをメモ化
  const monthEvents = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return events.filter((event) => {
      return event.date >= start && event.date <= end
    })
  }, [currentMonth, events])

  const getEventTypeStyles = (type: Event["type"]) => {
    switch (type) {
      case "meeting":
        return "bg-emerald-100 text-emerald-700"
      case "deadline":
        return "bg-amber-100 text-amber-700"
      case "event":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // iCalファイルを生成して出力する関数
  const exportToICalendar = () => {
    // iCalファイルのヘッダー
    let iCalContent =
      [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Learn Planning//Schedule//JP",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
      ].join("\r\n") + "\r\n"

    // イベントをiCalフォーマットに変換
    monthEvents.forEach((event) => {
      const eventDate = format(event.date, "yyyyMMdd")
      let startTime = ""
      let endTime = ""

      if (event.time) {
        const [start, end] = event.time.split("-")
        let startHour = ""
        let startMinute = ""
        if (start) {
          ;[startHour, startMinute] = start.split(":")
          startTime = `T${startHour.padStart(2, "0")}${(startMinute || "00").padStart(2, "0")}00`
        }
        if (end) {
          const [endHour, endMinute] = end.split(":")
          endTime = `T${endHour.padStart(2, "0")}${(endMinute || "00").padStart(2, "0")}00`
        } else {
          // 終了時間が指定されていない場合は開始時間の1時間後
          endTime = startTime
            ? `T${(Number.parseInt(startHour) + 1).toString().padStart(2, "0")}${(startMinute || "00").padStart(2, "0")}00`
            : ""
        }
      }

      // イベントの種類に応じた説明を追加
      let description = event.description || ""
      if (event.groupName) {
        description += `\nグループ: ${event.groupName}`
      }

      iCalContent +=
        [
          "BEGIN:VEVENT",
          `UID:${event.id}@learnplanning.example.com`,
          `DTSTAMP:${format(new Date(), "yyyyMMdd")}T000000Z`,
          `DTSTART:${eventDate}${startTime || ""}`,
          `DTEND:${eventDate}${endTime || ""}`,
          `SUMMARY:${event.title}`,
          `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
          `CATEGORIES:${event.type.toUpperCase()}`,
          "END:VEVENT",
        ].join("\r\n") + "\r\n"
    })

    // iCalファイルのフッター
    iCalContent += "END:VCALENDAR"

    // ファイルをダウンロード
    const blob = new Blob([iCalContent], { type: "text/calendar;charset=utf-8" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `learn-planning-schedule-${format(currentMonth, "yyyy-MM")}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>スケジュール</CardTitle>
            <CardDescription>学習ミーティングやイベントのスケジュール</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as "month" | "list")}>
              <TabsList>
                <TabsTrigger value="month">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  月表示
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  リスト表示
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <CreateEventModal />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={view} className="w-full">
          <TabsContent value="month" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-medium">{format(currentMonth, "yyyy年 MMMM", { locale: ja })}</h3>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                <div key={day} className="text-center text-sm font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="h-24 p-1 bg-gray-50 rounded-md"></div>
              ))}

              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day)
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "h-24 p-1 border rounded-md overflow-hidden",
                      isSameDay(day, new Date()) ? "bg-blue-50 border-blue-200" : "bg-white",
                    )}
                  >
                    <div className="text-right text-sm font-medium mb-1">{format(day, "d")}</div>
                    <div className="space-y-1 overflow-y-auto max-h-[calc(100%-20px)]">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={cn("text-xs p-1 rounded truncate", getEventTypeStyles(event.type))}
                          title={`${event.title}${event.time ? ` (${event.time})` : ""}`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{format(currentMonth, "yyyy年 MMMM", { locale: ja })}の予定</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    前月
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    次月
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToICalendar}>
                    <Download className="h-4 w-4 mr-1" />
                    iCal出力
                  </Button>
                </div>
              </div>

              {monthEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>この月の予定はありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {monthEvents
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            event.type === "meeting"
                              ? "bg-emerald-100"
                              : event.type === "deadline"
                                ? "bg-amber-100"
                                : "bg-blue-100",
                          )}
                        >
                          <CalendarIcon
                            className={cn(
                              "h-4 w-4",
                              event.type === "meeting"
                                ? "text-emerald-600"
                                : event.type === "deadline"
                                  ? "text-amber-600"
                                  : "text-blue-600",
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{event.title}</h4>
                            <span className="text-sm text-gray-500">
                              {format(event.date, "M月d日（E）", { locale: ja })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {event.time && (
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{event.time}</span>
                            )}
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", getEventTypeStyles(event.type))}>
                              {event.type === "meeting"
                                ? "ミーティング"
                                : event.type === "deadline"
                                  ? "締切"
                                  : "イベント"}
                            </span>
                            {event.groupName && (
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{event.groupName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
