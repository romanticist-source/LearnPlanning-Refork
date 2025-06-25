import { NextRequest, NextResponse } from 'next/server'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const replyId = params.id
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      )
    }

    // 返信を取得
    const replyResponse = await fetch(`${JSON_SERVER_URL}/replies/${replyId}`)
    if (!replyResponse.ok) {
      return NextResponse.json(
        { error: '返信が見つかりません' },
        { status: 404 }
      )
    }

    const reply = await replyResponse.json()

    // いいね数を増加
    const updatedReply = {
      ...reply,
      likes: (reply.likes || 0) + 1,
      updatedAt: new Date().toISOString()
    }

    const updateResponse = await fetch(`${JSON_SERVER_URL}/replies/${replyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedReply),
    })

    if (!updateResponse.ok) {
      throw new Error('いいねの更新に失敗しました')
    }

    const updatedReplyData = await updateResponse.json()

    return NextResponse.json({
      id: updatedReplyData.id,
      likes: updatedReplyData.likes,
      questionId: updatedReplyData.questionId
    })
  } catch (error) {
    console.error('返信いいねエラー:', error)
    return NextResponse.json(
      { error: 'いいねの送信に失敗しました' },
      { status: 500 }
    )
  }
} 