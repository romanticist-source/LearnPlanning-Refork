"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Reply, MoreHorizontal, MessageSquare } from "lucide-react"

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
}

export default function GroupChatMessages({ groupId }: { groupId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // TODO: 実際のチャットメッセージAPIから取得
        // const response = await fetch(`/api/groups/${groupId}/messages`)
        // const data = await response.json()
        // setMessages(data)
        
        // 現在は空の配列を設定
        setMessages([])
      } catch (error) {
        console.error('Failed to fetch messages:', error)
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [groupId])

  const handleLike = async (messageId: string) => {
    try {
      // TODO: 実際のAPI呼び出し
      // await fetch(`/api/messages/${messageId}/like`, { method: 'POST' })
      
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === messageId ? { ...message, likes: message.likes + 1 } : message
        )
      )
    } catch (error) {
      console.error('Failed to like message:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-2">
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

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">まだメッセージがありません</p>
        <p className="text-sm">最初のメッセージを送信してグループチャットを始めましょう</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-2">
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
              <p className="mt-1 text-gray-700">{message.content}</p>

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
                            <svg
                              className="h-4 w-4 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
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
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                  <Reply className="h-4 w-4 mr-1" />
                  返信
                </Button>
              </div>

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
                        <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(reply.id)}
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
    </div>
  )
}