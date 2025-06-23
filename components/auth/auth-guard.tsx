"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // セッション読み込み中は何もしない

    if (!session) {
      // 未認証の場合はトップページにリダイレクト
      router.push("/")
      return
    }
  }, [session, status, router])

  // ローディング中の表示
  if (status === "loading") {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-gray-500">認証情報を確認中...</p>
          </div>
        </div>
      )
    )
  }

  // 未認証の場合は何も表示しない（リダイレクト処理中）
  if (!session) {
    return null
  }

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>
}