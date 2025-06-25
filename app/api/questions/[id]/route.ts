import { NextRequest, NextResponse } from 'next/server'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // 質問データを取得
    const questionResponse = await fetch(`${JSON_SERVER_URL}/questions/${id}`)
    
    if (!questionResponse.ok) {
      if (questionResponse.status === 404) {
        return NextResponse.json(
          { error: '質問が見つかりません' },
          { status: 404 }
        )
      }
      throw new Error(`JSON Server error: ${questionResponse.status}`)
    }
    
    const question = await questionResponse.json()
    
    // ユーザー情報を取得（必要に応じて）
    let userName = 'ユーザー'
    let userAvatar = '/placeholder-user.jpg'
    
    try {
      const userResponse = await fetch(`${JSON_SERVER_URL}/users/${question.userId}`)
      if (userResponse.ok) {
        const user = await userResponse.json()
        userName = user.name
        userAvatar = user.avatar
      }
    } catch (error) {
      console.log('ユーザー情報取得失敗、デフォルト値を使用')
    }
    
    // グループ名を取得
    let groupName = '全体'
    if (question.groupId) {
      try {
        const groupResponse = await fetch(`${JSON_SERVER_URL}/groups/${question.groupId}`)
        if (groupResponse.ok) {
          const group = await groupResponse.json()
          groupName = group.name
        }
      } catch (error) {
        console.log('グループ情報取得失敗、デフォルト値を使用')
      }
    }
    
    // レスポンス用にデータを整形
    const detailedQuestion = {
      ...question,
      userName,
      userAvatar,
      groupName
    }
    
    return NextResponse.json(detailedQuestion)
  } catch (error) {
    console.error('質問詳細取得エラー:', error)
    return NextResponse.json(
      { error: '質問の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const response = await fetch(`${JSON_SERVER_URL}/questions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        updatedAt: new Date().toISOString()
      }),
    })

    if (!response.ok) {
      throw new Error(`JSON Server error: ${response.status}`)
    }

    const updatedQuestion = await response.json()
    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error('質問更新エラー:', error)
    return NextResponse.json(
      { error: '質問の更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const response = await fetch(`${JSON_SERVER_URL}/questions/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`JSON Server error: ${response.status}`)
    }

    return NextResponse.json({ message: '質問を削除しました' })
  } catch (error) {
    console.error('質問削除エラー:', error)
    return NextResponse.json(
      { error: '質問の削除に失敗しました' },
      { status: 500 }
    )
  }
} 