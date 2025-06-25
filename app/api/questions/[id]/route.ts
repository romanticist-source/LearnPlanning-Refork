import { NextRequest, NextResponse } from 'next/server'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id

    // 質問の詳細を取得
    const questionResponse = await fetch(`${JSON_SERVER_URL}/questions/${questionId}`)
    if (!questionResponse.ok) {
      return NextResponse.json(
        { error: '質問が見つかりません' },
        { status: 404 }
      )
    }
    
    const question = await questionResponse.json()

    // ユーザー情報を取得
    let user = null
    if (question.userId && !question.isAnonymous) {
      try {
        const userResponse = await fetch(`${JSON_SERVER_URL}/users/${question.userId}`)
        if (userResponse.ok) {
          user = await userResponse.json()
        }
      } catch (error) {
        console.warn('ユーザー情報の取得に失敗しました:', error)
      }
    }

    // グループ情報を取得
    let group = null
    if (question.groupId) {
      try {
        const groupResponse = await fetch(`${JSON_SERVER_URL}/groups/${question.groupId}`)
        if (groupResponse.ok) {
          group = await groupResponse.json()
        }
      } catch (error) {
        console.warn('グループ情報の取得に失敗しました:', error)
      }
    }

    // レスポンスデータを構築
    const responseData = {
      ...question,
      user: user ? {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      } : null,
      group: group ? {
        id: group.id,
        name: group.name
      } : null
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('質問詳細取得エラー:', error)
    return NextResponse.json(
      { error: '質問の取得に失敗しました' },
      { status: 500 }
    )
  }
} 