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
import { Users, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function CreateGroupModal() {
  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [invitedMembers, setInvitedMembers] = useState<{ id: string; name: string; email: string }[]>([])
  const [memberEmail, setMemberEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // ここでグループデータを処理します
    console.log("グループを作成しました")
    setOpen(false)
    // フォームをリセット
    setTags([])
    setTagInput("")
    setInvitedMembers([])
    setMemberEmail("")
  }

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

  const addMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (memberEmail.trim() === "") return

    // 実際のアプリケーションではAPIを呼び出してユーザーを検索します
    // ここではダミーデータを使用します
    const newMember = {
      id: `user-${invitedMembers.length + 1}`,
      name: `ユーザー${invitedMembers.length + 1}`,
      email: memberEmail.trim(),
    }

    if (!invitedMembers.some((member) => member.email === memberEmail.trim())) {
      setInvitedMembers([...invitedMembers, newMember])
    }

    setMemberEmail("")
  }

  const removeMember = (memberId: string) => {
    setInvitedMembers(invitedMembers.filter((member) => member.id !== memberId))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          グループを作成
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>新しいグループを作成</DialogTitle>
            <DialogDescription>
              学習グループの詳細を入力してください。グループを作成した後、メンバーを招待できます。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                グループ名
              </Label>
              <Input id="name" placeholder="例: プログラミング勉強会" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                説明
              </Label>
              <Textarea
                id="description"
                placeholder="グループの目的や活動内容を入力してください"
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meeting-schedule" className="text-right">
                ミーティング
              </Label>
              <Input id="meeting-schedule" placeholder="例: 毎週水曜日 20:00-21:30" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tags" className="text-right pt-2">
                タグ
              </Label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="タグを入力してEnterキーを押してください"
                />
                <p className="text-xs text-gray-500 mt-1">例: プログラミング, JavaScript, アルゴリズム</p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">メンバー招待</Label>
              <div className="col-span-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="メールアドレスを入力"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                  />
                  <Button type="button" onClick={addMember}>
                    招待
                  </Button>
                </div>
                {invitedMembers.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <Label>招待済みメンバー</Label>
                    <div className="max-h-[150px] overflow-y-auto border rounded-lg p-2">
                      {invitedMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">プライバシー設定</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="public" />
                  <Label htmlFor="public">公開グループ（誰でも検索・参加可能）</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="invite-only" defaultChecked />
                  <Label htmlFor="invite-only">招待制（管理者の招待が必要）</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="member-invite" />
                  <Label htmlFor="member-invite">メンバーによる招待を許可</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">その他の設定</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-approve" />
                  <Label htmlFor="auto-approve">参加リクエストを自動承認する</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notifications" defaultChecked />
                  <Label htmlFor="notifications">グループ活動の通知を受け取る</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit">グループを作成</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
