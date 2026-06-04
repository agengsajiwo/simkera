"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"

interface DeleteDocumentButtonProps {
  documentId: string
  documentTitle: string
  documentType: string
  /** Setelah hapus, redirect ke path ini. Default: /documents */
  redirectTo?: string
  /** Tampilan compact untuk card list */
  compact?: boolean
}

export function DeleteDocumentButton({
  documentId,
  documentTitle,
  documentType,
  redirectTo = "/documents",
  compact = false,
}: DeleteDocumentButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Gagal menghapus dokumen")
        setLoading(false)
        return
      }

      setOpen(false)
      router.push(redirectTo)
      router.refresh()
    } catch {
      setError("Terjadi kesalahan, coba lagi")
      setLoading(false)
    }
  }

  return (
    <>
      {compact ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 w-full px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Hapus Dokumen
        </button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          onClick={() => setOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Hapus
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Konfirmasi Hapus Dokumen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-1">
                Anda akan menghapus dokumen berikut:
              </p>
              <p className="text-sm text-red-700 font-semibold">
                [{documentType}] {documentTitle}
              </p>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>Tindakan ini akan menghapus:</p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-500 ml-2">
                <li>Data dokumen dari sistem</li>
                <li>File PDF yang tersimpan</li>
                <li>Semua rekomendasi AI terkait dokumen ini</li>
              </ul>
              <p className="text-amber-600 font-medium mt-2">
                ⚠️ Dokumen yang memiliki MoA/IA turunan tidak dapat dihapus.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setOpen(false); setError("") }}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Menghapus...</>
                  : <><Trash2 className="h-4 w-4" /> Ya, Hapus</>
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
