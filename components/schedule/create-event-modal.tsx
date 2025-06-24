"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

export default function CreateEventModal() {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>()
  const [eventType, setEventType] = useState<"meeting" | "deadline" | "event">("meeting")
  const [isGroupEvent, setIsGroupEvent] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // ここでイベントデータを処理します
    console.log("予定を追加しました")
    setOpen(false)
    // フォームをリセット
    setDate(undefined)
    setEventType("meeting")
    setIsGroupEvent(true)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          予定を追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>新しい予定を追加</DialogTitle>
            <DialogDescription>学習ミーティングやイベント、締切などの予定を追加します。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                タイトル
              </Label>
              <Input id="title" placeholder="例: JavaScriptの非同期処理" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                説明
              </Label>
              <Textarea id="description" placeholder="予定の詳細を入力してください" className="col-span-3" rows={3} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                日付
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ja }) : "日付を選択"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                時間
              </Label>
              <div className="col-span-3 flex gap-2">
                <div className="flex-1">
                  <Input id="time-start" type="time" placeholder="開始時間" />
                </div>
                <span className="flex items-center">〜</span>
                <div className="flex-1">
                  <Input id="time-end" type="time" placeholder="終了時間" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">予定タイプ</Label>
              <RadioGroup
                defaultValue="meeting"
                className="col-span-3"
                value={eventType}
                onValueChange={(value) => setEventType(value as "meeting" | "deadline" | "event")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="meeting" id="meeting" />
                  <Label htmlFor="meeting">ミーティング</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deadline" id="deadline" />
                  <Label htmlFor="deadline">締切</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="event" id="event" />
                  <Label htmlFor="event">イベント</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">グループ予定</Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch id="group-event" checked={isGroupEvent} onCheckedChange={setIsGroupEvent} />
                <Label htmlFor="group-event">グループ予定として設定</Label>
              </div>
            </div>
            {isGroupEvent && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  グループ
                </Label>
                <select
                  id="group"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="1">プログラミング勉強会</option>
                  <option value="2">アルゴリズム特訓</option>
                  <option value="3">Web開発チーム</option>
                </select>
              </div>
            )}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">オプション</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="reminder" defaultChecked />
                  <Label htmlFor="reminder">リマインダーを設定する</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="recurring" />
                  <Label htmlFor="recurring">繰り返し予定として設定する</Label>
                </div>
                {eventType === "meeting" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox id="online" />
                    <Label htmlFor="online">オンラインミーティング</Label>
                  </div>
                )}
              </div>
            </div>
            {eventType === "meeting" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meeting-url" className="text-right">
                  ミーティングURL
                </Label>
                <Input id="meeting-url" placeholder="例: https://zoom.us/j/123456789" className="col-span-3" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit">作成</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
