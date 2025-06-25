import { NextRequest, NextResponse } from 'next/server'

const JSON_SERVER_URL = 'http://localhost:3005'

export async function GET() {
  try {
    const response = await fetch(`${JSON_SERVER_URL}/groups`)
    const data = await response.json()
    return NextResponse.json(data)
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
    
    await fetch(`${JSON_SERVER_URL}/group_members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    })

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