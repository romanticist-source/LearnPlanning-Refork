"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

interface Activity {
  id: string
  user: string
  action: string
  target: string
  time?: string
  group: string
  createdAt: string
}

interface GroupActivityProps {
  groupId?: string
  limit?: number
}

export default function GroupActivity({ groupId, limit = 10 }: GroupActivityProps = {}) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const params = new URLSearchParams()
        if (groupId) {
          params.append('groupId', groupId)
        }
        params.append('limit', limit.toString())

        const response = await fetch(`/api/activities?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch activities')
        }
        
        const data = await response.json()
        setActivities(data)
      } catch (error) {
        console.error('Failed to fetch activities:', error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [groupId, limit])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse border-b pb-3">
            <div className="flex items-start gap-2">
              <div className="bg-gray-200 rounded-full h-8 w-8"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>まだアクティビティがありません</p>
        <p className="text-sm mt-2">グループの活動が始まるとここに表示されます</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="border-b pb-3 last:border-b-0 last:pb-0">
          <div className="flex items-start gap-2">
            <div className="bg-emerald-100 text-emerald-600 rounded-full h-8 w-8 flex items-center justify-center font-medium">
              {activity.user.charAt(0)}
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span> {activity.action}
                {": "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {activity.createdAt
                    ? formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: ja,
                      })
                    : activity.time || '不明'}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{activity.group}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
