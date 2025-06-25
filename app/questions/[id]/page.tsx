"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ThumbsUp, MessageSquare, Users, Calendar, Send, Award, X } from "lucide-react"
import Header from "@/components/header"
import { getCurrentUser } from "@/lib/auth-utils"

interface Question {
  id: string
  title: string
  content: string
  tags: string[]
  groupId: string | null
  userId: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    avatar?: string
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
    avatar?: string
  }
}

export default function QuestionDetailPage() {
  const params = useParams()
  const questionId = params.id as string
  
  const [question, setQuestion] = useState<Question | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // 返信投稿関連のstate
  const [newReply, setNewReply] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  
  const repliesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeData = async () => {
      try {
        // 現在のユーザー情報を取得
        const user = await getCurrentUser()
        setCurrentUser(user)
        
        // 質問詳細を取得
        await fetchQuestion()
        
        // 返信を取得
        await fetchReplies()
      } catch (error) {
        console.error('初期データの取得に失敗しました:', error)
        setError('データの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [questionId])

  useEffect(() => {
    // 返信が更新されたら最下部にスクロール
    scrollToBottom()
  }, [replies])

  useEffect(() => {
    // 定期的に返信を更新（簡易的なリアルタイム実装）
    const interval = setInterval(() => {
      fetchReplies()
    }, 10000) // 10秒ごとに更新

    return () => clearInterval(interval)
  }, [questionId])

  const scrollToBottom = () => {
    repliesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${questionId}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('質問が見つかりません')
        } else {
          setError('質問の取得に失敗しました')
        }
        return
      }
      const data = await response.json()
      setQuestion(data)
    } catch (error) {
      console.error('質問取得エラー:', error)
      setError('質問の取得に失敗しました')
    }
  }

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/questions/${questionId}/replies`)
      if (response.ok) {
        const data = await response.json()
        setReplies(data)
      }
    } catch (error) {
      console.error('返信取得エラー:', error)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newReply.trim() || !currentUser || submitting) {
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
        setShowReplyForm(false)
        
        // すぐに最下部にスクロール
        setTimeout(scrollToBottom, 100)
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
    if (!currentUser) return

    try {
      const response = await fetch(`/api/questions/replies/${replyId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // 返信リストを更新
        setReplies(prevReplies =>
          prevReplies.map(reply =>
            reply.id === replyId
              ? { ...reply, likes: result.likes }
              : reply
          )
        )
      } else {
        console.error('いいねの送信に失敗しました')
      }
    } catch (error) {
      console.error('いいねエラー:', error)
    }
  }

  const handleAcceptReply = async (replyId: string) => {
    if (!currentUser || !question || currentUser.id !== question.userId) return

    try {
      const response = await fetch(`/api/questions/replies/${replyId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      })

      if (response.ok) {
        // 返信リストを更新
        setReplies(prevReplies =>
          prevReplies.map(reply => ({
            ...reply,
            isAccepted: reply.id === replyId
          }))
        )
      } else {
        const errorData = await response.json()
        alert(`エラー: ${errorData.error || '承認に失敗しました'}`)
      }
    } catch (error) {
      console.error('承認エラー:', error)
      alert('承認に失敗しました')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitReply(e as any)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
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
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{error || '質問が見つかりません'}</h1>
            <p className="text-gray-600 mb-4">指定された質問は存在しないか、読み込みに失敗しました。</p>
            <Button asChild>
              <a href="/questions">質問一覧に戻る</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const acceptedReply = replies.find(reply => reply.isAccepted)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <a href="/questions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              質問一覧に戻る
            </a>
          </Button>
        </div>

        {/* 質問詳細 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-3">{question.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed whitespace-pre-wrap">
                  {question.content}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {question.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={question.user?.avatar || "/placeholder.svg"} alt={question.user?.name} />
                    <AvatarFallback>{question.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{question.user?.name || '不明なユーザー'}</span>
                </div>
                
                {question.group && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{question.group.name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(question.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MessageSquare className="h-4 w-4" />
                <span>{replies.length}件の回答</span>
                {acceptedReply && (
                  <>
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">解決済み</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 返信セクション */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>回答 ({replies.length})</CardTitle>
              <CardDescription>
                {acceptedReply 
                  ? '質問者によって承認された回答があります' 
                  : 'この質問にあなたの回答を投稿してください'
                }
              </CardDescription>
            </div>
            {currentUser && (
              <Button 
                onClick={() => setShowReplyForm(!showReplyForm)}
                variant={showReplyForm ? "outline" : "default"}
              >
                {showReplyForm ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    キャンセル
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    回答する
                  </>
                )}
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 返信投稿フォーム */}
            {showReplyForm && currentUser && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="text-lg">新しい回答を投稿</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReply} className="space-y-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="回答を入力してください... (Shift+Enterで改行)"
                          className="min-h-[120px] resize-none"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={submitting || !newReply.trim()}
                        className="min-w-[100px]"
                      >
                        {submitting ? (
                          "投稿中..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            回答を投稿
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* 承認された回答を最初に表示 */}
            {acceptedReply && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">承認済み回答</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={acceptedReply.user?.avatar || "/placeholder.svg"} alt={acceptedReply.user?.name} />
                      <AvatarFallback>{acceptedReply.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{acceptedReply.user?.name || '不明なユーザー'}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(acceptedReply.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap mb-3">{acceptedReply.content}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeReply(acceptedReply.id)}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {acceptedReply.likes}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* その他の回答 */}
            {replies.filter(reply => !reply.isAccepted).length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">その他の回答</h3>
                {replies
                  .filter(reply => !reply.isAccepted)
                  .map((reply) => (
                    <Card key={reply.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={reply.user?.avatar || "/placeholder.svg"} alt={reply.user?.name} />
                            <AvatarFallback>{reply.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{reply.user?.name || '不明なユーザー'}</span>
                              <span className="text-sm text-gray-500">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap mb-3">{reply.content}</p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLikeReply(reply.id)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {reply.likes}
                              </Button>
                              {currentUser && 
                               question && 
                               currentUser.id === question.userId && 
                               !acceptedReply && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAcceptReply(reply.id)}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <Award className="h-4 w-4 mr-1" />
                                  この回答を承認
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}

            {replies.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">まだ回答がありません</p>
                <p className="text-sm">最初の回答を投稿してみませんか？</p>
              </div>
            )}
            
            <div ref={repliesEndRef} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 