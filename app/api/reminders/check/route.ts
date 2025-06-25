import { NextRequest, NextResponse } from 'next/server'
import { sendNotificationToUser } from '@/app/action'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting event reminder check...')
    
    // 現在時刻を取得
    const now = new Date()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD形式
    
    // 今日のイベントを取得（hasReminder=trueのもののみ）
    const eventsResponse = await fetch(`${API_BASE_URL}/events`)
    if (!eventsResponse.ok) {
      throw new Error('Failed to fetch events')
    }
    
    const allEvents = await eventsResponse.json()
    const todayEvents = allEvents.filter((event: any) => 
      event.date === today && event.hasReminder === true
    )
    
    console.log(`Found ${todayEvents.length} events with reminders for today`)
    
    const results = []
    
    for (const event of todayEvents) {
      try {
        // このイベントのリマインダーが既に送信されているかチェック
        const remindersResponse = await fetch(
          `${API_BASE_URL}/event_reminders?eventId=${event.id}&reminderType=day_of&isSent=true`
        )
        
        if (remindersResponse.ok) {
          const existingReminders = await remindersResponse.json()
          if (existingReminders.length > 0) {
            console.log(`Reminder already sent for event ${event.id}`)
            continue
          }
        }
        
        // イベントの開始時刻を計算
        let eventTimeStr = ''
        if (event.startTime) {
          eventTimeStr = ` (${event.startTime}開始)`
        }
        
        // グループイベントの場合はグループ情報を取得
        let groupName = ''
        if (event.isGroupEvent && event.groupId) {
          try {
            const groupResponse = await fetch(`${API_BASE_URL}/groups/${event.groupId}`)
            if (groupResponse.ok) {
              const group = await groupResponse.json()
              groupName = ` - ${group.name}`
            }
          } catch (error) {
            console.error(`Failed to fetch group info for event ${event.id}:`, error)
          }
        }
        
        // 通知を送信
        const notificationResult = await sendNotificationToUser(
          event.userId,
          'イベントのリマインダー',
          `本日のイベント: ${event.title}${eventTimeStr}${groupName}`,
          {
            type: 'event_reminder',
            eventId: event.id,
            url: '/dashboard'
          }
        )
        
        if (notificationResult.success) {
          // リマインダー送信記録を作成
          const reminderRecord = {
            id: `reminder-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            eventId: event.id,
            userId: event.userId,
            reminderType: 'day_of',
            sentAt: new Date().toISOString(),
            isSent: true,
            scheduledFor: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
          
          await fetch(`${API_BASE_URL}/event_reminders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reminderRecord),
          })
          
          results.push({
            eventId: event.id,
            eventTitle: event.title,
            userId: event.userId,
            status: 'sent',
            sentAt: reminderRecord.sentAt
          })
          
          console.log(`Reminder sent for event: ${event.title}`)
        } else {
          results.push({
            eventId: event.id,
            eventTitle: event.title,
            userId: event.userId,
            status: 'failed',
            error: notificationResult.error
          })
          
          console.error(`Failed to send reminder for event ${event.id}:`, notificationResult.error)
        }
      } catch (error) {
        console.error(`Error processing reminder for event ${event.id}:`, error)
        results.push({
          eventId: event.id,
          eventTitle: event.title,
          userId: event.userId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      message: `Processed ${todayEvents.length} events`,
      date: today,
      results,
      summary: {
        total: todayEvents.length,
        sent: results.filter(r => r.status === 'sent').length,
        failed: results.filter(r => r.status === 'failed').length,
        errors: results.filter(r => r.status === 'error').length
      }
    })
  } catch (error) {
    console.error('Error in event reminder check:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
