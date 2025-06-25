import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const JSON_SERVER_URL = 'http://localhost:3005'

// 通知を既読にする
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const notificationId = params.id
    const { isRead } = await request.json()

    // 現在のユーザーを取得
    const userResponse = await fetch(`${JSON_SERVER_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }
    
    const user = users[0]

    // 通知を取得
    const notificationResponse = await fetch(`${JSON_SERVER_URL}/notifications/${notificationId}`)
    if (!notificationResponse.ok) {
      return NextResponse.json({ error: '通知が見つかりません' }, { status: 404 })
    }

    const notification = await notificationResponse.json()

    // 通知の所有者かチェック
    if (notification.userId !== user.id) {
      return NextResponse.json({ error: 'この通知にアクセスする権限がありません' }, { status: 403 })
    }

    // 通知を更新
    const updatedNotification = {
      ...notification,
      isRead: isRead !== undefined ? isRead : true,
      readAt: isRead !== false ? new Date().toISOString() : null
    }

    const updateResponse = await fetch(`${JSON_SERVER_URL}/notifications/${notificationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedNotification),
    })

    if (!updateResponse.ok) {
      return NextResponse.json({ error: '通知の更新に失敗しました' }, { status: 500 })
    }

    const updatedData = await updateResponse.json()
    
    return NextResponse.json({
      success: true,
      notification: updatedData,
      message: isRead !== false ? '通知を既読にしました' : '通知を未読にしました'
    })

  } catch (error) {
    console.error('通知更新エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// 通知を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const notificationId = params.id

    // 現在のユーザーを取得
    const userResponse = await fetch(`${JSON_SERVER_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }
    
    const user = users[0]

    // 通知を取得
    const notificationResponse = await fetch(`${JSON_SERVER_URL}/notifications/${notificationId}`)
    if (!notificationResponse.ok) {
      return NextResponse.json({ error: '通知が見つかりません' }, { status: 404 })
    }

    const notification = await notificationResponse.json()

    // 通知の所有者かチェック
    if (notification.userId !== user.id) {
      return NextResponse.json({ error: 'この通知にアクセスする権限がありません' }, { status: 403 })
    }

    // 通知を削除
    const deleteResponse = await fetch(`${JSON_SERVER_URL}/notifications/${notificationId}`, {
      method: 'DELETE'
    })

    if (!deleteResponse.ok) {
      return NextResponse.json({ error: '通知の削除に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '通知を削除しました'
    })

  } catch (error) {
    console.error('通知削除エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
} 