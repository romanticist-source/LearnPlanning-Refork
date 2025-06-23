import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const groupId = params.id

    // グループの存在確認
    const groupResponse = await fetch(`${API_BASE_URL}/groups/${groupId}`)
    if (!groupResponse.ok) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    const group = await groupResponse.json()

    // ユーザー情報を取得
    const userResponse = await fetch(`${API_BASE_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    const currentUser = users[0]

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // ユーザーがグループメンバーかチェック
    const membershipResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${groupId}&userId=${currentUser.id}`)
    const memberships = membershipResponse.ok ? await membershipResponse.json() : []
    const userMembership = memberships[0]

    // 公開グループでない場合、メンバーでないとアクセス不可
    if (!group.isPublic && !userMembership) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // グループメンバーを取得
    const allMembersResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${groupId}`)
    const allMemberships = allMembersResponse.ok ? await allMembersResponse.json() : []

    const members = []
    for (const membership of allMemberships) {
      const memberResponse = await fetch(`${API_BASE_URL}/users/${membership.userId}`)
      if (memberResponse.ok) {
        const memberUser = await memberResponse.json()
        members.push({
          id: memberUser.id,
          name: memberUser.name,
          email: memberUser.email,
          avatar: memberUser.avatar,
          role: membership.role,
          joinedAt: membership.joinedAt
        })
      }
    }

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching group members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}