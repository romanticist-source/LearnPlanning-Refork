import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'

// ユーザー検索 API
// GET /api/users/search?q=keyword
// name または email に部分一致するユーザーを最大 10 件返す
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query) {
      return NextResponse.json([])
    }

    // 全文検索 (json-server の q パラメータ) を使用
    const response = await fetch(`${API_BASE_URL}/users?q=${encodeURIComponent(query)}`)

    if (!response.ok) {
      throw new Error('Failed to search users')
    }

    let users: any[] = await response.json()

    // ログインユーザーは除外 (必要に応じて)
    try {
      const session = await auth()
      const currentEmail = session?.user?.email
      if (currentEmail) {
        users = users.filter((u) => u.email !== currentEmail)
      }
    } catch (_) {
      // 未認証でも問題なし
    }

    // 最大 10 件に制限
    users = users.slice(0, 10)

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 