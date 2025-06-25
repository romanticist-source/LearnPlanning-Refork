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
    const questionId = reply.questionId
    
    // 同じ質問の他の返信のベストアンサーを解除
    const allRepliesResponse = await fetch(`${JSON_SERVER_URL}/replies?questionId=${questionId}`)
    if (allRepliesResponse.ok) {
      const allReplies = await allRepliesResponse.json()
      
      // 他の返信のisAcceptedをfalseに設定
      await Promise.all(
        allReplies
          .filter((r: any) => r.id !== replyId && r.isAccepted)
          .map(async (r: any) => {
            await fetch(`${JSON_SERVER_URL}/replies/${r.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...r,
                isAccepted: false,
                updatedAt: new Date().toISOString()
              }),
            })
          })
      )
    }
    
    // 指定された返信をベストアンサーに設定
    const updatedReply = {
      ...reply,
      isAccepted: true,
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
    console.error('ベストアンサー設定エラー:', error)
    return NextResponse.json(
      { error: 'ベストアンサー設定に失敗しました' },
      { status: 500 }
    )
  }
} 