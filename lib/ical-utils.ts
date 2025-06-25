import { format } from "date-fns"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: Date
  startTime?: string
  endTime?: string
  location?: string
  eventType?: string
  isOnline?: boolean
  groupName?: string
}

/**
 * iCalファイルのコンテンツを生成する
 */
export function generateICalContent(events: CalendarEvent[], filename?: string): string {
  // iCalファイルのヘッダー
  let iCalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Learn Planning//Schedule//JP",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ].join("\r\n") + "\r\n"

  // イベントをiCalフォーマットに変換
  events.forEach((event) => {
    const eventDate = format(event.date, "yyyyMMdd")
    let startTime = ""
    let endTime = ""

    // 時間の処理
    if (event.startTime) {
      const [startHour, startMinute] = event.startTime.split(":")
      startTime = `T${startHour.padStart(2, "0")}${(startMinute || "00").padStart(2, "0")}00`
      
      if (event.endTime) {
        const [endHour, endMinute] = event.endTime.split(":")
        endTime = `T${endHour.padStart(2, "0")}${(endMinute || "00").padStart(2, "0")}00`
      } else {
        // 終了時間が指定されていない場合は開始時間の1時間後
        const endHour = (Number.parseInt(startHour) + 1).toString().padStart(2, "0")
        endTime = `T${endHour}${(startMinute || "00").padStart(2, "0")}00`
      }
    }

    // 場所の情報を作成
    let location = ""
    if (event.isOnline) {
      location = "オンライン"
    } else if (event.location) {
      location = event.location
    }

    // 説明文を作成
    let description = event.description || ""
    if (event.groupName) {
      description += description ? `\nグループ: ${event.groupName}` : `グループ: ${event.groupName}`
    }
    if (event.eventType) {
      const eventTypeLabel = getEventTypeLabel(event.eventType)
      description += description ? `\n種別: ${eventTypeLabel}` : `種別: ${eventTypeLabel}`
    }

    // カテゴリの設定
    const category = event.eventType ? event.eventType.toUpperCase() : "EVENT"

    // iCalイベントを追加
    const eventLines = [
      "BEGIN:VEVENT",
      `UID:${event.id}@learnplanning.example.com`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd")}T000000Z`,
      `DTSTART:${eventDate}${startTime}`,
      `DTEND:${eventDate}${endTime || startTime}`,
      `SUMMARY:${escapeICalText(event.title)}`,
    ]

    if (description) {
      eventLines.push(`DESCRIPTION:${escapeICalText(description)}`)
    }

    if (location) {
      eventLines.push(`LOCATION:${escapeICalText(location)}`)
    }

    eventLines.push(
      `CATEGORIES:${category}`,
      "END:VEVENT"
    )

    iCalContent += eventLines.join("\r\n") + "\r\n"
  })

  // iCalファイルのフッター
  iCalContent += "END:VCALENDAR"

  return iCalContent
}

/**
 * iCalファイルをダウンロードする
 */
export function downloadICalFile(events: CalendarEvent[], filename: string): void {
  const iCalContent = generateICalContent(events)
  
  const blob = new Blob([iCalContent], { type: "text/calendar;charset=utf-8" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * iCalテキストをエスケープする
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "")
}

/**
 * イベントタイプに対応する日本語ラベルを取得する
 */
function getEventTypeLabel(type: string): string {
  switch (type) {
    case "meeting":
      return "ミーティング"
    case "deadline":
      return "締切"
    case "event":
      return "イベント"
    default:
      return "その他"
  }
}

/**
 * 月名からファイル名を生成する
 */
export function generateFilename(prefix: string, month?: Date): string {
  const dateStr = month ? format(month, "yyyy-MM") : format(new Date(), "yyyy-MM")
  return `${prefix}-${dateStr}.ics`
} 