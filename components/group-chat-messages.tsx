"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, Reply, MoreHorizontal, MessageSquare, Send, Image, Paperclip, X } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-utils"

type Message = {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: string
  likes: number
  replies: Message[]
  attachments?: {
    type: "image" | "file"
    url: string
    name: string
  }[]
  createdAt: string
}

export default function GroupChatMessages({ groupId }: { groupId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [sendingReply, setSendingReply] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeData = async () => {
      try {
        // 現在のユーザー情報を取得
        const user = await getCurrentUser()
        setCurrentUser(user)
        
        // メッセージを取得
        await fetchMessages()
      } catch (error) {
        console.error('初期データの取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [groupId])

  useEffect(() => {
    // メッセージが更新されたら最下部にスクロール
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // 定期的にメッセージを更新（簡易的なリアルタイム実装）
    const interval = setInterval(() => {
      fetchMessages()
    }, 5000) // 5秒ごとに更新

    return () => clearInterval(interval)
  }, [groupId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('メッセージの取得に失敗しました:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !currentUser || sending) {
      return
    }

    setSending(true)
    
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          userId: currentUser.id,
        }),
      })

      if (response.ok) {
        const newMessageData = await response.json()
        setMessages(prev => [...prev, newMessageData])
        setNewMessage("")
        
        // すぐに最下部にスクロール
        setTimeout(scrollToBottom, 100)
      } else {
        const errorData = await response.json()
        alert(`エラー: ${errorData.error || 'メッセージの送信に失敗しました'}`)
      }
    } catch (error) {
      console.error('メッセージ送信エラー:', error)
      alert('メッセージの送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent, messageId: string) => {
    e.preventDefault()
    
    if (!replyContent.trim() || !currentUser || sendingReply) {
      return
    }

    setSendingReply(true)
    
    try {
      const response = await fetch(`/api/messages/${messageId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          userId: currentUser.id,
        }),
      })

      if (response.ok) {
        const newReplyData = await response.json()
        
        // メッセージリストを更新
        setMessages(prevMessages =>
          prevMessages.map(message =>
            message.id === messageId
              ? { ...message, replies: [...message.replies, newReplyData] }
              : message
          )
        )
        
        setReplyContent("")
        setReplyingTo(null)
        
        // すぐに最下部にスクロール
        setTimeout(scrollToBottom, 100)
      } else {
        const errorData = await response.json()
        alert(`エラー: ${errorData.error || '返信の送信に失敗しました'}`)
      }
    } catch (error) {
      console.error('返信送信エラー:', error)
      alert('返信の送信に失敗しました')
    } finally {
      setSendingReply(false)
    }
  }

  const handleLike = async (messageId: string) => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/messages/${messageId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      })

      if (response.ok) {
        // メッセージリストを更新
        setMessages(prevMessages =>
          prevMessages.map(message =>
            message.id === messageId 
              ? { ...message, likes: message.likes + 1 }
              : message
          )
        )
      } else {
        console.error('いいねの送信に失敗しました')
      }
    } catch (error) {
      console.error('いいねエラー:', error)
    }
  }

  const handleReplyLike = async (replyId: string, messageId: string) => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/replies/${replyId}/like`, {
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
        
        // メッセージリストを更新
        setMessages(prevMessages =>
          prevMessages.map(message =>
            message.id === messageId
              ? {
                  ...message,
                  replies: message.replies.map(reply =>
                    reply.id === replyId
                      ? { ...reply, likes: result.likes }
                      : reply
                  )
                }
              : message
          )
        )
      } else {
        console.error('返信いいねの送信に失敗しました')
      }
    } catch (error) {
      console.error('返信いいねエラー:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as any)
    }
  }

  const handleReplyKeyPress = (e: React.KeyboardEvent, messageId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendReply(e as any, messageId)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">まだメッセージがありません</p>
            <p className="text-sm">最初のメッセージを送信してグループチャットを始めましょう</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={message.userAvatar || "/placeholder.svg"} alt={message.userName} />
                    <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{message.userName}</p>
                        <p className="text-xs text-gray-500">{message.timestamp}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{message.content}</p>

                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="mt-2">
                            {attachment.type === "image" ? (
                              <div className="relative h-48 w-full max-w-md rounded-lg overflow-hidden">
                                <img
                                  src={attachment.url || "/placeholder.svg"}
                                  alt={attachment.name}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border max-w-md">
                                <div className="bg-blue-100 p-2 rounded-full">
                                  <Paperclip className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium">{attachment.name}</span>
                                <Button variant="ghost" size="sm" className="ml-auto">
                                  ダウンロード
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(message.id)}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {message.likes}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-blue-600"
                        onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        返信
                      </Button>
                    </div>

                    {/* 返信入力フォーム */}
                    {replyingTo === message.id && currentUser && (
                      <div className="mt-4 ml-4 border-l-2 border-gray-100 pl-4">
                        <form onSubmit={(e) => handleSendReply(e, message.id)} className="space-y-2">
                          <div className="flex gap-2 items-start">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                              <AvatarFallback>{currentUser.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyPress={(e) => handleReplyKeyPress(e, message.id)}
                                placeholder="返信を入力... (Shift+Enterで改行)"
                                className="min-h-[60px] resize-none text-sm"
                                disabled={sendingReply}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyContent("")
                              }}
                              className="h-6 w-6"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              size="sm"
                              disabled={sendingReply || !replyContent.trim()}
                            >
                              {sendingReply ? (
                                "送信中..."
                              ) : (
                                <>
                                  <Send className="h-3 w-3 mr-1" />
                                  返信
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* 返信表示 */}
                    {message.replies && message.replies.length > 0 && (
                      <div className="ml-4 mt-4 border-l-2 border-gray-100 pl-4 space-y-3">
                        {message.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={reply.userAvatar || "/placeholder.svg"} alt={reply.userName} />
                              <AvatarFallback>{reply.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{reply.userName}</p>
                                <p className="text-xs text-gray-500">{reply.timestamp}</p>
                              </div>
                              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{reply.content}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReplyLike(reply.id, message.id)}
                                  className="text-gray-500 hover:text-blue-600 text-xs"
                                >
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  {reply.likes}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* メッセージ入力フォーム */}
      {currentUser && (
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="メッセージを入力... (Shift+Enterで改行)"
                  className="min-h-[60px] resize-none"
                  disabled={sending}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" disabled>
                  <Image className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" disabled>
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                type="submit" 
                disabled={sending || !newMessage.trim()}
                className="min-w-[80px]"
              >
                {sending ? (
                  "送信中..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    送信
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}