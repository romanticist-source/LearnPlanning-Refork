import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // リマインダーチェックAPIを呼び出し
    const checkResponse = await fetch(`${request.nextUrl.origin}/api/reminders/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!checkResponse.ok) {
      throw new Error('Reminder check failed')
    }

    const result = await checkResponse.json()
    
    return NextResponse.json({
      message: 'Manual reminder check completed',
      result
    })
  } catch (error) {
    console.error('Error in manual reminder trigger:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
