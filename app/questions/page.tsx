"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MessageSquare, Search, Clock, Plus } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import CreateQuestionModal from "@/components/create-question-modal"

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
  replyCount?: number
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    // 検索フィルタリング
    if (searchTerm.trim() === "") {
      setFilteredQuestions(questions)
    } else {
      const filtered = questions.filter(question =>
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredQuestions(filtered)
    }
  }, [searchTerm, questions])

  const fetchQuestions = async () => {
    try {
      // 質問を取得
      const questionsResponse = await fetch('/api/questions')
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        
        // 各質問の詳細情報を取得
        const questionsWithDetails = await Promise.all(
          questionsData.map(async (question: any) => {
            // ユーザー情報を取得
            let user = null
            if (question.userId && !question.isAnonymous) {
              try {
                const userResponse = await fetch('/api/users/' + question.userId)
                if (userResponse.ok) {
                  user = await userResponse.json()
                }
              } catch (error) {
                console.warn('ユーザー情報の取得に失敗しました:', error)
              }
            }

            // グループ情報を取得
            let group = null
            if (question.groupId) {
              try {
                const groupResponse = await fetch('/api/groups/' + question.groupId)
                if (groupResponse.ok) {
                  group = await groupResponse.json()
                }
              } catch (error) {
                console.warn('グループ情報の取得に失敗しました:', error)
              }
            }

            // 返信数を取得
            let replyCount = 0
            try {
              const repliesResponse = await fetch(`/api/questions/${question.id}/replies`)
              if (repliesResponse.ok) {
                const replies = await repliesResponse.json()
                replyCount = replies.length
              }
            } catch (error) {
              console.warn('返信数の取得に失敗しました:', error)
            }

            return {
              ...question,
              user: user ? {
                id: user.id,
                name: user.name,
                avatar: user.avatar
              } : null,
              group: group ? {
                id: group.id,
                name: group.name
              } : null,
              replyCount
            }
          })
        )

        setQuestions(questionsWithDetails)
      }
    } catch (error) {
      console.error('質問の取得に失敗しました:', error)
    } finally {
      setLoading(false)
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
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                ダッシュボードに戻る
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">質問・ディスカッション</h1>
            <p className="text-gray-600 mt-2">グループメンバーと知識を共有しましょう</p>
          </div>
          <CreateQuestionModal />
        </div>

        {/* 検索バー */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="質問を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 質問一覧 */}
        <div className="space-y-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Link href={`/questions/${question.id}`} className="block">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold hover:text-blue-600 transition-colors">
                        {question.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 ml-4">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(question.createdAt)}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {question.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={question.user?.avatar || "/placeholder.svg"} alt={question.user?.name} />
                            <AvatarFallback>{question.user?.name?.charAt(0) || '匿'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">
                            {question.isAnonymous ? '匿名ユーザー' : question.user?.name}
                          </span>
                        </div>

                        {question.group && (
                          <Badge variant="secondary">{question.group.name}</Badge>
                        )}

                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MessageSquare className="h-4 w-4" />
                          <span>{question.replyCount || 0}件の回答</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {question.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {question.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{question.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? '検索結果が見つかりません' : '質問がまだありません'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? '別のキーワードで検索してみてください' 
                    : '最初の質問を投稿してディスカッションを始めましょう'
                  }
                </p>
                {!searchTerm && <CreateQuestionModal />}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 