import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // JSON Serverからユーザーを検索
    const response = await fetch(`${JSON_SERVER_URL}/users?email=${session.user.email}`)
    const users = await response.json()
    
    if (users.length === 0) {
      // ユーザーが存在しない場合は新規作成
      const newUser = {
        
        name: session.user.name || 'Unknown User',
        email: session.user.email,
        avatar: session.user.image || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const createResponse = await fetch(`${JSON_SERVER_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create user')
      }

      const createdUser = await createResponse.json()
      return NextResponse.json(createdUser)
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return NextResponse.json(
      { error: 'ユーザー情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const updateData = await request.json()

    // 現在のユーザーを取得
    const userResponse = await fetch(`${JSON_SERVER_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    const currentUser = users[0]

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // ユーザー情報を更新
    const updatedUser = {
      ...currentUser,
      ...updateData,
      lastLoginAt: new Date().toISOString()
    }

    const response = await fetch(`${JSON_SERVER_URL}/users/${currentUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    })

    if (!response.ok) {
      throw new Error('Failed to update user')
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}