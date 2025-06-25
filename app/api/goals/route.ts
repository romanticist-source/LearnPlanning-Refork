import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') // 'active', 'completed', 'all'

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

    // 目標を取得
    let goalsUrl = `${API_BASE_URL}/goals?userId=${currentUser.id}`
    
    if (groupId) {
      goalsUrl += `&groupId=${groupId}`
    }

    const goalsResponse = await fetch(goalsUrl)
    if (!goalsResponse.ok) {
      throw new Error('Failed to fetch goals')
    }

    let goals = await goalsResponse.json()

    // ステータスでフィルター
    if (status === 'active') {
      goals = goals.filter((goal: any) => !goal.completed)
    } else if (status === 'completed') {
      goals = goals.filter((goal: any) => goal.completed)
    }

    // サブ目標を取得して結合
    for (const goal of goals) {
      const subgoalsResponse = await fetch(`${API_BASE_URL}/subgoals?goalId=${goal.id}`)
      if (subgoalsResponse.ok) {
        goal.subgoals = await subgoalsResponse.json()
      } else {
        goal.subgoals = []
      }
    }

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const goalData = await request.json()

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

    // 目標データを準備
    const newGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      userId: currentUser.id,
      progress: 0,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // サブ目標を分離
    const { subgoals, ...goalWithoutSubgoals } = newGoal

    // 目標を作成
    const goalResponse = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalWithoutSubgoals),
    })

    if (!goalResponse.ok) {
      throw new Error('Failed to create goal')
    }

    const createdGoal = await goalResponse.json()

    // サブ目標を作成
    const createdSubgoals = []
    if (subgoals && Array.isArray(subgoals)) {
      for (let i = 0; i < subgoals.length; i++) {
        const subgoal = subgoals[i]
        const newSubgoal = {
          ...subgoal,
          id: `subgoal-${Date.now()}-${i}`,
          goalId: createdGoal.id,
          progress: 0,
          completed: false,
          order: i + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const subgoalResponse = await fetch(`${API_BASE_URL}/subgoals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSubgoal),
        })

        if (subgoalResponse.ok) {
          createdSubgoals.push(await subgoalResponse.json())
        }
      }
    }

    // サブ目標を含めた結果を返す
    createdGoal.subgoals = createdSubgoals

    return NextResponse.json(createdGoal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}