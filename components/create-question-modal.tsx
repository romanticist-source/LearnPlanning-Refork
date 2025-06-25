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

export default function CreateQuestionModal() {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<{ name: string; type: string; size: string }[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // ここで質問データを処理します
    console.log("質問を投稿しました")
    setOpen(false)
    // フォームをリセット
    setFiles([])
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
              <Input id="title" placeholder="例: JavaScriptの非同期処理について" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="question" className="text-right pt-2">
                質問内容
              </Label>
              <Textarea
                id="question"
                placeholder="質問の詳細を入力してください"
                className="col-span-3"
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="text-right">
                グループ
              </Label>
              <select
                id="group"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">すべてのグループ</option>
                <option value="1">プログラミング勉強会</option>
                <option value="2">アルゴリズム特訓</option>
                <option value="3">Web開発チーム</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                タグ
              </Label>
              <Input id="tags" placeholder="例: JavaScript, 非同期処理, Promise" className="col-span-3" />
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
                  <Checkbox id="notify" defaultChecked />
                  <Label htmlFor="notify">回答があった場合に通知を受け取る</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="anonymous" />
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
