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

    // Paizaユーザー統計をユーザーIDで取得
    const response = await fetch(`${API_BASE_URL}/paiza_user_stats?userId=${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch Paiza user stats')
    }

    const stats = await response.json()
    
    // 統計が存在しない場合は空の統計を返す
    if (!stats.length) {
      const emptyStats = {
        id: `stats-${userId}`,
        userId,
        totalCodeExecutions: 0,
        totalStudyMinutes: 0,
        totalProblemsSolved: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        favoriteLanguage: null,
        averageDailyExecutions: 0,
        updatedAt: new Date().toISOString()
      }
      return NextResponse.json(emptyStats)
    }

    return NextResponse.json(stats[0])
  } catch (error) {
    console.error('Error fetching Paiza user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const statsData = await request.json()
    
    // 統計データにタイムスタンプを追加
    const newStats = {
      ...statsData,
      id: `stats-${statsData.userId}`,
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${API_BASE_URL}/paiza_user_stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStats),
    })

    if (!response.ok) {
      throw new Error('Failed to create Paiza user stats')
    }

    const createdStats = await response.json()
    return NextResponse.json(createdStats, { status: 201 })
  } catch (error) {
    console.error('Error creating Paiza user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const updateData = await request.json()

    // 現在の統計を取得
    const currentResponse = await fetch(`${API_BASE_URL}/paiza_user_stats?userId=${userId}`)
    const currentStats = await currentResponse.json()
    
    if (!currentStats.length) {
      return NextResponse.json(
        { error: 'User stats not found' },
        { status: 404 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/paiza_user_stats/${currentStats[0].id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...currentStats[0],
        ...updateData,
        updatedAt: new Date().toISOString()
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update Paiza user stats')
    }

    const updatedStats = await response.json()
    return NextResponse.json(updatedStats)
  } catch (error) {
    console.error('Error updating Paiza user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}