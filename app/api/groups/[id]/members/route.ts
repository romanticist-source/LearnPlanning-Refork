import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/auth'

const JSON_SERVER_URL = 'http://localhost:3005'

// グループメンバー一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id

    // グループメンバーを取得
    const membersResponse = await fetch(`${JSON_SERVER_URL}/group_members?groupId=${groupId}`)
    if (!membersResponse.ok) {
      return NextResponse.json({ error: 'メンバー取得に失敗しました' }, { status: 500 })
    }

    const members = await membersResponse.json()

    // 各メンバーのユーザー情報も取得
    const membersWithUserInfo = await Promise.all(
      members.map(async (member: any) => {
        const userResponse = await fetch(`${JSON_SERVER_URL}/users/${member.userId}`)
        const user = userResponse.ok ? await userResponse.json() : null
        
        return {
          ...member,
          user: user
        }
      })
    )

    return NextResponse.json({
      success: true,
      members: membersWithUserInfo,
      count: membersWithUserInfo.length
    })

  } catch (error) {
    console.error('メンバー取得エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// メンバーの役割を変更またはメンバーを削除
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const groupId = params.id
    const { memberId, action, role } = await request.json()

    // 現在のユーザーを取得
    const userResponse = await fetch(`${JSON_SERVER_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }
    
    const currentUser = users[0]

    // 現在のユーザーがグループの管理者かオーナーかチェック
    const currentUserMemberResponse = await fetch(`${JSON_SERVER_URL}/group_members?groupId=${groupId}&userId=${currentUser.id}`)
    const currentUserMembers = await currentUserMemberResponse.json()
    
    if (currentUserMembers.length === 0) {
      return NextResponse.json({ error: 'このグループのメンバーではありません' }, { status: 403 })
    }

    const currentUserMember = currentUserMembers[0]
    if (!['owner', 'admin'].includes(currentUserMember.role)) {
      return NextResponse.json({ error: '管理権限がありません' }, { status: 403 })
    }

    if (action === 'remove') {
      // メンバーを削除
      const deleteResponse = await fetch(`${JSON_SERVER_URL}/group_members/${memberId}`, {
        method: 'DELETE'
      })

      if (!deleteResponse.ok) {
        return NextResponse.json({ error: 'メンバー削除に失敗しました' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'メンバーを削除しました'
      })

    } else if (action === 'changeRole' && role) {
      // 役割を変更
      const memberResponse = await fetch(`${JSON_SERVER_URL}/group_members/${memberId}`)
      if (!memberResponse.ok) {
        return NextResponse.json({ error: 'メンバーが見つかりません' }, { status: 404 })
      }

      const member = await memberResponse.json()
      const updatedMember = {
        ...member,
        role: role,
        updatedAt: new Date().toISOString()
      }

      const updateResponse = await fetch(`${JSON_SERVER_URL}/group_members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMember),
      })

      if (!updateResponse.ok) {
        return NextResponse.json({ error: '役割変更に失敗しました' }, { status: 500 })
      }

      const updatedMemberData = await updateResponse.json()
      return NextResponse.json({
        success: true,
        member: updatedMemberData,
        message: '役割を変更しました'
      })
    }

    return NextResponse.json({ error: '無効なアクションです' }, { status: 400 })

  } catch (error) {
    console.error('メンバー管理エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// グループから退会
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const groupId = params.id

    // 現在のユーザーを取得
    const userResponse = await fetch(`${JSON_SERVER_URL}/users?email=${session.user.email}`)
    const users = await userResponse.json()
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }
    
    const user = users[0]

    // ユーザーのメンバーシップを取得
    const memberResponse = await fetch(`${JSON_SERVER_URL}/group_members?groupId=${groupId}&userId=${user.id}`)
    const members = await memberResponse.json()
    
    if (members.length === 0) {
      return NextResponse.json({ error: 'このグループのメンバーではありません' }, { status: 404 })
    }

    const member = members[0]

    // オーナーは退会できない（他の管理者に権限移譲が必要）
    if (member.role === 'owner') {
      return NextResponse.json({ 
        error: 'オーナーは退会できません。他のメンバーに権限を移譲してください' 
      }, { status: 400 })
    }

    // メンバーシップを削除
    const deleteResponse = await fetch(`${JSON_SERVER_URL}/group_members/${member.id}`, {
      method: 'DELETE'
    })

    if (!deleteResponse.ok) {
      return NextResponse.json({ error: 'グループ退会に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'グループから退会しました'
    })

  } catch (error) {
    console.error('グループ退会エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}