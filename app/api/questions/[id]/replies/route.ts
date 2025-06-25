import { NextRequest, NextResponse } from 'next/server'

const JSON_SERVER_URL = 'http://localhost:3005'

// 返信一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id

    // 該当する質問の返信を取得
    const repliesResponse = await fetch(`${JSON_SERVER_URL}/replies?questionId=${questionId}&_sort=createdAt&_order=asc`)
    const replies = await repliesResponse.json()

    // 各返信にユーザー情報を付加
    const repliesWithUsers = await Promise.all(
      replies.map(async (reply: any) => {
        let user = null
        if (reply.userId) {
          try {
            const userResponse = await fetch(`${JSON_SERVER_URL}/users/${reply.userId}`)
            if (userResponse.ok) {
              user = await userResponse.json()
            }
          } catch (error) {
            console.warn('ユーザー情報の取得に失敗しました:', error)
          }
        }

        return {
          ...reply,
          user: user ? {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          } : null
        }
      })
    )

    return NextResponse.json(repliesWithUsers)
  } catch (error) {
    console.error('返信取得エラー:', error)
    return NextResponse.json(
      { error: '返信の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 新しい返信を投稿
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id
    const body = await request.json()
    
    const { content, userId } = body

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

    const replyData = {
      id: generateId('reply'),
      questionId,
      content,
      userId,
      isAccepted: false,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${JSON_SERVER_URL}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replyData),
    })

    if (!response.ok) {
      throw new Error('返信の投稿に失敗しました')
    }

    const createdReply = await response.json()

    // ユーザー情報を取得して付加
    let user = null
    if (createdReply.userId) {
      try {
        const userResponse = await fetch(`${JSON_SERVER_URL}/users/${createdReply.userId}`)
        if (userResponse.ok) {
          user = await userResponse.json()
        }
      } catch (error) {
        console.warn('ユーザー情報の取得に失敗しました:', error)
      }
    }

    const responseData = {
      ...createdReply,
      user: user ? {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      } : null
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