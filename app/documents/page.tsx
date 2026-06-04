import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Navbar } from "@/components/Navbar"
import { DocumentCard } from "@/components/DocumentCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRODI_LIST } from "@/lib/prodi-context"

export default async function DocumentsPage() {
  const session = await requireAuth()

  const documents = await prisma.document.findMany({
    include: {
      uploadedBy: { select: { name: true, email: true, image: true } },
      recommendations: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar session={session} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Semua Dokumen</h1>
            <p className="text-gray-500 text-sm mt-1">{documents.length} dokumen ditemukan</p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium mb-2">Belum ada dokumen</p>
            <p className="text-sm">Mulai dengan mengunggah dokumen pertama</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc as any} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
