"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X, Search, UserPlus, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function InviteMemberForm() {
  const [inviteMethod, setInviteMethod] = useState<"email" | "search">("email")
  const [searchQuery, setSearchQuery] = useState("")
  const [emailInput, setEmailInput] = useState("")
  const [emailList, setEmailList] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string }[]>([])
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string; email: string }[]>([])

  // メールアドレスを追加
  const addEmail = () => {
    if (emailInput && !emailList.includes(emailInput)) {
      setEmailList([...emailList, emailInput])
      setEmailInput("")
    }
  }

  // メールアドレスを削除
  const removeEmail = (email: string) => {
    setEmailList(emailList.filter((e) => e !== email))
  }

  // ユーザー検索（ダミー実装）
  const searchUsers = () => {
    if (!searchQuery) return

    // 実際のアプリケーションではAPIを呼び出してユーザーを検索します
    // ここではダミーデータを使用します
    const dummyResults = [
      { id: "user1", name: "山田太郎", email: "yamada@example.com" },
      { id: "user2", name: "佐藤花子", email: "sato@example.com" },
      { id: "user3", name: "鈴木一郎", email: "suzuki@example.com" },
    ].filter((user) => user.name.includes(searchQuery) || user.email.includes(searchQuery))

    setSearchResults(dummyResults)
  }

  // ユーザーを選択
  const selectUser = (user: { id: string; name: string; email: string }) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  // 選択したユーザーを削除
  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  // 招待を送信
  const sendInvitations = () => {
    // 実際のアプリケーションでは招待処理を実行します
    console.log("招待を送信しました")
    console.log("メールアドレス:", emailList)
    console.log("選択したユーザー:", selectedUsers)
    console.log("メッセージ:", message)

    // フォームをリセット
    setEmailList([])
    setSelectedUsers([])
    setMessage("")
    setSearchQuery("")
    setEmailInput("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>メンバーを招待</CardTitle>
        <CardDescription>グループに新しいメンバーを招待します</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">招待方法</Label>
            <RadioGroup
              value={inviteMethod}
              onValueChange={(value) => setInviteMethod(value as "email" | "search")}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="invite-email" />
                <Label htmlFor="invite-email">メールアドレスで招待</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="search" id="invite-search" />
                <Label htmlFor="invite-search">ユーザーを検索して招待</Label>
              </div>
            </RadioGroup>
          </div>

          {inviteMethod === "email" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-input">メールアドレス</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="email-input"
                    type="email"
                    placeholder="例: user@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
                  />
                  <Button type="button" onClick={addEmail}>
                    追加
                  </Button>
                </div>
              </div>

              {emailList.length > 0 && (
                <div>
                  <Label>招待リスト</Label>
                  <div className="flex flex-wrap gap-2 mt-1 p-2 border rounded-md min-h-[60px]">
                    {emailList.map((email, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {email}
                        <button
                          type="button"
                          onClick={() => removeEmail(email)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-input">ユーザー検索</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="search-input"
                      placeholder="名前またはメールアドレスで検索"
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchUsers())}
                    />
                  </div>
                  <Button type="button" onClick={searchUsers}>
                    検索
                  </Button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div>
                  <Label>検索結果</Label>
                  <div className="border rounded-md mt-1 max-h-[200px] overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => selectUser(user)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUsers.length > 0 && (
                <div>
                  <Label>選択したユーザー</Label>
                  <div className="flex flex-wrap gap-2 mt-1 p-2 border rounded-md min-h-[60px]">
                    {selectedUsers.map((user) => (
                      <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                        {user.name}
                        <button
                          type="button"
                          onClick={() => removeUser(user.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="invite-message">招待メッセージ（任意）</Label>
            <Textarea
              id="invite-message"
              placeholder="招待メッセージを入力してください"
              className="mt-1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={sendInvitations}
            disabled={emailList.length === 0 && selectedUsers.length === 0}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            招待を送信
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
