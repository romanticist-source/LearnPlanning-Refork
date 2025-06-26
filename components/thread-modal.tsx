"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export type Thread = {
  id: string
  userName: string
  userAvatar: string
  content: string
  timestamp: string
  replies: {
    id: string
    userName: string
    userAvatar: string
    content: string
    timestamp: string
    likes: number
  }[]
}

type Props = {
  open: boolean
  onOpenChange: (value: boolean) => void
  thread: Thread | null
  onSendReply: (content: string) => Promise<void>
}

export default function ThreadModal({ open, onOpenChange, thread, onSendReply }: Props) {
  const [replyContent, setReplyContent] = useState("")
  const [sending, setSending] = useState(false)

  if (!thread) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || sending) return
    setSending(true)
    try {
      await onSendReply(replyContent.trim())
      setReplyContent("")
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>スレッド</DialogTitle>
          <DialogDescription>元メッセージとその返信を確認できます。</DialogDescription>
        </DialogHeader>

        {/* 元メッセージ */}
        <div className="flex gap-3 py-2 border-b">
          <Avatar className="h-10 w-10">
            <AvatarImage src={thread.userAvatar || "/placeholder.svg"} alt={thread.userName} />
            <AvatarFallback>{thread.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{thread.userName}</p>
            <p className="text-xs text-gray-500">{thread.timestamp}</p>
            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{thread.content}</p>
          </div>
        </div>

        {/* 返信リスト */}
        <div className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
          {thread.replies.length === 0 ? (
            <p className="text-sm text-gray-500 flex items-center gap-1"><MessageSquare className="h-4 w-4" /> まだ返信がありません</p>
          ) : (
            thread.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.userAvatar || "/placeholder.svg"} alt={reply.userName} />
                  <AvatarFallback>{reply.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{reply.userName}</p>
                    <p className="text-xs text-gray-500">{reply.timestamp}</p>
                  </div>
                  <p className="text-sm whitespace-pre-wrap mt-1">{reply.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 返信入力 */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-2 sticky bottom-0 bg-white pt-4">
          <Textarea
            placeholder="返信を入力… (Shift+Enterで改行)"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[80px] resize-none"
            disabled={sending}
          />
          <div className="text-right">
            <Button size="sm" type="submit" disabled={sending || !replyContent.trim()} className="min-w-[80px]">
              {sending ? "送信中…" : <><Send className="h-4 w-4 mr-1"/>送信</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 