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

    // 返信IDを含むメッセージを検索
    const messagesResponse = await fetch(`${JSON_SERVER_URL}/chat_messages`)
    const messages = await messagesResponse.json()

    let targetMessage = null
    let targetReplyIndex = -1

    // 返信が含まれているメッセージを探す
    for (const message of messages) {
      if (message.replies && message.replies.length > 0) {
        const replyIndex = message.replies.findIndex((reply: any) => reply.id === replyId)
        if (replyIndex !== -1) {
          targetMessage = message
          targetReplyIndex = replyIndex
          break
        }
      }
    }

    if (!targetMessage || targetReplyIndex === -1) {
      return NextResponse.json(
        { error: '返信が見つかりません' },
        { status: 404 }
      )
    }

    // 返信のいいね数を増加
    const updatedReplies = [...targetMessage.replies]
    updatedReplies[targetReplyIndex] = {
      ...updatedReplies[targetReplyIndex],
      likes: (updatedReplies[targetReplyIndex].likes || 0) + 1,
      updatedAt: new Date().toISOString()
    }

    const updatedMessage = {
      ...targetMessage,
      replies: updatedReplies,
      updatedAt: new Date().toISOString()
    }

    const updateResponse = await fetch(`${JSON_SERVER_URL}/chat_messages/${targetMessage.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedMessage),
    })

    if (!updateResponse.ok) {
      throw new Error('いいねの更新に失敗しました')
    }

    const updatedReply = updatedReplies[targetReplyIndex]

    return NextResponse.json({
      id: updatedReply.id,
      likes: updatedReply.likes,
      messageId: targetMessage.id
    })
  } catch (error) {
    console.error('返信いいねエラー:', error)
    return NextResponse.json(
      { error: 'いいねの送信に失敗しました' },
      { status: 500 }
    )
  }
} 