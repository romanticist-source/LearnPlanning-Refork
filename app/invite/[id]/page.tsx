"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function InvitePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "error" | "unauth">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const acceptInvitation = async () => {
      try {
        const res = await fetch(`/api/invitations/${params.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "accept" }),
        })

        if (res.status === 401) {
          setStatus("unauth")
          return
        }

        if (!res.ok) {
          const data = await res.json()
          setMessage(data.error || "エラーが発生しました")
          setStatus("error")
          return
        }

        const data = await res.json()
        const groupId = data.invitation?.groupId

        // 参加成功
        router.replace(groupId ? `/groups/${groupId}` : "/dashboard")
      } catch (error) {
        console.error("Failed to accept invitation:", error)
        setMessage("サーバーエラーが発生しました")
        setStatus("error")
      }
    }

    acceptInvitation()
  }, [params.id, router])

  if (status === "loading") {
    return <p className="text-center py-10">招待を確認しています...</p>
  }

  if (status === "unauth") {
    return (
      <p className="text-center py-10">
        この操作にはサインインが必要です。サインイン後、もう一度リンクを開いてください。
      </p>
    )
  }

  return <p className="text-center py-10">{message}</p>
} 