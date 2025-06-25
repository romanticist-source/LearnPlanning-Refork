import { NextRequest, NextResponse } from 'next/server'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    
    let url = `${JSON_SERVER_URL}/events`
    
    // groupIdが指定されている場合はフィルタリング
    if (groupId) {
      url += `?groupId=${encodeURIComponent(groupId)}`
    }
    
    const response = await fetch(url)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('イベント取得エラー:', error)
    return NextResponse.json(
      { error: 'イベントの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 必要なフィールドの検証
    if (!body.title || !body.date) {
      return NextResponse.json(
        { error: 'タイトルと日付は必須です' },
        { status: 400 }
      )
    }

    // JSON Serverに送信するデータを整形
    const eventData = {
      id: body.id,
      title: body.title,
      description: body.description || '',
      date: body.date,
      startTime: body.startTime || '',
      endTime: body.endTime || '',
      eventType: body.eventType || 'meeting',
      isGroupEvent: body.isGroupEvent || false,
      groupId: body.groupId || null,
      userId: body.userId,
      hasReminder: body.hasReminder || false,
      isRecurring: body.isRecurring || false,
      isOnline: body.isOnline || false,
      meetingUrl: body.meetingUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${JSON_SERVER_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      throw new Error(`JSON Server error: ${response.status}`)
    }

    const createdEvent = await response.json()
    return NextResponse.json(createdEvent, { status: 201 })
  } catch (error) {
    console.error('イベント作成エラー:', error)
    return NextResponse.json(
      { error: 'イベントの作成に失敗しました' },
      { status: 500 }
    )
  }
} 