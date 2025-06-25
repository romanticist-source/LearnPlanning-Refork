import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const JSON_SERVER_URL = 'http://localhost:3005'

// 通知一覧を取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 現在のユーザーを取得
    const userResponse = await fetch(`${JSON_SERVER_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }
    
    const user = users[0]

    // URLパラメータを取得
    const url = new URL(request.url)
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(url.searchParams.get('limit') || '20')

    // 通知を取得
    let queryUrl = `${JSON_SERVER_URL}/notifications?userId=${user.id}&_sort=createdAt&_order=desc&_limit=${limit}`
    if (unreadOnly) {
      queryUrl += '&isRead=false'
    }

    const notificationsResponse = await fetch(queryUrl)
    if (!notificationsResponse.ok) {
      return NextResponse.json({ error: '通知の取得に失敗しました' }, { status: 500 })
    }

    const notifications = await notificationsResponse.json()

    return NextResponse.json({
      success: true,
      notifications: notifications,
      count: notifications.length
    })

  } catch (error) {
    console.error('通知取得エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// 通知を作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { userId, type, title, message, relatedId } = await request.json()

    // 必須フィールドの検証
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'userId, type, title, messageは必須です' },
        { status: 400 }
      )
    }

    const notificationData = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      type: type,
      title: title,
      message: message,
      isRead: false,
      relatedId: relatedId || null,
      createdAt: new Date().toISOString()
    }

    const response = await fetch(`${JSON_SERVER_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    })

    if (!response.ok) {
      return NextResponse.json({ error: '通知の作成に失敗しました' }, { status: 500 })
    }

    const createdNotification = await response.json()
    
    return NextResponse.json({
      success: true,
      notification: createdNotification,
      message: '通知を作成しました'
    }, { status: 201 })

  } catch (error) {
    console.error('通知作成エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
} 