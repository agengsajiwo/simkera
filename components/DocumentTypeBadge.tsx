import { Badge } from "@/components/ui/badge"

interface DocumentTypeBadgeProps {
  type: string
}

export function DocumentTypeBadge({ type }: DocumentTypeBadgeProps) {
  const styles: Record<string, string> = {
    MOU: "bg-blue-100 text-blue-800 border-blue-200",
    MOA: "bg-purple-100 text-purple-800 border-purple-200",
    IA: "bg-orange-100 text-orange-800 border-orange-200",
  }
  return (
    <Badge variant="outline" className={styles[type] || "bg-gray-100 text-gray-800"}>
      {type}
    </Badge>
  )
}
