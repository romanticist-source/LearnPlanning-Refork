"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { UserPlus, UserMinus, Settings, LogOut } from "lucide-react"
import { toast } from "sonner"

interface GroupMember {
  id: string
  groupId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

interface GroupMembersProps {
  groupId: string
  currentUserRole?: 'owner' | 'admin' | 'member'
  currentUserId?: string
}

export default function GroupMembers({ groupId, currentUserRole, currentUserId }: GroupMembersProps) {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)

  // メンバー一覧を取得
  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/groups/${groupId}/members`)
      const data = await response.json()
      
      if (data.success) {
        setMembers(data.members)
      } else {
        toast.error('メンバー一覧の取得に失敗しました')
      }
    } catch (error) {
      console.error('メンバー取得エラー:', error)
      toast.error('メンバー一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // メンバーの役割を変更
  const changeRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          action: 'changeRole',
          role: newRole
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        fetchMembers() // メンバー一覧を再取得
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error('役割変更エラー:', error)
      toast.error('役割変更に失敗しました')
    }
  }

  // メンバーを削除
  const removeMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          action: 'remove'
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        fetchMembers() // メンバー一覧を再取得
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error('メンバー削除エラー:', error)
      toast.error('メンバー削除に失敗しました')
    }
  }

  // グループから退会
  const leaveGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        // ページリロードまたは前のページに戻る
        window.location.href = '/groups'
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error('退会エラー:', error)
      toast.error('退会に失敗しました')
    }
  }

  // グループに参加
  const joinGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        fetchMembers() // メンバー一覧を再取得
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error('参加エラー:', error)
      toast.error('グループ参加に失敗しました')
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [groupId])

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'オーナー'
      case 'admin':
        return '管理者'
      case 'member':
        return 'メンバー'
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-red-100 text-red-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      case 'member':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin'
  const isCurrentUserMember = members.some(member => member.userId === currentUserId)

  if (loading) {
    return <div className="p-4">メンバー情報を読み込み中...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          グループメンバー ({members.length}名)
        </CardTitle>
        <div className="flex gap-2">
          {!isCurrentUserMember && (
            <Button onClick={joinGroup} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              参加する
            </Button>
          )}
          {isCurrentUserMember && currentUserRole !== 'owner' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  退会
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>グループから退会しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消せません。再度参加するには招待が必要です。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={leaveGroup}>退会する</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={member.user.avatar} />
                  <AvatarFallback>
                    {member.user.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.user.name}</p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                  <p className="text-xs text-gray-400">
                    参加日: {new Date(member.joinedAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={getRoleColor(member.role)}>
                  {getRoleLabel(member.role)}
                </Badge>
                
                {canManageMembers && member.userId !== currentUserId && (
                  <div className="flex space-x-1">
                    {member.role !== 'owner' && (
                      <Select
                        value={member.role}
                        onValueChange={(newRole) => changeRole(member.id, newRole)}
                      >
                        <SelectTrigger className="w-24">
                          <Settings className="h-4 w-4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">メンバー</SelectItem>
                          <SelectItem value="admin">管理者</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    {member.role !== 'owner' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>メンバーを削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                              {member.user.name}をこのグループから削除します。この操作は取り消せません。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeMember(member.id)}>
                              削除する
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {members.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              まだメンバーがいません
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 