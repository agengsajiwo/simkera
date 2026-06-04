"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DocumentTypeBadge } from "./DocumentTypeBadge"
import { StatusBadge } from "./StatusBadge"
import { UserAvatar } from "./UserAvatar"
import { formatDate, daysUntilExpiry } from "@/lib/utils"
import { Calendar, Building2, FileText, AlertTriangle, Trash2, MoreVertical } from "lucide-react"

interface DocumentCardProps {
  document: {
    id: string
    type: string
    title: string
    partnerName: string
    partnerType: string
    sector: string
    signedDate: string | Date
    expiryDate: string | Date
    status: string
    prodiName: string
    uploadedBy?: { name?: string | null; email?: string | null; image?: string | null }
    recommendations?: { id: string; status: string }[]
  }
  onDeleted?: (id: string) => void
}

export function DocumentCard({ document: doc, onDeleted }: DocumentCardProps) {
  const router = useRouter()
  const days = daysUntilExpiry(doc.expiryDate)
  const isExpiringSoon = days >= 0 && days <= 30
  const pendingRecs = doc.recommendations?.filter((r) => r.status === "PENDING").length || 0
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Hapus dokumen "${doc.title}"? Tindakan ini tidak dapat dibatalkan.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Gagal menghapus dokumen")
        setDeleting(false)
        return
      }
      setDeleted(true)
      onDeleted?.(doc.id)
      router.refresh()
    } catch {
      alert("Terjadi kesalahan")
      setDeleting(false)
    }
  }

  if (deleted) return null

  return (
    <div className="relative group">
      <Link href={`/documents/${doc.id}`}>
        <Card className={`hover:shadow-md transition-all duration-200 cursor-pointer h-full ${isExpiringSoon ? "border-amber-300" : ""} ${deleting ? "opacity-50" : ""}`}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex gap-2 flex-wrap">
                <DocumentTypeBadge type={doc.type} />
                <StatusBadge status={doc.status} />
                {doc.partnerType === "DUDI"
                  ? <StatusBadge status="DUDI" />
                  : <StatusBadge status="UNIVERSITAS" />}
              </div>
              {isExpiringSoon && (
                <div className="flex items-center gap-1 text-amber-600 text-xs font-medium whitespace-nowrap">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {days}h lagi
                </div>
              )}
            </div>

            <h3 className="font-semibold text-gray-800 mb-1 text-sm leading-snug line-clamp-2 group-hover:text-[#2563eb]">
              {doc.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              {doc.partnerName}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(doc.signedDate)}
              </span>
              {pendingRecs > 0 && (
                <span className="flex items-center gap-1 text-purple-600 font-medium">
                  <FileText className="h-3 w-3" />
                  {pendingRecs} rekomendasi
                </span>
              )}
            </div>

            {doc.uploadedBy && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2">
                <UserAvatar name={doc.uploadedBy.name} image={doc.uploadedBy.image} size="sm" />
                <span className="text-xs text-gray-500">{doc.uploadedBy.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Tombol hapus — muncul saat hover */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Hapus dokumen"
        className="absolute top-2 right-2 h-7 w-7 rounded-md bg-white border border-gray-200 shadow-sm items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex z-10"
      >
        {deleting
          ? <span className="h-3.5 w-3.5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
          : <Trash2 className="h-3.5 w-3.5" />
        }
      </button>
    </div>
  )
}
