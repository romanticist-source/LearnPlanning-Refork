"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X, Search, UserPlus, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function InviteMemberForm({ groupId }: { groupId: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState("")
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string }[]>([])
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string; email: string }[]>([])
  const [pendingInvites, setPendingInvites] = useState<{ id: string; inviteeName: string; inviteeEmail: string }[]>([])

  // 初期に招待中ユーザー取得
  useEffect(() => {
    const fetchPendingInvites = async () => {
      try {
        const res = await fetch('/api/invitations?type=sent')
        if (res.ok) {
          const data = await res.json()
          const filtered = data.filter((inv: any) => inv.groupId === groupId && inv.status === 'pending')
          setPendingInvites(filtered)
        }
      } catch (error) {
        console.error('Failed to fetch pending invites:', error)
      }
    }
    fetchPendingInvites()
  }, [groupId])

  // ユーザー検索
  const searchUsers = async () => {
    if (!searchQuery) return

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Failed to search users:', error)
      setSearchResults([])
    }
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
  const sendInvitations = async () => {
    try {
      const invitations: { email: string; name?: string }[] = []

      // ユーザー選択での招待のみ
      for (const user of selectedUsers) {
        invitations.push({ email: user.email, name: user.name })
      }

      // API へ招待を送信
      for (const inv of invitations) {
        await fetch(`/api/groups/${groupId}/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: inv.email, name: inv.name, message }),
        })
      }

      console.log("招待を送信しました")
      
      // フォーム・リストをリセット
      setSelectedUsers([])
      setMessage("")
      setSearchQuery("")
      setSearchResults([])

      // ペンディングリストを更新
      const res = await fetch('/api/invitations?type=sent')
      if (res.ok) {
        const data = await res.json()
        const filtered = data.filter((inv: any) => inv.groupId === groupId && inv.status === 'pending')
        setPendingInvites(filtered)
      }
    } catch (error) {
      console.error('Failed to send invitations:', error)
    }
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
              value={searchQuery}
              onValueChange={(value) => setSearchQuery(value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="search" id="invite-search" />
                <Label htmlFor="invite-search">ユーザーを検索して招待</Label>
              </div>
            </RadioGroup>
          </div>

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
            disabled={selectedUsers.length === 0}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            招待を送信
          </Button>

          {/* 既に招待中のユーザー */}
          {pendingInvites.length > 0 && (
            <div>
              <Label>招待中のユーザー</Label>
              <div className="flex flex-wrap gap-2 mt-1 p-2 border rounded-md min-h-[60px]">
                {pendingInvites.map((inv) => (
                  <Badge key={inv.id} variant="secondary" className="flex items-center gap-1">
                    {inv.inviteeName || inv.inviteeEmail}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
