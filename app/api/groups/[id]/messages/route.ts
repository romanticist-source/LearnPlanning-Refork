import { NextRequest, NextResponse } from 'next/server'

const JSON_SERVER_URL = 'http://localhost:3005'

// グループチャットメッセージ一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id

    // 該当するグループのメッセージを取得
    const messagesResponse = await fetch(`${JSON_SERVER_URL}/chat_messages?groupId=${groupId}&_sort=createdAt&_order=asc`)
    const messages = await messagesResponse.json()

    // 各メッセージにユーザー情報を付加
    const messagesWithUsers = await Promise.all(
      messages.map(async (message: any) => {
        let user = null
        if (message.userId) {
          try {
            const userResponse = await fetch(`${JSON_SERVER_URL}/users/${message.userId}`)
            if (userResponse.ok) {
              user = await userResponse.json()
            }
          } catch (error) {
            console.warn('ユーザー情報の取得に失敗しました:', error)
          }
        }

        return {
          id: message.id,
          userId: message.userId,
          userName: user?.name || '不明なユーザー',
          userAvatar: user?.avatar || '',
          content: message.content,
          timestamp: new Date(message.createdAt).toLocaleString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          likes: message.likes || 0,
          replies: message.replies || [],
          attachments: message.attachments || [],
          createdAt: message.createdAt
        }
      })
    )

    return NextResponse.json(messagesWithUsers)
  } catch (error) {
    console.error('チャットメッセージ取得エラー:', error)
    return NextResponse.json(
      { error: 'メッセージの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 新しいチャットメッセージを投稿
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id
    const body = await request.json()
    
    const { content, userId, attachments } = body

    if (!content || !userId) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    // ID生成用のヘルパー関数
    const generateId = (prefix: string): string => {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    const messageData = {
      id: generateId('message'),
      groupId,
      userId,
      content,
      likes: 0,
      replies: [],
      attachments: attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${JSON_SERVER_URL}/chat_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    })

    if (!response.ok) {
      throw new Error('メッセージの投稿に失敗しました')
    }

    const createdMessage = await response.json()

    // ユーザー情報を取得して付加
    let user = null
    if (createdMessage.userId) {
      try {
        const userResponse = await fetch(`${JSON_SERVER_URL}/users/${createdMessage.userId}`)
        if (userResponse.ok) {
          user = await userResponse.json()
        }
      } catch (error) {
        console.warn('ユーザー情報の取得に失敗しました:', error)
      }
    }

    const responseData = {
      id: createdMessage.id,
      userId: createdMessage.userId,
      userName: user?.name || '不明なユーザー',
      userAvatar: user?.avatar || '',
      content: createdMessage.content,
      timestamp: new Date(createdMessage.createdAt).toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      likes: createdMessage.likes,
      replies: createdMessage.replies,
      attachments: createdMessage.attachments,
      createdAt: createdMessage.createdAt
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('メッセージ投稿エラー:', error)
    return NextResponse.json(
      { error: 'メッセージの投稿に失敗しました' },
      { status: 500 }
    )
  }
} 