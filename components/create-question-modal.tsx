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
import { MessageSquare, FileText, ImageIcon, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { getCurrentUser } from "@/lib/auth-utils"
import { Badge } from "@/components/ui/badge"

// タグのプリセット候補（グループ作成と共有）
const presetTags = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "アルゴリズム",
  "データ構造",
  "プログラミング",
  "データベース",
]

export default function CreateQuestionModal() {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<{ name: string; type: string; size: string }[]>([])

  // タグ関連のステート
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const filteredSuggestions = presetTags.filter(
    (tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag)
  )

  // ID生成用のヘルパー関数
  const generateId = (prefix: string): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 現在のユーザーIDを取得（仮の実装）
  const getCurrentUserId = (): string => {
    return "user-1"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData(e.target as HTMLFormElement)
    
    try {
      // 現在のユーザー情報を取得
      const currentUser = await getCurrentUser()
      
      const questionData = {
        id: generateId('question'),
        title: formData.get('title') as string,
        content: formData.get('question') as string,
        tags: tags,
        groupId: formData.get('group') === 'all' ? null : formData.get('group') as string,
        userId: currentUser.id,
        isAnonymous: formData.get('anonymous') === 'on',
        hasNotification: formData.get('notify') === 'on',
        attachments: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      }
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '質問の投稿に失敗しました')
      }

      const createdQuestion = await response.json()
      console.log('質問を投稿しました:', createdQuestion)
      
      setOpen(false)
      // フォームをリセット
      setFiles([])
      setTags([])
      setTagInput("")
      
      // ページをリロードして新しい質問を表示
      window.location.reload()
    } catch (error) {
      console.error('Error creating question:', error)
      const errorMessage = error instanceof Error ? error.message : '質問の投稿に失敗しました'
      alert(`エラー: ${errorMessage}`)
    }
  }

  const addFile = () => {
    // 実際のアプリケーションではファイル選択ダイアログを表示します
    // ここではダミーデータを追加します
    const newFile = {
      name: `file-${files.length + 1}.${Math.random() > 0.5 ? "pdf" : "jpg"}`,
      type: Math.random() > 0.5 ? "application/pdf" : "image/jpeg",
      size: `${Math.floor(Math.random() * 1000) + 100}KB`,
    }
    setFiles([...files, newFile])
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
  }

  // タグ追加・削除
  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          質問を投稿
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>新しい質問を投稿</DialogTitle>
            <DialogDescription>
              グループメンバーに質問を投稿します。詳細な情報を提供すると、より良い回答が得られます。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                タイトル
              </Label>
              <Input id="title" name="title" placeholder="例: JavaScriptの非同期処理について" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="question" className="text-right pt-2">
                質問内容
              </Label>
              <Textarea
                id="question"
                name="question"
                placeholder="質問の詳細を入力してください"
                className="col-span-3"
                rows={5}
                required
              />
            </div>
            
            {/* タグ入力 */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tags-input" className="text-right pt-2">
                タグ
              </Label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  id="tags-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="タグを入力してEnterキーを押してください"
                />
                {filteredSuggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {filteredSuggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setTags([...tags, suggestion])
                          setTagInput("")
                        }}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                )}
                <input type="hidden" name="tags" value={tags.join(',')} />
                <p className="text-xs text-gray-500 mt-1">例: プログラミング, JavaScript, アルゴリズム</p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">添付ファイル</Label>
              <div className="col-span-3">
                {files.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {file.type.includes("image") ? (
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">{file.size}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={addFile}>
                    <ImageIcon className="h-4 w-4 mr-1" />
                    画像を追加
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={addFile}>
                    <FileText className="h-4 w-4 mr-1" />
                    ファイルを追加
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">オプション</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify" name="notify" defaultChecked />
                  <Label htmlFor="notify">回答があった場合に通知を受け取る</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="anonymous" name="anonymous" />
                  <Label htmlFor="anonymous">匿名で質問する</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit">投稿</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
