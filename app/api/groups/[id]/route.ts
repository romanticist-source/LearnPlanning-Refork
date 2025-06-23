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

    // グループ目標を取得
    const goalsResponse = await fetch(`${API_BASE_URL}/goals?groupId=${groupId}`)
    const goals = goalsResponse.ok ? await goalsResponse.json() : []

    return NextResponse.json({
      ...group,
      members,
      memberCount: members.length,
      goals: goals.length,
      completedGoals: goals.filter((g: any) => g.completed).length,
      userMembership: userMembership || null
    })
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const updateData = await request.json()

    // 既存グループを取得
    const groupResponse = await fetch(`${API_BASE_URL}/groups/${groupId}`)
    if (!groupResponse.ok) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    const existingGroup = await groupResponse.json()

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

    // 管理者権限チェック
    const membershipResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${groupId}&userId=${currentUser.id}`)
    const memberships = membershipResponse.ok ? await membershipResponse.json() : []
    const userMembership = memberships[0]

    if (!userMembership || userMembership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // グループを更新
    const updatedGroup = {
      ...existingGroup,
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    const updateResponse = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedGroup),
    })

    if (!updateResponse.ok) {
      throw new Error('Failed to update group')
    }

    const result = await updateResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // 既存グループを取得
    const groupResponse = await fetch(`${API_BASE_URL}/groups/${groupId}`)
    if (!groupResponse.ok) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    const existingGroup = await groupResponse.json()

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

    // オーナー権限チェック
    if (existingGroup.ownerId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 関連データを削除
    // 1. グループメンバーを削除
    const membersResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${groupId}`)
    if (membersResponse.ok) {
      const members = await membersResponse.json()
      for (const member of members) {
        await fetch(`${API_BASE_URL}/group_members/${member.id}`, {
          method: 'DELETE',
        })
      }
    }

    // 2. 招待を削除
    const invitationsResponse = await fetch(`${API_BASE_URL}/invitations?groupId=${groupId}`)
    if (invitationsResponse.ok) {
      const invitations = await invitationsResponse.json()
      for (const invitation of invitations) {
        await fetch(`${API_BASE_URL}/invitations/${invitation.id}`, {
          method: 'DELETE',
        })
      }
    }

    // 3. グループ目標を削除
    const goalsResponse = await fetch(`${API_BASE_URL}/goals?groupId=${groupId}`)
    if (goalsResponse.ok) {
      const goals = await goalsResponse.json()
      for (const goal of goals) {
        await fetch(`${API_BASE_URL}/goals/${goal.id}`, {
          method: 'DELETE',
        })
      }
    }

    // 4. グループを削除
    const deleteResponse = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'DELETE',
    })

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete group')
    }

    return NextResponse.json({ message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}