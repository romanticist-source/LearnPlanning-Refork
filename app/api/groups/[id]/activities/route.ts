import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const JSON_SERVER_URL = 'http://localhost:3005'

// グループ活動履歴を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id

    // URLパラメータを取得
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const type = url.searchParams.get('type') // フィルター用

    // 活動履歴を取得
    let queryUrl = `${JSON_SERVER_URL}/group_activities?groupId=${groupId}&_sort=createdAt&_order=desc&_limit=${limit}`
    if (type) {
      queryUrl += `&type=${type}`
    }

    const activitiesResponse = await fetch(queryUrl)
    if (!activitiesResponse.ok) {
      return NextResponse.json({ error: '活動履歴の取得に失敗しました' }, { status: 500 })
    }

    const activities = await activitiesResponse.json()

    // 各活動のユーザー情報を取得
    const activitiesWithUserInfo = await Promise.all(
      activities.map(async (activity: any) => {
        const userResponse = await fetch(`${JSON_SERVER_URL}/users/${activity.userId}`)
        const user = userResponse.ok ? await userResponse.json() : null
        
        return {
          ...activity,
          user: user
        }
      })
    )

    return NextResponse.json({
      success: true,
      activities: activitiesWithUserInfo,
      count: activitiesWithUserInfo.length
    })

  } catch (error) {
    console.error('活動履歴取得エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// グループ活動を記録
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const groupId = params.id
    const { type, description, relatedId } = await request.json()

    // 必須フィールドの検証
    if (!type || !description) {
      return NextResponse.json(
        { error: 'type, descriptionは必須です' },
        { status: 400 }
      )
    }

    // 現在のユーザーを取得
    const userResponse = await fetch(`${JSON_SERVER_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }
    
    const user = users[0]

    const activityData = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      groupId: groupId,
      userId: user.id,
      type: type,
      description: description,
      relatedId: relatedId || null,
      createdAt: new Date().toISOString()
    }

    const response = await fetch(`${JSON_SERVER_URL}/group_activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    })

    if (!response.ok) {
      return NextResponse.json({ error: '活動の記録に失敗しました' }, { status: 500 })
    }

    const createdActivity = await response.json()
    
    return NextResponse.json({
      success: true,
      activity: createdActivity,
      message: '活動を記録しました'
    }, { status: 201 })

  } catch (error) {
    console.error('活動記録エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
} 