import { NextRequest, NextResponse } from 'next/server'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: questionId } = params
    
    // 返信データを取得
    const repliesResponse = await fetch(`${JSON_SERVER_URL}/replies?questionId=${questionId}`)
    
    if (!repliesResponse.ok) {
      throw new Error(`JSON Server error: ${repliesResponse.status}`)
    }
    
    const replies = await repliesResponse.json()
    
    // 各返信にユーザー情報を追加
    const enrichedReplies = await Promise.all(
      replies.map(async (reply: any) => {
        let userName = 'ユーザー'
        let userAvatar = '/placeholder-user.jpg'
        
        try {
          const userResponse = await fetch(`${JSON_SERVER_URL}/users/${reply.userId}`)
          if (userResponse.ok) {
            const user = await userResponse.json()
            userName = user.name
            userAvatar = user.avatar
          }
        } catch (error) {
          console.log('ユーザー情報取得失敗、デフォルト値を使用')
        }
        
        return {
          ...reply,
          userName,
          userAvatar
        }
      })
    )
    
    return NextResponse.json(enrichedReplies)
  } catch (error) {
    console.error('返信取得エラー:', error)
    return NextResponse.json(
      { error: '返信の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: questionId } = params
    const body = await request.json()
    
    // 必要なフィールドの検証
    if (!body.content || !body.userId) {
      return NextResponse.json(
        { error: '返信内容とユーザーIDは必須です' },
        { status: 400 }
      )
    }

    // JSON Serverに送信するデータを整形
    const replyData = {
      id: body.id,
      content: body.content,
      userId: body.userId,
      questionId: questionId,
      likes: body.likes || 0,
      isAccepted: body.isAccepted || false,
      attachments: body.attachments || [],
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
      throw new Error(`JSON Server error: ${response.status}`)
    }

    const createdReply = await response.json()
    
    // ユーザー情報を追加してレスポンス
    let userName = body.userName || 'ユーザー'
    let userAvatar = body.userAvatar || '/placeholder-user.jpg'
    
    const enrichedReply = {
      ...createdReply,
      userName,
      userAvatar
    }
    
    return NextResponse.json(enrichedReply, { status: 201 })
  } catch (error) {
    console.error('返信投稿エラー:', error)
    return NextResponse.json(
      { error: '返信の投稿に失敗しました' },
      { status: 500 }
    )
  }
} 