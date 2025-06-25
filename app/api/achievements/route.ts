import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const JSON_SERVER_URL = 'http://localhost:3005'

// ユーザーの達成記録を取得
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
    const userId = url.searchParams.get('userId') || user.id
    const type = url.searchParams.get('type') // フィルター用
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // 達成記録を取得
    let queryUrl = `${JSON_SERVER_URL}/user_achievements?userId=${userId}&_sort=earnedAt&_order=desc&_limit=${limit}`
    if (type) {
      queryUrl += `&type=${type}`
    }

    const achievementsResponse = await fetch(queryUrl)
    if (!achievementsResponse.ok) {
      return NextResponse.json({ error: '達成記録の取得に失敗しました' }, { status: 500 })
    }

    const achievements = await achievementsResponse.json()

    // 総ポイントを計算
    const totalPoints = achievements.reduce((sum: number, achievement: any) => sum + (achievement.points || 0), 0)

    return NextResponse.json({
      success: true,
      achievements: achievements,
      totalPoints: totalPoints,
      count: achievements.length
    })

  } catch (error) {
    console.error('達成記録取得エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// 新しい達成記録を作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { userId, type, title, description, iconUrl, points, relatedId } = await request.json()

    // 必須フィールドの検証
    if (!userId || !type || !title || !description) {
      return NextResponse.json(
        { error: 'userId, type, title, descriptionは必須です' },
        { status: 400 }
      )
    }

    // 同じ達成記録が既に存在するかチェック（重複防止）
    const existingResponse = await fetch(`${JSON_SERVER_URL}/user_achievements?userId=${userId}&type=${type}&relatedId=${relatedId || 'null'}`)
    const existingAchievements = await existingResponse.json()
    
    if (existingAchievements.length > 0) {
      return NextResponse.json({ 
        success: false,
        message: 'この達成記録は既に存在します',
        achievement: existingAchievements[0]
      })
    }

    const achievementData = {
      id: `achievement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      type: type,
      title: title,
      description: description,
      iconUrl: iconUrl || `/achievements/${type}.png`,
      points: points || 0,
      relatedId: relatedId || null,
      earnedAt: new Date().toISOString()
    }

    const response = await fetch(`${JSON_SERVER_URL}/user_achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(achievementData),
    })

    if (!response.ok) {
      return NextResponse.json({ error: '達成記録の作成に失敗しました' }, { status: 500 })
    }

    const createdAchievement = await response.json()

    // 達成通知を作成
    const notificationData = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      type: 'achievement',
      title: '🎉 新しい達成記録',
      message: `「${title}」を達成しました！${points}ポイント獲得`,
      isRead: false,
      relatedId: createdAchievement.id,
      createdAt: new Date().toISOString()
    }

    await fetch(`${JSON_SERVER_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    })
    
    return NextResponse.json({
      success: true,
      achievement: createdAchievement,
      message: '達成記録を作成しました'
    }, { status: 201 })

  } catch (error) {
    console.error('達成記録作成エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
} 