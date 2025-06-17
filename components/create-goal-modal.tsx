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
import { CalendarIcon, Plus, Target } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

export default function CreateGoalModal() {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>()
  const [isGroupGoal, setIsGroupGoal] = useState(false)
  const [hasSubgoals, setHasSubgoals] = useState(false)
  const [subgoals, setSubgoals] = useState([{ title: "", description: "", deadline: null as Date | null }])

  const addSubgoal = () => {
    setSubgoals([...subgoals, { title: "", description: "", deadline: null }])
  }

  const removeSubgoal = (index: number) => {
    const newSubgoals = [...subgoals]
    newSubgoals.splice(index, 1)
    setSubgoals(newSubgoals)
  }

  const updateSubgoal = (index: number, field: string, value: any) => {
    const newSubgoals = [...subgoals]
    newSubgoals[index] = { ...newSubgoals[index], [field]: value }
    setSubgoals(newSubgoals)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // ここで目標データを処理します
    console.log("目標を作成しました")
    setOpen(false)
    // フォームをリセット
    setDate(undefined)
    setIsGroupGoal(false)
    setHasSubgoals(false)
    setSubgoals([{ title: "", description: "", deadline: null }])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新しい目標
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>新しい学習目標を作成</DialogTitle>
            <DialogDescription>学習目標の詳細を入力してください。目標は後で編集することもできます。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                タイトル
              </Label>
              <Input id="title" placeholder="例: JavaScriptの基礎を学ぶ" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                説明
              </Label>
              <Textarea
                id="description"
                placeholder="目標の詳細な説明を入力してください"
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">
                期限
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
              <Label className="text-right">目標タイプ</Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch id="group-goal" checked={isGroupGoal} onCheckedChange={setIsGroupGoal} />
                <Label htmlFor="group-goal">グループ目標として設定</Label>
              </div>
            </div>
            {isGroupGoal && (
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">サブ目標</Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch id="has-subgoals" checked={hasSubgoals} onCheckedChange={setHasSubgoals} />
                <Label htmlFor="has-subgoals">サブ目標を追加する</Label>
              </div>
            </div>

            {hasSubgoals && (
              <div className="col-span-full mt-2">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    サブ目標
                  </h4>
                  <div className="space-y-4">
                    {subgoals.map((subgoal, index) => (
                      <div key={index} className="border p-3 rounded-lg bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">サブ目標 {index + 1}</h5>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSubgoal(index)}
                              className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              削除
                            </Button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`subgoal-title-${index}`}>タイトル</Label>
                            <Input
                              id={`subgoal-title-${index}`}
                              value={subgoal.title}
                              onChange={(e) => updateSubgoal(index, "title", e.target.value)}
                              placeholder="サブ目標のタイトル"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`subgoal-description-${index}`}>説明</Label>
                            <Textarea
                              id={`subgoal-description-${index}`}
                              value={subgoal.description}
                              onChange={(e) => updateSubgoal(index, "description", e.target.value)}
                              placeholder="サブ目標の説明"
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`subgoal-deadline-${index}`}>期限</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  id={`subgoal-deadline-${index}`}
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal mt-1",
                                    !subgoal.deadline && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {subgoal.deadline ? format(subgoal.deadline, "PPP", { locale: ja }) : "日付を選択"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={subgoal.deadline || undefined}
                                  onSelect={(date) => updateSubgoal(index, "deadline", date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full" onClick={addSubgoal}>
                      <Plus className="h-4 w-4 mr-2" />
                      サブ目標を追加
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                優先度
              </Label>
              <select
                id="priority"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="high">高</option>
                <option value="medium" selected>
                  中
                </option>
                <option value="low">低</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">オプション</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="reminder" />
                  <Label htmlFor="reminder">リマインダーを設定する</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="public" />
                  <Label htmlFor="public">公開目標として設定する</Label>
                </div>
              </div>
            </div>
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
