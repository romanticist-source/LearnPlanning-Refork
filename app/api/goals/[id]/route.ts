import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const goalId = params.id

    // 目標を取得
    const goalResponse = await fetch(`${API_BASE_URL}/goals/${goalId}`)
    if (!goalResponse.ok) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    const goal = await goalResponse.json()

    // ユーザー権限チェック
    const userResponse = await fetch(`${API_BASE_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    const currentUser = users[0]

    if (!currentUser || goal.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // サブ目標を取得
    const subgoalsResponse = await fetch(`${API_BASE_URL}/subgoals?goalId=${goalId}`)
    if (subgoalsResponse.ok) {
      goal.subgoals = await subgoalsResponse.json()
    } else {
      goal.subgoals = []
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error fetching goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const goalId = params.id
    const updateData = await request.json()

    // 既存目標を取得
    const goalResponse = await fetch(`${API_BASE_URL}/goals/${goalId}`)
    if (!goalResponse.ok) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    const existingGoal = await goalResponse.json()

    // ユーザー権限チェック
    const userResponse = await fetch(`${API_BASE_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    const currentUser = users[0]

    if (!currentUser || existingGoal.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 目標を更新
    const updatedGoal = {
      ...existingGoal,
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    const updateResponse = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedGoal),
    })

    if (!updateResponse.ok) {
      throw new Error('Failed to update goal')
    }

    const result = await updateResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const goalId = params.id

    // 既存目標を取得
    const goalResponse = await fetch(`${API_BASE_URL}/goals/${goalId}`)
    if (!goalResponse.ok) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    const existingGoal = await goalResponse.json()

    // ユーザー権限チェック
    const userResponse = await fetch(`${API_BASE_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    const currentUser = users[0]

    if (!currentUser || existingGoal.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // サブ目標を削除
    const subgoalsResponse = await fetch(`${API_BASE_URL}/subgoals?goalId=${goalId}`)
    if (subgoalsResponse.ok) {
      const subgoals = await subgoalsResponse.json()
      for (const subgoal of subgoals) {
        await fetch(`${API_BASE_URL}/subgoals/${subgoal.id}`, {
          method: 'DELETE',
        })
      }
    }

    // 目標を削除
    const deleteResponse = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
      method: 'DELETE',
    })

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete goal')
    }

    return NextResponse.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}