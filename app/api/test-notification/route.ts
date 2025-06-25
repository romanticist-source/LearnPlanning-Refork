import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'
import { sendNotificationToUser } from '@/app/action'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ユーザー情報を取得
    const userResponse = await fetch(`${API_BASE_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    const currentUser = users[0]

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // テスト通知を送信
    const result = await sendNotificationToUser(
      currentUser.id,
      'テスト通知',
      'グループ招待通知のテストです',
      {
        type: 'test',
        url: '/dashboard'
      }
    )

    return NextResponse.json({
      message: 'Test notification sent',
      result
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
