"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, MessageSquareText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Thread } from "./thread-modal"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  threads: Thread[]
  onSelect: (thread: Thread) => void
}

export default function ThreadListModal({ open, onOpenChange, threads, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>スレッド一覧</DialogTitle>
        </DialogHeader>
        {threads.length === 0 ? (
          <p className="text-sm text-gray-500 flex items-center gap-1 py-6 justify-center"><MessageSquare className="h-4 w-4" /> スレッドはありません</p>
        ) : (
          <ScrollArea className="h-[60vh] pr-2">
            <div className="space-y-4">
              {threads.map((t) => {
                const snippet = t.content.length > 60 ? t.content.slice(0, 57) + "…" : t.content
                return (
                  <Card key={t.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(t)}>
                    <CardContent className="p-4 flex gap-3 items-start">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={t.userAvatar || "/placeholder.svg"} alt={t.userName} />
                        <AvatarFallback>{t.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{t.userName}</p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{t.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 truncate">{snippet}</p>
                        {t.replies.length > 0 && (
                          <div className="flex items-center text-xs text-gray-500 mt-2 gap-1">
                            <MessageSquareText className="h-3 w-3" /> {t.replies.length} 件の返信
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
} 