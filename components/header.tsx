"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Target, Menu, X } from "lucide-react"
import { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User, Github } from "lucide-react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Target className="h-6 w-6 text-emerald-600" />
              <h1 className="text-xl font-bold">Learn Planning</h1>
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <div className="hidden md:flex items-center gap-6">
            {session && (
              <nav className="flex items-center gap-6">
                <Link href="/dashboard" className="text-sm font-medium hover:text-emerald-600">
                  ダッシュボード
                </Link>
                <Link href="/groups" className="text-sm font-medium hover:text-emerald-600">
                  グループ
                </Link>
                <Link href="/goals" className="text-sm font-medium hover:text-emerald-600">
                  学習目標
                </Link>
                <Link href="/questions" className="text-sm font-medium hover:text-emerald-600"> 
                  質問
                </Link>
              </nav>
            )}
            
            {/* 認証ボタン */}
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && (
                        <p className="font-medium">{session.user.name}</p>
                      )}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      プロフィール
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(event) => {
                      event.preventDefault()
                      signOut()
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => signIn("github")} variant="outline">
                <Github className="mr-2 h-4 w-4" />
                ログイン
              </Button>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t mt-3">
            <div className="flex flex-col gap-4">
              {session && (
                <nav className="flex flex-col gap-4">
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium hover:text-emerald-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ダッシュボード
                  </Link>
                  <Link
                    href="/groups"
                    className="text-sm font-medium hover:text-emerald-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    グループ
                  </Link>
                  <Link
                    href="/goals"
                    className="text-sm font-medium hover:text-emerald-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    学習目標
                  </Link>
                  <hr className="my-2" />
                </nav>
              )}
              
              {/* モバイル認証ボタン */}
              {status === "loading" ? (
                <div className="h-8 w-16 animate-pulse bg-gray-200 rounded"></div>
              ) : session ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{session.user?.name || "ユーザー"}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="text-sm font-medium hover:text-emerald-600 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    プロフィール
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start p-0 h-auto text-sm font-medium hover:text-emerald-600"
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    ログアウト
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    signIn("github")
                    setMobileMenuOpen(false)
                  }} 
                  variant="outline"
                  className="w-full"
                >
                  <Github className="mr-2 h-4 w-4" />
                  ログイン
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
