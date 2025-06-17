"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Target, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-emerald-600">
              ダッシュボード
            </Link>
            <Link href="/groups" className="text-sm font-medium hover:text-emerald-600">
              グループ
            </Link>
            <Link href="/goals" className="text-sm font-medium hover:text-emerald-600">
              学習目標
            </Link>
          </nav>

          {/* モバイルメニューボタン */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t mt-3">
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
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
