"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MessageSquare, Send, ThumbsUp, Clock } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import { getCurrentUser } from "@/lib/auth-utils"

interface Question {
  id: string
  title: string
  content: string
  tags: string[]
  groupId: string | null
  userId: string
  isAnonymous: boolean
  hasNotification: boolean
  attachments: Array<{
    name: string
    size: string
    type: string
  }>
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    avatar: string
  }
  group?: {
    id: string
    name: string
  }
}

interface Reply {
  id: string
  questionId: string
  content: string
  userId: string
  isAccepted: boolean
  likes: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    avatar: string
  }
}

export default function QuestionDetailPage() {
  const params = useParams()
  const questionId = params.id as string
  
  const [question, setQuestion] = useState<Question | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [newReply, setNewReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const initializeData = async () => {
      try {
        // 現在のユーザー情報を取得
        const user = await getCurrentUser()
        setCurrentUser(user)
        
        // 質問の詳細を取得
        await fetchQuestion()
        await fetchReplies()
      } catch (error) {
        console.error('初期データの取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [questionId])

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${questionId}`)
      if (response.ok) {
        const questionData = await response.json()
        setQuestion(questionData)
      } else {
        console.error('質問の取得に失敗しました')
      }
    } catch (error) {
      console.error('質問取得エラー:', error)
    }
  }

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/questions/${questionId}/replies`)
      if (response.ok) {
        const repliesData = await response.json()
        setReplies(repliesData)
      } else {
        console.error('返信の取得に失敗しました')
      }
    } catch (error) {
      console.error('返信取得エラー:', error)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newReply.trim() || !currentUser) {
      return
    }

    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/questions/${questionId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newReply.trim(),
          userId: currentUser.id,
        }),
      })

      if (response.ok) {
        const newReplyData = await response.json()
        setReplies(prev => [...prev, newReplyData])
        setNewReply("")
      } else {
        const errorData = await response.json()
        alert(`エラー: ${errorData.error || '返信の投稿に失敗しました'}`)
      }
    } catch (error) {
      console.error('返信投稿エラー:', error)
      alert('返信の投稿に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeReply = async (replyId: string) => {
    try {
      const response = await fetch(`/api/questions/replies/${replyId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.id,
        }),
      })

      if (response.ok) {
        // 返信リストを更新
        await fetchReplies()
      } else {
        console.error('いいねの送信に失敗しました')
      }
    } catch (error) {
      console.error('いいねエラー:', error)
    }
  }

  const handleAcceptReply = async (replyId: string) => {
    try {
      const response = await fetch(`/api/questions/replies/${replyId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.id,
        }),
      })

      if (response.ok) {
        // 返信リストを更新
        await fetchReplies()
      } else {
        console.error('回答の承認に失敗しました')
      }
    } catch (error) {
      console.error('回答承認エラー:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">質問が見つかりません</h2>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                ダッシュボードに戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </Link>
        </div>

        {/* 質問の詳細 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{question.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={question.user?.avatar || "/placeholder.svg"} alt={question.user?.name} />
                      <AvatarFallback>{question.user?.name?.charAt(0) || '匿'}</AvatarFallback>
                    </Avatar>
                    <span>{question.isAnonymous ? '匿名ユーザー' : question.user?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(question.createdAt)}</span>
                  </div>
                  {question.group && (
                    <Badge variant="secondary">{question.group.name}</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">{question.content}</p>
            </div>
            
            {question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}

            {question.attachments?.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">添付ファイル</h4>
                <div className="space-y-2">
                  {question.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{file.name}</span>
                      <span className="text-gray-500">({file.size})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 返信フォーム */}
        {currentUser && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">回答を投稿</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReply}>
                <div className="space-y-4">
                  <Textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="回答を入力してください..."
                    rows={4}
                    required
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={submitting || !newReply.trim()}>
                      {submitting ? (
                        "投稿中..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          回答を投稿
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 返信一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              回答 ({replies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {replies.length > 0 ? (
              <div className="space-y-6">
                {replies.map((reply, index) => (
                  <div key={reply.id}>
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={reply.user?.avatar || "/placeholder.svg"} alt={reply.user?.name} />
                        <AvatarFallback>{reply.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{reply.user?.name || '匿名ユーザー'}</span>
                          <span className="text-sm text-gray-500">{formatDate(reply.createdAt)}</span>
                          {reply.isAccepted && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              承認済み
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap mb-3">{reply.content}</p>
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
                          {currentUser && currentUser.id === question.userId && !reply.isAccepted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcceptReply(reply.id)}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              回答として承認
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < replies.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>まだ回答がありません</p>
                <p className="text-sm">最初の回答を投稿してみましょう</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 