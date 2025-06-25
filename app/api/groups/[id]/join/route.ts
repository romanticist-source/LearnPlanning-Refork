import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'

export async function POST(
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

    // グループを取得
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

    // 既にメンバーかチェック
    const existingMemberResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${groupId}&userId=${currentUser.id}`)
    const existingMembers = existingMemberResponse.ok ? await existingMemberResponse.json() : []

    if (existingMembers.length > 0) {
      return NextResponse.json(
        { error: 'Already a member of this group' },
        { status: 400 }
      )
    }

    // 公開グループで自動承認の場合、直接参加
    if (group.isPublic && group.autoApprove) {
      const membership = {
        id: `member-${Date.now()}`,
        groupId: groupId,
        userId: currentUser.id,
        role: 'member',
        joinedAt: new Date().toISOString()
      }

      const membershipResponse = await fetch(`${API_BASE_URL}/group_members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(membership),
      })

      if (!membershipResponse.ok) {
        throw new Error('Failed to join group')
      }

      const createdMembership = await membershipResponse.json()
      return NextResponse.json({
        message: 'Successfully joined the group',
        membership: createdMembership
      }, { status: 201 })
    } else {
      // 参加リクエストを作成（招待として扱う）
      const joinRequest = {
        id: `invite-${Date.now()}`,
        groupId: groupId,
        inviterId: currentUser.id, // 自分自身が招待者
        inviteeEmail: currentUser.email,
        inviteeName: currentUser.name,
        status: 'pending',
        message: `${currentUser.name}がグループへの参加を希望しています。`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30日後
      }

      const requestResponse = await fetch(`${API_BASE_URL}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(joinRequest),
      })

      if (!requestResponse.ok) {
        throw new Error('Failed to create join request')
      }

      const createdRequest = await requestResponse.json()
      return NextResponse.json({
        message: 'Join request sent successfully',
        request: createdRequest
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error joining group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}