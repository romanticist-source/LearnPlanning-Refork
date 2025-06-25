"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, X, UserPlus } from "lucide-react"
import { FormField } from "@/components/form/form-field"
import { createGroupSchema, type CreateGroupFormData, groupCategories } from "@/lib/schemas/group"
import { toast } from "@/components/ui/use-toast"

interface InvitedMember {
  email: string
  name: string
}

export default function CreateGroupForm() {
  const [open, setOpen] = useState(false)
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberName, setNewMemberName] = useState("")

  const methods = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
      category: "",
      maxMembers: 10,
      tags: [],
      invitedMembers: [],
      allowMemberInvites: true,
      requireApproval: false,
    },
  })

  const { handleSubmit, reset, setValue, formState: { isSubmitting } } = methods

  const addInvitedMember = () => {
    if (newMemberEmail && newMemberName) {
      const newMember = { email: newMemberEmail, name: newMemberName }
      const updatedMembers = [...invitedMembers, newMember]
      setInvitedMembers(updatedMembers)
      setValue("invitedMembers", updatedMembers)
      setNewMemberEmail("")
      setNewMemberName("")
    }
  }

  const removeInvitedMember = (index: number) => {
    const updatedMembers = invitedMembers.filter((_, i) => i !== index)
    setInvitedMembers(updatedMembers)
    setValue("invitedMembers", updatedMembers)
  }

  const onSubmit = async (data: CreateGroupFormData) => {
    try {
      console.log("フォームデータ:", data)

      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          invitedMembers: invitedMembers,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'グループの作成に失敗しました')
      }

      const createdGroup = await response.json()
      console.log('グループを作成しました:', createdGroup)

      toast({
        title: "グループを作成しました",
        description: `「${data.name}」が正常に作成されました。`,
      })

      // フォームリセット
      reset()
      setInvitedMembers([])
      setOpen(false)
      
      // ページをリロードして新しいグループを表示
      window.location.reload()
    } catch (error) {
      console.error('Error creating group:', error)
      const errorMessage = error instanceof Error ? error.message : 'グループの作成に失敗しました'
      
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新しいグループ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新しいグループを作成</DialogTitle>
          <DialogDescription>
            学習グループの詳細を入力してください。グループは後で編集することもできます。
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">基本情報</h3>
              
              <FormField
                name="name"
                label="グループ名"
                placeholder="例: プログラミング勉強会"
                required
              />

              <FormField
                name="description"
                label="説明"
                type="textarea"
                placeholder="グループの目的や活動内容を詳しく説明してください"
                required
              />

              <FormField
                name="category"
                label="カテゴリー"
                type="select"
                placeholder="カテゴリーを選択"
                options={groupCategories}
                required
              />

              <FormField
                name="maxMembers"
                label="最大メンバー数"
                type="number"
                placeholder="10"
                required
              />
            </div>

            {/* 公開設定 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">公開設定</h3>
              
              <FormField
                name="isPublic"
                label="公開グループにする"
                type="checkbox"
                description="誰でも見つけて参加できるグループにします"
              />

              <FormField
                name="requireApproval"
                label="参加申請の承認を必要とする"
                type="checkbox"
                description="新しいメンバーの参加時に管理者の承認が必要になります"
              />

              <FormField
                name="allowMemberInvites"
                label="メンバーからの招待を許可する"
                type="checkbox"
                description="一般メンバーも他の人を招待できるようになります"
              />
            </div>

            {/* メンバー招待 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">メンバー招待</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">名前</label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="招待する人の名前"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">メールアドレス</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="招待する人のメール"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={addInvitedMember}
                disabled={!newMemberEmail || !newMemberName}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                メンバーを追加
              </Button>

              {invitedMembers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">招待予定のメンバー:</h4>
                  {invitedMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div>
                        <span className="font-medium">{member.name}</span>
                        <span className="text-gray-500 ml-2">({member.email})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvitedMember(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "作成中..." : "グループを作成"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
} 