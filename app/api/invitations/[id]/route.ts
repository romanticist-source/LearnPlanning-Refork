import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'
import { sendNotificationToUser } from '@/app/action'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005'

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

    const invitationId = params.id
    const { action } = await request.json() // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      )
    }

    // 招待を取得
    const inviteResponse = await fetch(`${API_BASE_URL}/invitations/${invitationId}`)
    if (!inviteResponse.ok) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    const invitation = await inviteResponse.json()

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

    // 招待対象者または招待者のみ操作可能
    const canManage = invitation.inviteeEmail === currentUser.email || 
                     invitation.inviterId === currentUser.id

    if (!canManage) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 招待ステータスチェック
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation is no longer pending' },
        { status: 400 }
      )
    }

    // 期限チェック
    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    if (action === 'accept') {
      // 招待を承認してメンバーに追加
      
      // 既にメンバーかチェック
      const existingMemberResponse = await fetch(`${API_BASE_URL}/group_members?groupId=${invitation.groupId}&userId=${currentUser.id}`)
      const existingMembers = existingMemberResponse.ok ? await existingMemberResponse.json() : []

      if (existingMembers.length === 0) {
        // メンバーとして追加
        const membership = {
          id: `member-${Date.now()}`,
          groupId: invitation.groupId,
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
          throw new Error('Failed to add member')
        }
      }

      // 招待ステータスを更新
      const updatedInvitation = {
        ...invitation,
        status: 'accepted',
        respondedAt: new Date().toISOString()
      }

      const updateResponse = await fetch(`${API_BASE_URL}/invitations/${invitationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInvitation),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update invitation')
      }

      // グループ情報を取得
      const groupResponse = await fetch(`${API_BASE_URL}/groups/${invitation.groupId}`)
      const group = groupResponse.ok ? await groupResponse.json() : null

      // 招待者に通知を送信
      try {
        if (group) {
          await sendNotificationToUser(
            invitation.inviterId,
            'グループ招待が承認されました',
            `${currentUser.name}さんが「${group.name}」グループへの招待を承認しました`,
            {
              type: 'invitation_accepted',
              groupId: invitation.groupId,
              invitationId: invitationId,
              url: `/groups/${invitation.groupId}`
            }
          )
        }
      } catch (notificationError) {
        console.error('Failed to send acceptance notification:', notificationError)
      }

      return NextResponse.json({
        message: 'Invitation accepted successfully',
        invitation: updatedInvitation
      })
    } else {
      // 招待を拒否
      const updatedInvitation = {
        ...invitation,
        status: 'rejected',
        respondedAt: new Date().toISOString()
      }

      const updateResponse = await fetch(`${API_BASE_URL}/invitations/${invitationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInvitation),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update invitation')
      }

      return NextResponse.json({
        message: 'Invitation rejected successfully',
        invitation: updatedInvitation
      })
    }
  } catch (error) {
    console.error('Error handling invitation:', error)
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

    const invitationId = params.id

    // 招待を取得
    const inviteResponse = await fetch(`${API_BASE_URL}/invitations/${invitationId}`)
    if (!inviteResponse.ok) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    const invitation = await inviteResponse.json()

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

    // 招待者のみ削除可能
    if (invitation.inviterId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 招待を削除
    const deleteResponse = await fetch(`${API_BASE_URL}/invitations/${invitationId}`, {
      method: 'DELETE',
    })

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete invitation')
    }

    return NextResponse.json({ message: 'Invitation deleted successfully' })
  } catch (error) {
    console.error('Error deleting invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}