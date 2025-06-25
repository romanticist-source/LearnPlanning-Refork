import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const JSON_SERVER_URL = 'http://localhost:3005'

// グループに参加
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const groupId = params.id

    // 現在のユーザーを取得
    const userResponse = await fetch(`${JSON_SERVER_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }
    
    const user = users[0]

    // グループの存在確認
    const groupResponse = await fetch(`${JSON_SERVER_URL}/groups/${groupId}`)
    if (!groupResponse.ok) {
      return NextResponse.json({ error: 'グループが見つかりません' }, { status: 404 })
    }

    // 既に参加しているかチェック
    const memberCheckResponse = await fetch(`${JSON_SERVER_URL}/group_members?groupId=${groupId}&userId=${user.id}`)
    const existingMembers = await memberCheckResponse.json()
    
    if (existingMembers.length > 0) {
      return NextResponse.json({ error: '既にこのグループに参加しています' }, { status: 400 })
    }

    // グループメンバーとして追加
    const newMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      groupId: groupId,
      userId: user.id,
      role: 'member', // 'owner', 'admin', 'member'
      joinedAt: new Date().toISOString()
    }

    const memberResponse = await fetch(`${JSON_SERVER_URL}/group_members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMember),
    })

    if (!memberResponse.ok) {
      return NextResponse.json({ error: 'グループ参加に失敗しました' }, { status: 500 })
    }

    const memberData = await memberResponse.json()
    
    return NextResponse.json({
      success: true,
      member: memberData,
      message: 'グループに参加しました'
    })

  } catch (error) {
    console.error('グループ参加エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}