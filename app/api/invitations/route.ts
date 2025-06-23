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
    const type = searchParams.get('type') // 'received', 'sent'

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

    let invitations = []

    if (type === 'received') {
      // 受信した招待を取得
      const inviteResponse = await fetch(`${API_BASE_URL}/invitations?inviteeEmail=${currentUser.email}&status=pending`)
      if (inviteResponse.ok) {
        invitations = await inviteResponse.json()
      }
    } else if (type === 'sent') {
      // 送信した招待を取得
      const inviteResponse = await fetch(`${API_BASE_URL}/invitations?inviterId=${currentUser.id}`)
      if (inviteResponse.ok) {
        invitations = await inviteResponse.json()
      }
    } else {
      // 全招待を取得（受信と送信の両方）
      const receivedResponse = await fetch(`${API_BASE_URL}/invitations?inviteeEmail=${currentUser.email}`)
      const sentResponse = await fetch(`${API_BASE_URL}/invitations?inviterId=${currentUser.id}`)
      
      const received = receivedResponse.ok ? await receivedResponse.json() : []
      const sent = sentResponse.ok ? await sentResponse.json() : []
      
      invitations = [...received, ...sent]
    }

    // グループ情報を追加
    for (const invitation of invitations) {
      try {
        const groupResponse = await fetch(`${API_BASE_URL}/groups/${invitation.groupId}`)
        if (groupResponse.ok) {
          invitation.group = await groupResponse.json()
        }

        // 招待者情報を追加（送信した招待でない場合）
        if (invitation.inviterId !== currentUser.id) {
          const inviterResponse = await fetch(`${API_BASE_URL}/users/${invitation.inviterId}`)
          if (inviterResponse.ok) {
            invitation.inviter = await inviterResponse.json()
          }
        }
      } catch (error) {
        console.error(`Error fetching additional data for invitation ${invitation.id}:`, error)
      }
    }

    // 日付順でソート（新しい順）
    invitations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(invitations)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}