import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Navbar } from "@/components/Navbar"
import { DocumentTypeBadge } from "@/components/DocumentTypeBadge"
import { StatusBadge } from "@/components/StatusBadge"
import { RecommendationList } from "@/components/RecommendationList"
import { UserAvatar } from "@/components/UserAvatar"
import { formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Building2, Download, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { DeleteDocumentButton } from "@/components/DeleteDocumentButton"

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  const { id } = await params

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      uploadedBy: { select: { name: true, email: true, image: true } },
      recommendations: {
        include: {
          sourceDocument: { select: { id: true, title: true, partnerName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      parentMou: { select: { id: true, title: true, partnerName: true } },
      parentMoa: { select: { id: true, title: true, partnerName: true } },
      mouChildren: { select: { id: true, type: true, title: true, partnerName: true, status: true } },
      moaChildren: { select: { id: true, type: true, title: true, partnerName: true, status: true } },
    },
  })

  if (!doc) notFound()

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar session={session} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#2563eb]">Beranda</Link>
          <span>/</span>
          <Link href={`/prodi/${doc.prodiName.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-[#2563eb]">{doc.prodiName}</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{doc.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <DocumentTypeBadge type={doc.type} />
                  <StatusBadge status={doc.status} />
                  <Badge variant="outline" className={doc.partnerType === "DUDI" ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}>
                    {doc.partnerType}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600">{doc.sector}</Badge>
                </div>

                <h1 className="text-xl font-bold text-gray-900 mb-2">{doc.title}</h1>
                <p className="text-gray-600 flex items-center gap-2 mb-4">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  {doc.partnerName}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Tanggal TTD</p>
                    <p className="font-medium">{formatDate(doc.signedDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Berlaku Hingga</p>
                    <p className="font-medium">{formatDate(doc.expiryDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Program Studi</p>
                    <p className="font-medium">{doc.prodiName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Masa Berlaku</p>
                    <p className="font-medium">{doc.validityYears} Tahun</p>
                  </div>
                </div>

                {doc.cooperationField && (
                  <div className="mt-4">
                    <p className="text-gray-400 text-xs mb-1">Bidang Kerja Sama</p>
                    <p className="text-sm text-gray-700">{doc.cooperationField}</p>
                  </div>
                )}

                {doc.aiSummary && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 mb-1">🤖 Ringkasan AI</p>
                    <p className="text-sm text-blue-800">{doc.aiSummary}</p>
                  </div>
                )}

                {doc.notes && (
                  <div className="mt-4">
                    <p className="text-gray-400 text-xs mb-1">Catatan</p>
                    <p className="text-sm text-gray-700">{doc.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related docs */}
            {(doc.mouChildren.length > 0 || doc.moaChildren.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-gray-700">Dokumen Turunan</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {[...doc.mouChildren, ...doc.moaChildren].map((child) => (
                      <Link key={child.id} href={`/documents/${child.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <DocumentTypeBadge type={child.type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{child.title}</p>
                          <p className="text-xs text-gray-500">{child.partnerName}</p>
                        </div>
                        <StatusBadge status={child.status} />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {doc.recommendations.length > 0 && (
              <RecommendationList
                initialRecs={doc.recommendations.map((rec) => ({
                  ...rec,
                  signedDate: rec.createdAt,
                  sourceDocument: { id: doc.id, title: doc.title, partnerName: doc.partnerName },
                })) as any}
                title={`Rekomendasi AI untuk ${doc.type} ini`}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700">Diupload Oleh</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <UserAvatar name={doc.uploadedBy.name} image={doc.uploadedBy.image} size="md" />
                  <div>
                    <p className="text-sm font-medium">{doc.uploadedBy.name}</p>
                    <p className="text-xs text-gray-500">{doc.uploadedBy.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(doc.uploadedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(doc.parentMou || doc.parentMoa) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-gray-700">Dokumen Induk</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {doc.parentMou && (
                    <Link href={`/documents/${doc.parentMou.id}`}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-sm">
                      <LinkIcon className="h-3.5 w-3.5 text-blue-500" />
                      <div>
                        <p className="font-medium text-xs">MoU Induk</p>
                        <p className="text-xs text-gray-500">{doc.parentMou.title}</p>
                      </div>
                    </Link>
                  )}
                  {doc.parentMoa && (
                    <Link href={`/documents/${doc.parentMoa.id}`}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-sm">
                      <LinkIcon className="h-3.5 w-3.5 text-purple-500" />
                      <div>
                        <p className="font-medium text-xs">MoA Induk</p>
                        <p className="text-xs text-gray-500">{doc.parentMoa.title}</p>
                      </div>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4 space-y-2">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d4f7c] transition-colors">
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
                <DeleteDocumentButton
                  documentId={doc.id}
                  documentTitle={doc.title}
                  documentType={doc.type}
                  redirectTo={`/prodi/${doc.prodiName.toLowerCase().replace(/\s+/g, "-")}`}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
