import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color?: string
  subtitle?: string
  warning?: boolean
}

export function StatsCard({ title, value, icon: Icon, color = "text-[#1e3a5f]", subtitle, warning }: StatsCardProps) {
  return (
    <Card className={`${warning ? "border-amber-300 bg-amber-50" : ""}`}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${warning ? "bg-amber-100" : "bg-slate-100"}`}>
          <Icon className={`h-6 w-6 ${warning ? "text-amber-600" : color}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={`text-2xl font-bold ${warning ? "text-amber-700" : "text-gray-800"}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
