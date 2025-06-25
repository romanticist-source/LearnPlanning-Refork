import { NextRequest, NextResponse } from 'next/server'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: replyId } = params
    
    // 現在の返信データを取得
    const replyResponse = await fetch(`${JSON_SERVER_URL}/replies/${replyId}`)
    
    if (!replyResponse.ok) {
      if (replyResponse.status === 404) {
        return NextResponse.json(
          { error: '返信が見つかりません' },
          { status: 404 }
        )
      }
      throw new Error(`JSON Server error: ${replyResponse.status}`)
    }
    
    const reply = await replyResponse.json()
    
    // いいね数を増やして更新
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
      throw new Error(`JSON Server error: ${updateResponse.status}`)
    }

    const result = await updateResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('いいね処理エラー:', error)
    return NextResponse.json(
      { error: 'いいね処理に失敗しました' },
      { status: 500 }
    )
  }
} 