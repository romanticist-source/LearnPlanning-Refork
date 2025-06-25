"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

interface PaizaActivityModalProps {
  userId: string
  onActivityAdded?: () => void
}

export default function PaizaActivityModal({ userId, onActivityAdded }: PaizaActivityModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    codeExecutions: 0,
    studyMinutes: 0,
    problemsSolved: 0,
    language: 'JavaScript',
    difficulty: 'beginner'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/paiza-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId,
          codeExecutions: Number(formData.codeExecutions),
          studyMinutes: Number(formData.studyMinutes),
          problemsSolved: Number(formData.problemsSolved)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save activity')
      }

      toast({
        title: "アクティビティを記録しました",
        description: `${formData.date}の学習活動を保存しました。`,
      })

      // フォームをリセット
      setFormData({
        date: new Date().toISOString().split('T')[0],
        codeExecutions: 0,
        studyMinutes: 0,
        problemsSolved: 0,
        language: 'JavaScript',
        difficulty: 'beginner'
      })

      // モーダルを閉じる
      setOpen(false)

      // 親コンポーネントに通知
      if (onActivityAdded) {
        onActivityAdded()
      }
    } catch (error) {
      console.error('Error saving activity:', error)
      toast({
        title: "エラーが発生しました",
        description: "アクティビティの保存に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          アクティビティを記録
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-blue-600">🧩</span>
            Paizaアクティビティを記録
          </DialogTitle>
          <DialogDescription>
            今日のPaizaでの学習活動を記録してください
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">日付</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codeExecutions">コード実行回数</Label>
              <Input
                id="codeExecutions"
                name="codeExecutions"
                type="number"
                min="0"
                value={formData.codeExecutions}
                onChange={(e) => handleInputChange('codeExecutions', e.target.value)}
                placeholder="実行した回数を入力"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studyMinutes">学習時間（分）</Label>
              <Input
                id="studyMinutes"
                name="studyMinutes"
                type="number"
                min="0"
                value={formData.studyMinutes}
                onChange={(e) => handleInputChange('studyMinutes', e.target.value)}
                placeholder="学習した時間を入力"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemsSolved">解決した問題数</Label>
              <Input
                id="problemsSolved"
                name="problemsSolved"
                type="number"
                min="0"
                value={formData.problemsSolved}
                onChange={(e) => handleInputChange('problemsSolved', e.target.value)}
                placeholder="解決した問題数を入力"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">使用言語</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="言語を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Java">Java</SelectItem>
                  <SelectItem value="C++">C++</SelectItem>
                  <SelectItem value="C#">C#</SelectItem>
                  <SelectItem value="Ruby">Ruby</SelectItem>
                  <SelectItem value="PHP">PHP</SelectItem>
                  <SelectItem value="Go">Go</SelectItem>
                  <SelectItem value="Rust">Rust</SelectItem>
                  <SelectItem value="TypeScript">TypeScript</SelectItem>
                  <SelectItem value="Kotlin">Kotlin</SelectItem>
                  <SelectItem value="Swift">Swift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">難易度</Label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="難易度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">初級</SelectItem>
                  <SelectItem value="intermediate">中級</SelectItem>
                  <SelectItem value="advanced">上級</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : 'アクティビティを記録'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 