import { NextRequest, NextResponse } from 'next/server'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function GET() {
  try {
    const response = await fetch(`${JSON_SERVER_URL}/questions`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('質問取得エラー:', error)
    return NextResponse.json(
      { error: '質問の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 必要なフィールドの検証
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'タイトルと質問内容は必須です' },
        { status: 400 }
      )
    }

    // JSON Serverに送信するデータを整形
    const questionData = {
      id: body.id,
      title: body.title,
      content: body.content,
      tags: body.tags || [],
      groupId: body.groupId || null,
      userId: body.userId,
      isAnonymous: body.isAnonymous || false,
      hasNotification: body.hasNotification || true,
      attachments: body.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${JSON_SERVER_URL}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData),
    })

    if (!response.ok) {
      throw new Error(`JSON Server error: ${response.status}`)
    }

    const createdQuestion = await response.json()
    return NextResponse.json(createdQuestion, { status: 201 })
  } catch (error) {
    console.error('質問投稿エラー:', error)
    return NextResponse.json(
      { error: '質問の投稿に失敗しました' },
      { status: 500 }
    )
  }
} 