import { UserAvatar } from "./UserAvatar"
import { formatDate } from "@/lib/utils"
import { Upload, FileText, RefreshCcw, LogIn } from "lucide-react"

interface ActivityLog {
  id: string
  action: string
  description: string
  createdAt: string | Date
  user: { name?: string | null; email?: string | null; image?: string | null }
}

const actionIcons: Record<string, any> = {
  UPLOAD_DOCUMENT: Upload,
  UPDATE_RECOMMENDATION: RefreshCcw,
  GENERATE_RECOMMENDATIONS: FileText,
  LOGIN: LogIn,
}

const actionColors: Record<string, string> = {
  UPLOAD_DOCUMENT: "bg-blue-100 text-blue-600",
  UPDATE_RECOMMENDATION: "bg-purple-100 text-purple-600",
  GENERATE_RECOMMENDATIONS: "bg-green-100 text-green-600",
  LOGIN: "bg-gray-100 text-gray-600",
}

export function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-6">Belum ada aktivitas.</p>
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const Icon = actionIcons[log.action] || FileText
        const colorClass = actionColors[log.action] || "bg-gray-100 text-gray-600"
        return (
          <div key={log.id} className="flex items-start gap-3 py-2">
            <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 leading-snug">{log.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <UserAvatar name={log.user.name} image={log.user.image} size="sm" />
                <span className="text-xs text-gray-400">{log.user.name} · {formatDate(log.createdAt)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
