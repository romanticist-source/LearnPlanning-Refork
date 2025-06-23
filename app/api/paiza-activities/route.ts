import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // PaizaアクティビティデータをユーザーIDで取得
    const response = await fetch(`${API_BASE_URL}/paiza_activities?userId=${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch Paiza activities')
    }

    const activities = await response.json()
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching Paiza activities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const activityData = await request.json()
    
    // アクティビティデータにタイムスタンプを追加
    const newActivity = {
      ...activityData,
      id: `activity-${Date.now()}`,
      createdAt: new Date().toISOString()
    }

    const response = await fetch(`${API_BASE_URL}/paiza_activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newActivity),
    })

    if (!response.ok) {
      throw new Error('Failed to create Paiza activity')
    }

    const createdActivity = await response.json()
    
    // ユーザー統計を更新
    await updateUserStats(activityData.userId, newActivity)
    
    return NextResponse.json(createdActivity, { status: 201 })
  } catch (error) {
    console.error('Error creating Paiza activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activityId = searchParams.get('id')
    
    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      )
    }

    const updateData = await request.json()

    const response = await fetch(`${API_BASE_URL}/paiza_activities/${activityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updateData,
        updatedAt: new Date().toISOString()
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update Paiza activity')
    }

    const updatedActivity = await response.json()
    
    // ユーザー統計を更新
    await updateUserStats(updateData.userId, updatedActivity)
    
    return NextResponse.json(updatedActivity)
  } catch (error) {
    console.error('Error updating Paiza activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ユーザー統計を更新する関数
async function updateUserStats(userId: string, activity: any) {
  try {
    // 現在の統計を取得
    const statsResponse = await fetch(`${API_BASE_URL}/paiza_user_stats?userId=${userId}`)
    const stats = await statsResponse.json()
    const currentStats = stats[0]

    // 全アクティビティを取得して統計を再計算
    const activitiesResponse = await fetch(`${API_BASE_URL}/paiza_activities?userId=${userId}`)
    const activities = await activitiesResponse.json()

    // 統計を計算
    const totalCodeExecutions = activities.reduce((sum: number, act: any) => sum + act.codeExecutions, 0)
    const totalStudyMinutes = activities.reduce((sum: number, act: any) => sum + act.studyMinutes, 0)
    const totalProblemsSolved = activities.reduce((sum: number, act: any) => sum + act.problemsSolved, 0)

    // ストリークを計算
    const sortedActivities = activities
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let previousDate: Date | null = null

    for (const act of sortedActivities) {
      const actDate = new Date(act.date)
      
      if (!previousDate) {
        tempStreak = 1
        currentStreak = 1
      } else {
        const dayDiff = Math.floor((previousDate.getTime() - actDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayDiff === 1) {
          tempStreak++
          if (previousDate.toDateString() === new Date().toDateString() || 
              Math.floor((new Date().getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)) <= 1) {
            currentStreak = tempStreak
          }
        } else {
          tempStreak = 1
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak)
      previousDate = actDate
    }

    // 好きな言語を計算
    const languageCounts = activities.reduce((counts: Record<string, number>, act: any) => {
      counts[act.language] = (counts[act.language] || 0) + 1
      return counts
    }, {})
    
    const favoriteLanguage = Object.entries(languageCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'JavaScript'

    // 平均を計算
    const daysSinceStart = activities.length > 0 ? 
      Math.max(1, Math.floor((new Date().getTime() - new Date(activities[0].date).getTime()) / (1000 * 60 * 60 * 24))) : 1
    const averageDailyExecutions = Math.round((totalCodeExecutions / daysSinceStart) * 10) / 10

    const updatedStats = {
      id: currentStats?.id || `stats-${userId}`,
      userId,
      totalCodeExecutions,
      totalStudyMinutes,
      totalProblemsSolved,
      currentStreak,
      longestStreak,
      lastActivityDate: activity.date,
      favoriteLanguage,
      averageDailyExecutions,
      updatedAt: new Date().toISOString()
    }

    // 統計を更新または作成
    if (currentStats) {
      await fetch(`${API_BASE_URL}/paiza_user_stats/${currentStats.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStats),
      })
    } else {
      await fetch(`${API_BASE_URL}/paiza_user_stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStats),
      })
    }
  } catch (error) {
    console.error('Error updating user stats:', error)
  }
}