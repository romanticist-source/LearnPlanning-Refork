"use client"

import { useEffect, useRef, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PaizaActivity {
  date: string
  codeExecutions: number
  studyMinutes: number
  problemsSolved: number
  language: string
  difficulty: string
}

interface PaizaContributionGraphProps {
  userId: string
  activities?: PaizaActivity[]
}

export default function PaizaContributionGraph({ userId, activities = [] }: PaizaContributionGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const [tooltipData, setTooltipData] = useState<{
    date: string
    codeExecutions: number
    studyMinutes: number
    problemsSolved: number
    language?: string
    level: number
    x: number
    y: number
  } | null>(null)
  const [paizaActivities, setPaizaActivities] = useState<PaizaActivity[]>(activities)

  // APIからPaizaアクティビティデータを取得
  useEffect(() => {
    const fetchPaizaActivities = async () => {
      try {
        const response = await fetch(`/api/paiza-activities?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setPaizaActivities(data)
        }
      } catch (error) {
        console.error('Failed to fetch Paiza activities:', error)
      }
    }

    if (userId && !activities.length) {
      fetchPaizaActivities()
    }
  }, [userId, activities])

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

    // 現在の日付から1年前までの日付を生成
    const today = new Date()
    const dates: Date[] = []
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(endDate.getFullYear() - 1)

    for (let i = 0; i < rows * cols; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date)
    }

    // アクティビティデータをマップに変換
    const activityMap = new Map<string, PaizaActivity>()
    paizaActivities.forEach(activity => {
      activityMap.set(activity.date, activity)
    })

    // 各日付の活動レベルを計算
    const data = dates.map(date => {
      const dateStr = date.toISOString().split('T')[0]
      const activity = activityMap.get(dateStr)
      
      if (!activity) return 0
      
      // コード実行回数と学習時間を基に活動レベルを計算
      const executionScore = Math.min(activity.codeExecutions / 5, 4) // 5実行で1レベル
      const studyScore = Math.min(activity.studyMinutes / 30, 4) // 30分で1レベル
      const problemScore = Math.min(activity.problemsSolved, 4) // 問題解決数
      
      const totalScore = (executionScore + studyScore + problemScore) / 3
      return Math.min(Math.ceil(totalScore), 4)
    })

    // Paiza特有の色設定（青系グラデーション）
    const colors = [
      "#ebedf0", // レベル0（活動なし）
      "#c6e48b", // レベル1（薄い緑）
      "#7bc96f", // レベル2（緑）
      "#239a3b", // レベル3（濃い緑）
      "#196127", // レベル4（最も濃い緑）
    ]

    // グラフを描画する関数
    const drawGraph = () => {
      // キャンバスをクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // グラフを描画
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const index = row + col * rows
          if (index < data.length) {
            const level = data[index]
            ctx.fillStyle = colors[level]
            ctx.strokeStyle = "#e1e4e8"
            ctx.lineWidth = 1
            
            const x = col * (cellSize + cellGap)
            const y = row * (cellSize + cellGap)
            
            ctx.fillRect(x, y, cellSize, cellSize)
            ctx.strokeRect(x, y, cellSize, cellSize)
          }
        }
      }

      // 月のラベルを追加
      const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
      ctx.fillStyle = "#586069"
      ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
      ctx.textAlign = "left"

      for (let i = 0; i < 12; i++) {
        const x = Math.floor(i * (cols / 12)) * (cellSize + cellGap)
        ctx.fillText(months[i], x, rows * (cellSize + cellGap) + 20)
      }

      // 曜日のラベルを追加
      const days = ["日", "月", "火", "水", "木", "金", "土"]
      ctx.textAlign = "right"
      for (let i = 1; i < 7; i += 2) { // 月、水、金だけ表示
        ctx.fillText(days[i], -8, i * (cellSize + cellGap) + cellSize / 2 + 4)
      }
    }

    // 初期描画
    drawGraph()

    // ResizeObserver を設定
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect()
    }

    resizeObserverRef.current = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return
        resizeCanvas()
        drawGraph()
      })
    })

    resizeObserverRef.current.observe(canvasContainerRef.current)

    // マウスオーバーイベントを追加
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
            const dateStr = date.toISOString().split('T')[0]
            const activity = activityMap.get(dateStr)
            
            const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

            setTooltipData({
              date: formattedDate,
              codeExecutions: activity?.codeExecutions || 0,
              studyMinutes: activity?.studyMinutes || 0,
              problemsSolved: activity?.problemsSolved || 0,
              language: activity?.language,
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
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
    }
  }, [paizaActivities, userId])

  // 統計情報を計算
  const totalExecutions = paizaActivities.reduce((sum, activity) => sum + activity.codeExecutions, 0)
  const totalStudyMinutes = paizaActivities.reduce((sum, activity) => sum + activity.studyMinutes, 0)
  const totalProblemsSolved = paizaActivities.reduce((sum, activity) => sum + activity.problemsSolved, 0)

  return (
    <div className="w-full space-y-4">
      {/* 統計情報 */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalExecutions}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">コード実行回数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">学習時間</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalProblemsSolved}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">解決した問題数</div>
        </div>
      </div>

      {/* コントリビューショングラフ */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-4" ref={canvasContainerRef}>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Paizaアクティビティ
          </h3>
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
                  <TooltipContent side="top" className="bg-gray-800 text-white p-3 rounded-lg">
                    <div className="text-xs space-y-1">
                      <p className="font-medium">{tooltipData.date}</p>
                      {tooltipData.codeExecutions > 0 && (
                        <p>🚀 {tooltipData.codeExecutions}回のコード実行</p>
                      )}
                      {tooltipData.studyMinutes > 0 && (
                        <p>📚 {tooltipData.studyMinutes}分の学習</p>
                      )}
                      {tooltipData.problemsSolved > 0 && (
                        <p>🎯 {tooltipData.problemsSolved}問解決</p>
                      )}
                      {tooltipData.language && (
                        <p>💻 {tooltipData.language}</p>
                      )}
                      {tooltipData.level === 0 && <p>📴 アクティビティなし</p>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              過去1年間のPaizaでの学習活動
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">少ない</span>
              {["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"].map((color, i) => (
                <div key={i} className="w-3 h-3 border border-gray-300 dark:border-gray-600" style={{ backgroundColor: color }} />
              ))}
              <span className="text-gray-600 dark:text-gray-400">多い</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}