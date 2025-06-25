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
    const { email, name, message } = await request.json()

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

    // 招待権限チェック
    const membershipResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${groupId}&userId=${currentUser.id}`)
    const memberships = membershipResponse.ok ? await membershipResponse.json() : []
    const userMembership = memberships[0]

    // 管理者または招待が許可されているメンバーのみ招待可能
    if (!userMembership || 
        (userMembership.role !== 'admin' && !group.allowMemberInvite)) {
      return NextResponse.json(
        { error: 'Forbidden: No permission to invite members' },
        { status: 403 }
      )
    }

    // 既に招待済みかチェック
    const existingInviteResponse = await fetch(`${API_BASE_URL}/invitations?groupId=${groupId}&inviteeEmail=${email}&status=pending`)
    const existingInvites = existingInviteResponse.ok ? await existingInviteResponse.json() : []

    if (existingInvites.length > 0) {
      return NextResponse.json(
        { error: 'User already has a pending invitation' },
        { status: 400 }
      )
    }

    // 既にメンバーかチェック
    const existingUserResponse = await fetch(`${API_BASE_URL}/users?email=${email}`)
    if (existingUserResponse.ok) {
      const existingUsers = await existingUserResponse.json()
      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0]
        const existingMemberResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${groupId}&userId=${existingUser.id}`)
        const existingMembers = existingMemberResponse.ok ? await existingMemberResponse.json() : []
        
        if (existingMembers.length > 0) {
          return NextResponse.json(
            { error: 'User is already a member of this group' },
            { status: 400 }
          )
        }
      }
    }

    // 招待を作成
    const invitation = {
      id: `invite-${Date.now()}`,
      groupId: groupId,
      inviterId: currentUser.id,
      inviteeEmail: email,
      inviteeName: name || 'ユーザー',
      status: 'pending',
      message: message || `${group.name}に参加しませんか？`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30日後
    }

    const inviteResponse = await fetch(`${API_BASE_URL}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invitation),
    })

    if (!inviteResponse.ok) {
      throw new Error('Failed to create invitation')
    }

    const createdInvitation = await inviteResponse.json()
    
    return NextResponse.json({
      message: 'Invitation sent successfully',
      invitation: createdInvitation
    }, { status: 201 })
  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}