"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Reply, MoreHorizontal } from "lucide-react"

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

  useEffect(() => {
    // 実際のアプリケーションでは、APIからメッセージを取得します
    // ここではダミーデータを使用します
    const dummyMessages: Message[] = [
      {
        id: "1",
        userId: "1",
        userName: "田中太郎",
        userAvatar: "/diverse-user-avatars.png",
        content: "みなさん、こんにちは！今週のミーティングでは、JavaScriptの非同期処理について話し合いましょう。",
        timestamp: "2025/5/8 10:23",
        likes: 3,
        replies: [],
      },
      {
        id: "2",
        userId: "2",
        userName: "佐藤花子",
        userAvatar: "/diverse-user-avatars.png",
        content: "いいですね！特にPromiseとasync/awaitの違いについて詳しく知りたいです。",
        timestamp: "2025/5/8 10:45",
        likes: 2,
        replies: [],
      },
      {
        id: "3",
        userId: "3",
        userName: "鈴木一郎",
        userAvatar: "/diverse-user-avatars.png",
        content: "私は先日、非同期処理に関する良い記事を見つけました。シェアします！",
        timestamp: "2025/5/8 11:15",
        likes: 5,
        replies: [],
        attachments: [
          {
            type: "file",
            url: "#",
            name: "javascript-async.pdf",
          },
        ],
      },
      {
        id: "4",
        userId: "4",
        userName: "高橋和子",
        userAvatar: "/diverse-user-avatars.png",
        content:
          "ありがとう！とても参考になりました。ところで、先週のTodoアプリの課題はどうですか？私はローカルストレージを使って実装してみました。",
        timestamp: "2025/5/8 13:30",
        likes: 1,
        replies: [
          {
            id: "4-1",
            userId: "5",
            userName: "伊藤健太",
            userAvatar: "/diverse-user-avatars.png",
            content: "私もローカルストレージを使いました！でも、データの永続化に少し苦戦しています...",
            timestamp: "2025/5/8 14:05",
            likes: 0,
            replies: [],
          },
          {
            id: "4-2",
            userId: "1",
            userName: "田中太郎",
            userAvatar: "/diverse-user-avatars.png",
            content: "ローカルストレージのデータ永続化について、今度のミーティングで少し時間を取って話し合いましょう！",
            timestamp: "2025/5/8 14:20",
            likes: 3,
            replies: [],
          },
        ],
      },
      {
        id: "5",
        userId: "6",
        userName: "渡辺美咲",
        userAvatar: "/diverse-user-avatars.png",
        content: "みなさん、こちらが先週のミーティングの写真です！",
        timestamp: "2025/5/8 15:10",
        likes: 7,
        replies: [],
        attachments: [
          {
            type: "image",
            url: "/modern-classroom-study.png",
            name: "meeting-photo.jpg",
          },
        ],
      },
    ]

    setMessages(dummyMessages)
  }, [groupId])

  const handleLike = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) => (message.id === messageId ? { ...message, likes: message.likes + 1 } : message)),
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

              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-gray-500 hover:text-gray-700"
                  onClick={() => handleLike(message.id)}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {message.likes}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-gray-700">
                  <Reply className="h-4 w-4 mr-1" />
                  返信
                </Button>
              </div>
            </div>
          </div>

          {message.replies && message.replies.length > 0 && (
            <div className="ml-12 space-y-3 mt-2 pl-4 border-l-2 border-gray-100">
              {message.replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={reply.userAvatar || "/placeholder.svg"} alt={reply.userName} />
                    <AvatarFallback>{reply.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{reply.userName}</p>
                        <p className="text-xs text-gray-500">{reply.timestamp}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{reply.content}</p>
                    <div className="flex gap-2 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => handleLike(reply.id)}
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
      ))}
    </div>
  )
}
