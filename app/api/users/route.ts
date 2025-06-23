import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // ユーザーデータにタイムスタンプを追加
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`,
      joinedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })

    if (!response.ok) {
      throw new Error('Failed to create user')
    }

    const createdUser = await response.json()
    return NextResponse.json(createdUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }

    const users = await response.json()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}