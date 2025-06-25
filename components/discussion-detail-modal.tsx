"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, 
  Reply, 
  ThumbsUp, 
  Send, 
  Clock, 
  User,
  FileText,
  ImageIcon,
  X
} from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { getCurrentUser } from "@/lib/auth-utils"

interface Discussion {
  id: string
  title: string
  content: string
  groupName: string
  groupId: string | null
  userId: string
  userName: string
  userAvatar?: string
  tags: string[]
  attachments?: Array<{
    name: string
    type: string
    size: string
    url?: string
  }>
  createdAt: string
  updatedAt: string
  isAnonymous: boolean
}

interface Reply {
  id: string
  content: string
  userId: string
  userName: string
  userAvatar?: string
  questionId: string
  createdAt: string
  updatedAt: string
  likes: number
  isAccepted: boolean
  attachments?: Array<{
    name: string
    type: string
    size: string
    url?: string
  }>
}

interface DiscussionDetailModalProps {
  discussionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DiscussionDetailModal({ discussionId, open, onOpenChange }: DiscussionDetailModalProps) {
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 現在のユーザー情報を取得
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('ユーザー情報の取得に失敗:', error)
      }
    }
    fetchCurrentUser()
  }, [])

  // ディスカッション詳細と返信を取得
  useEffect(() => {
    if (!discussionId || !open) return

    const fetchDiscussionDetail = async () => {
      setLoading(true)
      try {
        // ディスカッション詳細を取得
        const discussionResponse = await fetch(`/api/questions/${discussionId}`)
        if (discussionResponse.ok) {
          const discussionData = await discussionResponse.json()
          setDiscussion(discussionData)
        }

        // 返信を取得
        const repliesResponse = await fetch(`/api/questions/${discussionId}/replies`)
        if (repliesResponse.ok) {
          const repliesData = await repliesResponse.json()
          setReplies(repliesData)
        }
      } catch (error) {
        console.error('ディスカッション詳細の取得に失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDiscussionDetail()
  }, [discussionId, open])

  // 返信を投稿
  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !discussionId || !currentUser) return

    setIsSubmittingReply(true)
    try {
      const replyData = {
        id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: replyContent,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        questionId: discussionId,
        likes: 0,
        isAccepted: false,
        attachments: []
      }

      const response = await fetch(`/api/questions/${discussionId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replyData),
      })

      if (response.ok) {
        const newReply = await response.json()
        setReplies(prev => [...prev, newReply])
        setReplyContent("")
      } else {
        throw new Error('返信の投稿に失敗しました')
      }
    } catch (error) {
      console.error('返信投稿エラー:', error)
      alert('返信の投稿に失敗しました')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // いいね機能
  const handleLikeReply = async (replyId: string) => {
    try {
      const response = await fetch(`/api/questions/replies/${replyId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        setReplies(prev => prev.map(reply => 
          reply.id === replyId 
            ? { ...reply, likes: reply.likes + 1 }
            : reply
        ))
      }
    } catch (error) {
      console.error('いいね処理エラー:', error)
    }
  }

  // ベストアンサーに選定
  const handleAcceptReply = async (replyId: string) => {
    try {
      const response = await fetch(`/api/questions/replies/${replyId}/accept`, {
        method: 'POST',
      })

      if (response.ok) {
        setReplies(prev => prev.map(reply => 
          reply.id === replyId 
            ? { ...reply, isAccepted: true }
            : { ...reply, isAccepted: false }
        ))
      }
    } catch (error) {
      console.error('ベストアンサー設定エラー:', error)
    }
  }

  if (!discussion && !loading) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl mb-2">
                  {discussion?.title || 'ロード中...'}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{discussion?.isAnonymous ? '匿名ユーザー' : discussion?.userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {discussion ? format(new Date(discussion.createdAt), 'PPp', { locale: ja }) : '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{replies.length}件の返信</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <Separator />

          {/* メインコンテンツ */}
          <ScrollArea className="flex-1 p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 質問内容 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={discussion?.userAvatar || "/placeholder-user.jpg"} />
                      <AvatarFallback>
                        {discussion?.isAnonymous ? '匿' : discussion?.userName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {discussion?.isAnonymous ? '匿名ユーザー' : discussion?.userName}
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{discussion?.content}</p>
                      </div>
                      
                      {/* タグ */}
                      {discussion?.tags && discussion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {discussion.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* 添付ファイル */}
                      {discussion?.attachments && discussion.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {discussion.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                              {attachment.type.includes("image") ? (
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                              ) : (
                                <FileText className="h-4 w-4 text-blue-500" />
                              )}
                              <span className="text-sm">{attachment.name}</span>
                              <span className="text-xs text-gray-500">({attachment.size})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 返信一覧 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Reply className="h-5 w-5" />
                    返信 ({replies.length}件)
                  </h3>
                  
                  {replies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>まだ返信がありません</p>
                      <p className="text-sm">最初の返信を投稿してみましょう</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {replies
                        .sort((a, b) => {
                          // ベストアンサーを最初に表示
                          if (a.isAccepted && !b.isAccepted) return -1
                          if (!a.isAccepted && b.isAccepted) return 1
                          // その後は作成日時順
                          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        })
                        .map((reply) => (
                          <div 
                            key={reply.id} 
                            className={`border rounded-lg p-4 ${reply.isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
                          >
                            <div className="flex items-start gap-4">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={reply.userAvatar || "/placeholder-user.jpg"} />
                                <AvatarFallback>{reply.userName?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">{reply.userName}</span>
                                  {reply.isAccepted && (
                                    <Badge className="bg-green-100 text-green-800">ベストアンサー</Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(reply.createdAt), 'PPp', { locale: ja })}
                                  </span>
                                </div>
                                <div className="prose prose-sm max-w-none mb-3">
                                  <p className="whitespace-pre-wrap">{reply.content}</p>
                                </div>
                                
                                {/* 添付ファイル */}
                                {reply.attachments && reply.attachments.length > 0 && (
                                  <div className="mb-3 space-y-2">
                                    {reply.attachments.map((attachment, index) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                                        {attachment.type.includes("image") ? (
                                          <ImageIcon className="h-4 w-4 text-blue-500" />
                                        ) : (
                                          <FileText className="h-4 w-4 text-blue-500" />
                                        )}
                                        <span className="text-sm">{attachment.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* アクション */}
                                <div className="flex items-center gap-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLikeReply(reply.id)}
                                    className="text-gray-500 hover:text-blue-600"
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    {reply.likes}
                                  </Button>
                                  
                                  {/* 質問者のみベストアンサーを選択可能 */}
                                  {currentUser?.id === discussion?.userId && !reply.isAccepted && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAcceptReply(reply.id)}
                                      className="text-gray-500 hover:text-green-600"
                                    >
                                      ベストアンサーに選択
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* 返信投稿フォーム */}
                {currentUser && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">返信を投稿</h4>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="回答を入力してください..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitReply}
                          disabled={!replyContent.trim() || isSubmittingReply}
                          className="flex items-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          {isSubmittingReply ? '投稿中...' : '返信を投稿'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 