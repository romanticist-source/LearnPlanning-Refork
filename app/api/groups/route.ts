import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'my', 'discover', 'all'

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

    if (type === 'my') {
      // ユーザーが参加しているグループを取得
      const membershipsResponse = await fetch(`${API_BASE_URL}/group_members?userId=${currentUser.id}`)
      if (!membershipsResponse.ok) {
        return NextResponse.json([])
      }

      const memberships = await membershipsResponse.json()
      const groupIds = memberships.map((m: any) => m.groupId)

      if (groupIds.length === 0) {
        return NextResponse.json([])
      }

      // 各グループの詳細を取得
      const groups = []
      for (const groupId of groupIds) {
        const groupResponse = await fetch(`${API_BASE_URL}/groups/${groupId}`)
        if (groupResponse.ok) {
          const group = await groupResponse.json()
          
          // メンバー数を取得
          const memberCountResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${groupId}`)
          const members = memberCountResponse.ok ? await memberCountResponse.json() : []
          
          groups.push({
            ...group,
            memberCount: members.length,
            userRole: memberships.find((m: any) => m.groupId === groupId)?.role
          })
        }
      }

      return NextResponse.json(groups)
    } else if (type === 'discover') {
      // 公開グループまたは参加していないグループを取得
      const allGroupsResponse = await fetch(`${API_BASE_URL}/groups?isPublic=true`)
      if (!allGroupsResponse.ok) {
        return NextResponse.json([])
      }

      const allGroups = await allGroupsResponse.json()
      
      // ユーザーが参加していないグループのみフィルター
      const membershipsResponse = await fetch(`${API_BASE_URL}/group_members?userId=${currentUser.id}`)
      const userMemberships = membershipsResponse.ok ? await membershipsResponse.json() : []
      const userGroupIds = userMemberships.map((m: any) => m.groupId)

      const discoverGroups = allGroups.filter((group: any) => !userGroupIds.includes(group.id))

      // メンバー数を追加
      for (const group of discoverGroups) {
        const memberCountResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${group.id}`)
        const members = memberCountResponse.ok ? await memberCountResponse.json() : []
        group.memberCount = members.length
      }

      return NextResponse.json(discoverGroups)
    } else {
      // 全グループを取得
      const allGroupsResponse = await fetch(`${API_BASE_URL}/groups`)
      if (!allGroupsResponse.ok) {
        throw new Error('Failed to fetch groups')
      }

      const groups = await allGroupsResponse.json()
      
      // メンバー数を追加
      for (const group of groups) {
        const memberCountResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${group.id}`)
        const members = memberCountResponse.ok ? await memberCountResponse.json() : []
        group.memberCount = members.length
      }

      return NextResponse.json(groups)
    }
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const groupData = await request.json()

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

    // グループデータを準備
    const newGroup = {
      ...groupData,
      id: `group-${Date.now()}`,
      ownerId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 招待メンバーを分離
    const { invitedMembers, ...groupWithoutMembers } = newGroup

    // グループを作成
    const groupResponse = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupWithoutMembers),
    })

    if (!groupResponse.ok) {
      throw new Error('Failed to create group')
    }

    const createdGroup = await groupResponse.json()

    // 作成者をグループ管理者として追加
    const adminMembership = {
      id: `member-${Date.now()}`,
      groupId: createdGroup.id,
      userId: currentUser.id,
      role: 'admin',
      joinedAt: new Date().toISOString()
    }

    await fetch(`${API_BASE_URL}/group_members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminMembership),
    })

    // 招待メンバーを処理
    const createdInvitations = []
    if (invitedMembers && Array.isArray(invitedMembers)) {
      for (let i = 0; i < invitedMembers.length; i++) {
        const member = invitedMembers[i]
        const invitation = {
          id: `invite-${Date.now()}-${i}`,
          groupId: createdGroup.id,
          inviterId: currentUser.id,
          inviteeEmail: member.email,
          inviteeName: member.name,
          status: 'pending',
          message: `${createdGroup.name}に参加しませんか？`,
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

        if (inviteResponse.ok) {
          createdInvitations.push(await inviteResponse.json())
        }
      }
    }

    // 結果を返す
    return NextResponse.json({
      ...createdGroup,
      memberCount: 1,
      invitations: createdInvitations
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}