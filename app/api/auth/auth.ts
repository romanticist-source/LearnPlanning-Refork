import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

const JSON_SERVER_URL = 'http://localhost:3005'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  ],
  basePath: "/api/auth",
  callbacks: {
    async signIn({ user, account, profile }) {
      // GitHubログイン成功時にJSON Serverにユーザーを登録
      if (account?.provider === "github" && user?.email) {
        try {
          // 既存ユーザーをチェック
          const checkResponse = await fetch(`${JSON_SERVER_URL}/users?email=${user.email}`)
          const existingUsers = await checkResponse.json()

          if (existingUsers.length === 0) {
            // 新規ユーザーの場合は登録
            const newUser = {
              id: `user-${Date.now()}`,
              name: user.name || 'Unknown User',
              email: user.email,
              avatar: user.image || null,
              githubId: profile?.login || null,
              bio: profile?.bio || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            }

            const createResponse = await fetch(`${JSON_SERVER_URL}/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newUser),
            })

            if (!createResponse.ok) {
              console.error('ユーザー登録に失敗しました')
            } else {
              console.log('新規ユーザーを登録しました:', newUser.email)
            }
          } else {
            // 既存ユーザーの場合は最終ログイン時刻を更新
            const existingUser = existingUsers[0]
            const updatedUser = {
              ...existingUser,
              lastLoginAt: new Date().toISOString(),
              avatar: user.image || existingUser.avatar,
              name: user.name || existingUser.name
            }

            await fetch(`${JSON_SERVER_URL}/users/${existingUser.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedUser),
            })
            
            console.log('ユーザーログイン情報を更新しました:', existingUser.email)
          }
        } catch (error) {
          console.error('ユーザー登録処理でエラーが発生しました:', error)
          // エラーが発生してもログインは継続
        }
      }
      return true
    }
  }
})