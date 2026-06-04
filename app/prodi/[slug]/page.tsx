import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { slugToProdi } from "@/lib/prodi-context"
import { Navbar } from "@/components/Navbar"
import { DocumentCard } from "@/components/DocumentCard"
import { HierarchyTree } from "@/components/HierarchyTree"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ProdiPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requireAuth()
  const { slug } = await params
  const prodiName = slugToProdi(slug)
  if (!prodiName) notFound()

  const documents = await prisma.document.findMany({
    where: { prodiName },
    include: {
      uploadedBy: { select: { name: true, email: true, image: true } },
      recommendations: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  type DocItem = (typeof documents)[number]
  type RecItem = DocItem["recommendations"][number]

  const mou = documents.filter((d: DocItem) => d.type === "MOU")
  const moa = documents.filter((d: DocItem) => d.type === "MOA")
  const ia = documents.filter((d: DocItem) => d.type === "IA")
  const pendingRecs = documents.reduce(
    (acc: number, d: DocItem) =>
      acc + d.recommendations.filter((r: RecItem) => r.status === "PENDING").length,
    0
  )

  const treeDocuments = documents.map((d: DocItem) => ({
    id: d.id,
    type: d.type,
    title: d.title,
    partnerName: d.partnerName,
    status: d.status,
    mouId: d.mouId,
    moaId: d.moaId,
  }))

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/" className="hover:text-[#2563eb]">Beranda</a>
            <span>/</span>
            <span className="text-gray-700 font-medium">{prodiName}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{prodiName}</h1>
          <div className="flex gap-3 mt-2">
            <span className="text-sm text-gray-500">{mou.length} MoU</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">{moa.length} MoA</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">{ia.length} IA</span>
            {pendingRecs > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-sm text-purple-600 font-medium">{pendingRecs} rekomendasi pending</span>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="documents">
          <TabsList className="mb-6">
            <TabsTrigger value="documents">Semua Dokumen ({documents.length})</TabsTrigger>
            <TabsTrigger value="mou">MoU ({mou.length})</TabsTrigger>
            <TabsTrigger value="moa">MoA ({moa.length})</TabsTrigger>
            <TabsTrigger value="ia">IA ({ia.length})</TabsTrigger>
            <TabsTrigger value="tree">Hierarki</TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            {documents.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-medium mb-2">Belum ada dokumen</p>
                <p className="text-sm">Upload dokumen pertama untuk program studi ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((d: DocItem) => <DocumentCard key={d.id} document={d} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mou">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mou.map((d: DocItem) => <DocumentCard key={d.id} document={d} />)}
            </div>
          </TabsContent>

          <TabsContent value="moa">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moa.map((d: DocItem) => <DocumentCard key={d.id} document={d} />)}
            </div>
          </TabsContent>

          <TabsContent value="ia">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ia.map((d: DocItem) => <DocumentCard key={d.id} document={d} />)}
            </div>
          </TabsContent>

          <TabsContent value="tree">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hierarki Dokumen Kerja Sama</CardTitle>
              </CardHeader>
              <CardContent>
                {mou.length === 0 ? (
                  <p className="text-gray-400 text-sm">Belum ada MoU untuk program studi ini.</p>
                ) : (
                  <HierarchyTree documents={treeDocuments as any} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
