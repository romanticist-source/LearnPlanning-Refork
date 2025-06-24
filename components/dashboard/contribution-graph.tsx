"use client"

import { useEffect, useRef, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ContributionGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const [tooltipData, setTooltipData] = useState<{
    date: string
    count: number
    level: number
    x: number
    y: number
  } | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !canvasContainerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // キャンバスのサイズを設定する関数
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    // 初期サイズ設定
    resizeCanvas()

    // グラフの設定
    const cellSize = 15
    const cellGap = 3
    const rows = 7 // 曜日（日〜土）
    const cols = 52 // 52週間（1年）

    // 現在の日付から1年前までのデータを生成
    const today = new Date()
    const data = Array(rows * cols)
      .fill(0)
      .map(() => Math.floor(Math.random() * 5)) // 0-4の活動レベル

    // 色の設定
    const colors = [
      "#ebedf0", // レベル0（活動なし）
      "#9be9a8", // レベル1
      "#40c463", // レベル2
      "#30a14e", // レベル3
      "#216e39", // レベル4（最も活発）
    ]

    // 日付データを生成（1年分）
    const dates: Date[] = []
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(endDate.getFullYear() - 1)

    for (let i = 0; i < rows * cols; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date)
    }

    // グラフを描画する関数
    const drawGraph = () => {
      // キャンバスをクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // グラフを描画
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const index = row + col * rows
          const level = data[index]

          ctx.fillStyle = colors[level]
          ctx.fillRect(col * (cellSize + cellGap), row * (cellSize + cellGap), cellSize, cellSize)
        }
      }

      // 月のラベルを追加
      const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
      ctx.fillStyle = "#24292e"
      ctx.font = "10px Arial"
      ctx.textAlign = "left"

      for (let i = 0; i < 12; i++) {
        const x = Math.floor(i * (cols / 12)) * (cellSize + cellGap)
        ctx.fillText(months[i], x, rows * (cellSize + cellGap) + 15)
      }

      // 曜日のラベルを追加
      const days = ["日", "月", "火", "水", "木", "金", "土"]
      for (let i = 0; i < 7; i++) {
        ctx.fillText(days[i], -15, i * (cellSize + cellGap) + cellSize / 2 + 3)
      }
    }

    // 初期描画
    drawGraph()

    // ResizeObserver を設定
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect()
    }

    // 新しい ResizeObserver を作成
    resizeObserverRef.current = new ResizeObserver((entries) => {
      // デバウンスのために setTimeout を使用
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return
        resizeCanvas()
        drawGraph()
      })
    })

    // コンテナ要素を監視
    resizeObserverRef.current.observe(canvasContainerRef.current)

    // マウスオーバーイベントを追加（スロットリング付き）
    let ticking = false
    const handleMouseMove = (e: MouseEvent) => {
      if (ticking) return
      ticking = true

      window.requestAnimationFrame(() => {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // セルの位置を計算
        const col = Math.floor(x / (cellSize + cellGap))
        const row = Math.floor(y / (cellSize + cellGap))

        if (col >= 0 && col < cols && row >= 0 && row < rows) {
          const index = row + col * rows
          if (index < data.length && index < dates.length) {
            const level = data[index]
            const date = dates[index]
            const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
            const count = level * 2 // 仮の学習時間（レベルに応じて）

            setTooltipData({
              date: formattedDate,
              count: count,
              level: level,
              x: col * (cellSize + cellGap) + cellSize / 2,
              y: row * (cellSize + cellGap) + cellSize / 2,
            })
          }
        } else {
          setTooltipData(null)
        }
        ticking = false
      })
    }

    const handleMouseLeave = () => {
      setTooltipData(null)
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      // クリーンアップ
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
    }
  }, [])

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] p-4" ref={canvasContainerRef}>
        <div className="relative">
          <canvas ref={canvasRef} className="w-full h-[150px]" style={{ display: "block" }} />
          {tooltipData && (
            <TooltipProvider>
              <Tooltip open={true}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute w-1 h-1"
                    style={{
                      left: `${tooltipData.x}px`,
                      top: `${tooltipData.y}px`,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 text-white p-2 rounded">
                  <div className="text-xs">
                    <p className="font-medium">{tooltipData.date}</p>
                    <p>{tooltipData.count} 時間の学習</p>
                    <p>レベル: {tooltipData.level}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex justify-end items-center mt-4 gap-2 text-sm">
          <span className="text-gray-600">少ない</span>
          {["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"].map((color, i) => (
            <div key={i} className="w-3 h-3" style={{ backgroundColor: color }} />
          ))}
          <span className="text-gray-600">多い</span>
        </div>
      </div>
    </div>
  )
}
