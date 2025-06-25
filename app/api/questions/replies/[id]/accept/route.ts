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

    // 質問を取得して、質問者が同じかチェック
    const questionResponse = await fetch(`${JSON_SERVER_URL}/questions/${reply.questionId}`)
    if (!questionResponse.ok) {
      return NextResponse.json(
        { error: '関連する質問が見つかりません' },
        { status: 404 }
      )
    }

    const question = await questionResponse.json()

    // 質問者本人でない場合はエラー
    if (question.userId !== userId) {
      return NextResponse.json(
        { error: '質問者のみが回答を承認できます' },
        { status: 403 }
      )
    }

    // 他の承認済み回答を取り消し
    const allRepliesResponse = await fetch(`${JSON_SERVER_URL}/replies?questionId=${reply.questionId}`)
    if (allRepliesResponse.ok) {
      const allReplies = await allRepliesResponse.json()
      const acceptedReplies = allReplies.filter((r: any) => r.isAccepted && r.id !== replyId)
      
      // 他の承認済み回答を未承認にする
      for (const acceptedReply of acceptedReplies) {
        await fetch(`${JSON_SERVER_URL}/replies/${acceptedReply.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...acceptedReply,
            isAccepted: false,
            updatedAt: new Date().toISOString()
          }),
        })
      }
    }

    // 現在の返信を承認済みにする
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
      throw new Error('回答の承認に失敗しました')
    }

    const updatedReplyData = await updateResponse.json()

    return NextResponse.json(updatedReplyData)
  } catch (error) {
    console.error('回答承認エラー:', error)
    return NextResponse.json(
      { error: '回答の承認に失敗しました' },
      { status: 500 }
    )
  }
} 