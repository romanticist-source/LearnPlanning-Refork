import { NextRequest, NextResponse } from 'next/server'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id
    const body = await request.json()
    const { content, userId } = body

    if (!content || !userId) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    // 元のメッセージを取得
    const messageResponse = await fetch(`${JSON_SERVER_URL}/chat_messages/${messageId}`)
    if (!messageResponse.ok) {
      return NextResponse.json(
        { error: 'メッセージが見つかりません' },
        { status: 404 }
      )
    }

    const message = await messageResponse.json()

    // ID生成用のヘルパー関数
    const generateId = (prefix: string): string => {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    // 新しい返信を作成
    const newReply = {
      id: generateId('reply'),
      userId,
      content,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 元のメッセージに返信を追加
    const updatedMessage = {
      ...message,
      replies: [...(message.replies || []), newReply],
      updatedAt: new Date().toISOString()
    }

    const updateResponse = await fetch(`${JSON_SERVER_URL}/chat_messages/${messageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedMessage),
    })

    if (!updateResponse.ok) {
      throw new Error('返信の追加に失敗しました')
    }

    // ユーザー情報を取得して返信データに付加
    let user = null
    if (newReply.userId) {
      try {
        const userResponse = await fetch(`${JSON_SERVER_URL}/users/${newReply.userId}`)
        if (userResponse.ok) {
          user = await userResponse.json()
        }
      } catch (error) {
        console.warn('ユーザー情報の取得に失敗しました:', error)
      }
    }

    const responseData = {
      id: newReply.id,
      userId: newReply.userId,
      userName: user?.name || '不明なユーザー',
      userAvatar: user?.avatar || '',
      content: newReply.content,
      timestamp: new Date(newReply.createdAt).toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      likes: newReply.likes,
      createdAt: newReply.createdAt
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('返信投稿エラー:', error)
    return NextResponse.json(
      { error: '返信の投稿に失敗しました' },
      { status: 500 }
    )
  }
} 