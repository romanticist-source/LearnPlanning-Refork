import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const status = searchParams.get('status')
    
    let url = `${JSON_SERVER_URL}/goals`
    const params = new URLSearchParams()
    
    if (groupId) {
      params.append('groupId', groupId)
    }
    
    if (status) {
      if (status === 'completed') {
        params.append('completed', 'true')
      } else if (status === 'active') {
        params.append('completed', 'false')
      }
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
    
    const response = await fetch(url)
    let data = await response.json()
    
    // サブ目標データも取得
    const goalsWithSubgoals = await Promise.all(
      data.map(async (goal: any) => {
        try {
          const subgoalsResponse = await fetch(`${JSON_SERVER_URL}/subgoals?goalId=${goal.id}`)
          const subgoals = subgoalsResponse.ok ? await subgoalsResponse.json() : []
          return {
            ...goal,
            subgoals: subgoals.sort((a: any, b: any) => a.order - b.order)
          }
        } catch (error) {
          console.error(`Error fetching subgoals for goal ${goal.id}:`, error)
          return { ...goal, subgoals: [] }
        }
      })
    )
    
    return NextResponse.json(goalsWithSubgoals)
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