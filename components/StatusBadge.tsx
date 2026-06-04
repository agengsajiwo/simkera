import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    EXPIRED: "bg-red-100 text-red-800 border-red-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    HIGH: "bg-red-100 text-red-700 border-red-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    LOW: "bg-gray-100 text-gray-700 border-gray-200",
    FOLLOWED_UP: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    DISMISSED: "bg-gray-100 text-gray-500 border-gray-200",
    DUDI: "bg-teal-100 text-teal-800 border-teal-200",
    UNIVERSITAS: "bg-indigo-100 text-indigo-800 border-indigo-200",
  }

  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    EXPIRED: "Kedaluwarsa",
    PENDING: "Menunggu",
    FOLLOWED_UP: "Ditindaklanjuti",
    COMPLETED: "Selesai",
    DISMISSED: "Diabaikan",
    DUDI: "DUDI",
    UNIVERSITAS: "Universitas",
  }

  return (
    <Badge variant="outline" className={styles[status] || "bg-gray-100 text-gray-700"}>
      {labels[status] || status}
    </Badge>
  )
}
