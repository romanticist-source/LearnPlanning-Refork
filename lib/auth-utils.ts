// JSON Server経由で認証されたユーザーの情報を取得
export async function getCurrentUser() {
  try {
    const response = await fetch('/api/users/me')
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('認証が必要です')
      }
      throw new Error('ユーザー情報の取得に失敗しました')
    }
    
    return await response.json()
  } catch (error) {
    console.error('getCurrentUser error:', error)
    throw error
  }
}

// ID生成用のユーティリティ関数
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}