import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id

    // グループ基本情報を取得
    const groupResponse = await fetch(`${API_BASE_URL}/groups/${groupId}`)
    if (!groupResponse.ok) {
      if (groupResponse.status === 404) {
        return NextResponse.json(
          { error: 'グループが見つかりません' },
          { status: 404 }
        )
      }
      throw new Error('グループ情報の取得に失敗しました')
    }

    const group = await groupResponse.json()

    // 認証チェック（開発時は寛容に）
    let currentUser = null
    let userMembership = null
    
    try {
      const session = await auth()
      if (session?.user?.email) {
        const userResponse = await fetch(`${API_BASE_URL}/users?email=${session.user.email}`)
        const users = await userResponse.json()
        currentUser = users[0]
        
        if (currentUser) {
          const membershipResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${groupId}&userId=${currentUser.id}`)
          const memberships = membershipResponse.ok ? await membershipResponse.json() : []
          userMembership = memberships[0]
        }
      }
    } catch (authError) {
      console.log('認証チェック失敗、ゲスト表示します:', authError)
    }

    // 開発時: 公開グループまたは認証エラーの場合はアクセスを許可
    if (!group.isPublic && !userMembership && currentUser) {
      return NextResponse.json(
        { error: 'このグループにアクセスする権限がありません' },
        { status: 403 }
      )
    }

    // メンバー情報を詳細に取得
    const membersResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${groupId}`)
    const membershipData = membersResponse.ok ? await membersResponse.json() : []

    // 各メンバーのユーザー詳細情報を取得
    const members = []
    for (const membership of membershipData) {
      try {
        const userResponse = await fetch(`${API_BASE_URL}/users/${membership.userId}`)
        if (userResponse.ok) {
          const user = await userResponse.json()
          members.push({
            id: user.id,
            name: user.name || user.email || 'Unknown User',
            email: user.email,
            avatar: user.avatar || '/placeholder-user.jpg',
            role: membership.role === 'owner' ? 'オーナー' : membership.role === 'admin' ? '管理者' : 'メンバー',
            joinedAt: membership.joinedAt
          })
        }
      } catch (error) {
        console.error(`Failed to fetch user ${membership.userId}:`, error)
      }
    }

    // 目標情報を取得
    const goalsResponse = await fetch(`${API_BASE_URL}/goals?groupId=${groupId}`)
    const goals = goalsResponse.ok ? await goalsResponse.json() : []

    // イベント情報を取得（ミーティングスケジュール用）
    const eventsResponse = await fetch(`${API_BASE_URL}/events?groupId=${groupId}`)
    const events = eventsResponse.ok ? await eventsResponse.json() : []

    // グループ情報にメンバー数、目標達成率、ミーティング情報を追加
    const completedGoals = goals.filter((goal: any) => goal.completed).length
    const goalCompletionRate = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0

    const nextMeeting = events
      .filter((event: any) => new Date(event.date) > new Date())
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

    // ミーティングスケジュール情報の準備
    let meetingInfo = '設定されていません'
    if (group.meetingSchedule) {
      meetingInfo = group.meetingSchedule
    } else if (nextMeeting) {
      const meetingDate = new Date(nextMeeting.date)
      meetingInfo = `次回: ${meetingDate.toLocaleDateString('ja-JP')} ${meetingDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
    }

    const enrichedGroup = {
      ...group,
      memberCount: members.length,
      goals: goals.length,
      goalCompletionRate,
      meetingInfo,
      nextMeeting: nextMeeting ? {
        title: nextMeeting.title,
        date: nextMeeting.date,
        isOnline: nextMeeting.isOnline
      } : null,
      activity: members.length > 5 ? '高' : members.length > 2 ? '中' : '低',
      userMembership: userMembership || null,
      members // メンバー情報も含める
    }

    return NextResponse.json(enrichedGroup)
  } catch (error) {
    console.error('グループ詳細取得エラー:', error)
    return NextResponse.json(
      { error: 'グループ情報の取得に失敗しました' },
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