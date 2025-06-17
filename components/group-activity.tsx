export default function GroupActivity() {
  const activities = [
    {
      id: "1",
      user: "田中さん",
      action: "新しい目標を追加しました",
      target: "データベース設計の基礎を学ぶ",
      time: "30分前",
      group: "Web開発チーム",
    },
    {
      id: "2",
      user: "佐藤さん",
      action: "目標を達成しました",
      target: "JavaScriptの基本構文を理解する",
      time: "2時間前",
      group: "プログラミング勉強会",
    },
    {
      id: "3",
      user: "鈴木さん",
      action: "質問に回答しました",
      target: "再帰関数の最適化について",
      time: "3時間前",
      group: "アルゴリズム特訓",
    },
    {
      id: "4",
      user: "高橋さん",
      action: "新しいリソースを共有しました",
      target: "Webフロントエンド開発のチュートリアル",
      time: "昨日",
      group: "Web開発チーム",
    },
    {
      id: "5",
      user: "伊藤さん",
      action: "グループに参加しました",
      target: "プログラミング勉強会",
      time: "昨日",
      group: "プログラミング勉強会",
    },
  ]

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
                <span className="text-xs text-gray-500">{activity.time}</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{activity.group}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
