import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    // グループデータを取得
    const groupsResponse = await fetch(`${JSON_SERVER_URL}/groups`)
    const groups = await groupsResponse.json()
    
    // メンバー情報を取得
    const membersResponse = await fetch(`${JSON_SERVER_URL}/group_members`)
    const members = await membersResponse.json()
    
    // 各グループにメンバー数と追加情報を付与
    const enrichedGroups = groups.map((group: any) => {
      const groupMembers = members.filter((member: any) => member.groupId === group.id)
      
      return {
        ...group,
        memberCount: groupMembers.length,
        goals: 0, // TODO: 実際の目標数を取得
        activity: groupMembers.length > 5 ? '高' : groupMembers.length > 2 ? '中' : '低'
      }
    })
    
    // typeパラメータに応じてフィルタリング
    if (type === 'my') {
      // 現在のユーザーが所属しているグループのみを返す
      try {
        let currentUserId = 'user-1750850798419' // フォールバック用のユーザーID
        
        try {
          const currentUser = await getCurrentUser()
          if (currentUser) {
            currentUserId = currentUser.id
          }
        } catch (authError) {
          console.log('認証情報取得失敗、フォールバックユーザーを使用:', currentUserId)
        }
        
        const userGroupIds = members
          .filter((member: any) => member.userId === currentUserId)
          .map((member: any) => member.groupId)
        
        const myGroups = enrichedGroups.filter((group: any) => 
          userGroupIds.includes(group.id)
        )
        
        console.log(`ユーザー ${currentUserId} の所属グループ:`, userGroupIds)
        console.log('マイグループ数:', myGroups.length)
        
        return NextResponse.json(myGroups)
      } catch (error) {
        console.error('マイグループ取得エラー:', error)
        return NextResponse.json([])
      }
    } else if (type === 'discover') {
      // 公開グループで、現在のユーザーが所属していないもののみを返す
      try {
        let currentUserId = 'user-1750850798419' // フォールバック用のユーザーID
        
        try {
          const currentUser = await getCurrentUser()
          if (currentUser) {
            currentUserId = currentUser.id
          }
        } catch (authError) {
          console.log('認証情報取得失敗、フォールバックユーザーを使用:', currentUserId)
        }
        
        const userGroupIds = members
          .filter((member: any) => member.userId === currentUserId)
          .map((member: any) => member.groupId)
        
        const discoverGroups = enrichedGroups.filter((group: any) => 
          group.isPublic && !userGroupIds.includes(group.id)
        )
        
        console.log(`ユーザー ${currentUserId} の未参加グループ数:`, discoverGroups.length)
        
        return NextResponse.json(discoverGroups)
      } catch (error) {
        console.error('探索グループ取得エラー:', error)
        
        // フォールバック: 公開グループのみを返す
        const publicGroups = enrichedGroups.filter((group: any) => group.isPublic)
        return NextResponse.json(publicGroups)
      }
    }
    
    return NextResponse.json(enrichedGroups)
  } catch (error) {
    console.error('グループ取得エラー:', error)
    return NextResponse.json(
      { error: 'グループの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 必要なフィールドの検証
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: 'グループ名と説明は必須です' },
        { status: 400 }
      )
    }

    // JSON Serverに送信するデータを整形
    const groupData = {
      id: body.id,
      name: body.name,
      description: body.description,
      category: body.category || 'general',
      maxMembers: body.maxMembers || 10,
      tags: body.tags || [],
      isPublic: body.isPublic || true,
      requireApproval: body.requireApproval || false,
      allowMemberInvites: body.allowMemberInvites || true,
      ownerId: body.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${JSON_SERVER_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
    })

    if (!response.ok) {
      throw new Error(`JSON Server error: ${response.status}`)
    }

    const createdGroup = await response.json()
    
    // グループ作成者をownerメンバーとして追加
    const memberData = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      groupId: createdGroup.id,
      userId: body.ownerId,
      role: 'owner',
      joinedAt: new Date().toISOString()
    }
    
    console.log('グループ作成者をメンバーに追加:', memberData)
    
    const memberResponse = await fetch(`${JSON_SERVER_URL}/group_members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    })
    
    if (!memberResponse.ok) {
      console.error('グループ作成者のメンバー追加に失敗:', memberResponse.status)
      throw new Error('グループ作成者のメンバー追加に失敗しました')
    }
    
    const memberResult = await memberResponse.json()
    console.log('グループ作成者をメンバーに追加完了:', memberResult)

    // 招待されたメンバーがいる場合は招待を作成
    if (body.invitedMembers && Array.isArray(body.invitedMembers)) {
      for (const member of body.invitedMembers) {
        if (member.email && member.name) {
          const invitationData = {
            id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            groupId: createdGroup.id,
            inviterId: body.ownerId,
            inviteeEmail: member.email,
            inviteeName: member.name,
            status: 'pending',
            message: `「${body.name}」グループへの招待`,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30日後
          }
          
          await fetch(`${JSON_SERVER_URL}/invitations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(invitationData),
          })
        }
      }
    }

    return NextResponse.json(createdGroup, { status: 201 })
  } catch (error) {
    console.error('グループ作成エラー:', error)
    return NextResponse.json(
      { error: 'グループの作成に失敗しました' },
      { status: 500 }
    )
  }
}