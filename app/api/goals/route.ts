import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function GET() {
  try {
    const response = await fetch(`${JSON_SERVER_URL}/goals`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('目標取得エラー:', error)
    return NextResponse.json(
      { error: '目標の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 必要なフィールドの検証
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'タイトルと説明は必須です' },
        { status: 400 }
      )
    }

    // JSON Serverに送信するデータを整形
    const goalData = {
      id: body.id,
      title: body.title,
      description: body.description,
      deadline: body.deadline,
      priority: body.priority || 'medium',
      progress: 0,
      completed: false,
      userId: body.userId,
      groupId: body.groupId || null,
      isGroupGoal: body.isGroupGoal || false,
      isPublic: body.isPublic || false,
      hasReminder: body.hasReminder || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${JSON_SERVER_URL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    })

    if (!response.ok) {
      throw new Error(`JSON Server error: ${response.status}`)
    }

    const createdGoal = await response.json()
    
    // サブ目標がある場合は作成
    if (body.subgoals && Array.isArray(body.subgoals)) {
      for (const [index, subgoal] of body.subgoals.entries()) {
        if (subgoal.title) {
          const subgoalData = {
            id: `subgoal-${Date.now()}-${index}`,
            title: subgoal.title,
            description: subgoal.description || '',
            deadline: subgoal.deadline || null,
            progress: 0,
            completed: false,
            goalId: createdGoal.id,
            order: index + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          await fetch(`${JSON_SERVER_URL}/subgoals`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subgoalData),
          })
        }
      }
    }

    return NextResponse.json(createdGoal, { status: 201 })
  } catch (error) {
    console.error('目標作成エラー:', error)
    return NextResponse.json(
      { error: '目標の作成に失敗しました' },
      { status: 500 }
    )
  }
}