import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Navbar } from "@/components/Navbar"
import { ProdiCard } from "@/components/ProdiCard"
import { ActivityFeed } from "@/components/ActivityFeed"
import { StatsCard } from "@/components/StatsCard"
import { PRODI_LIST } from "@/lib/prodi-context"
import { FileText, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default async function HomePage() {
  const session = await requireAuth()

  const [docs, recentLogs] = await Promise.all([
    prisma.document.findMany({
      select: { id: true, type: true, prodiName: true, partnerType: true },
    }),
    prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true, image: true } } },
    }),
  ])

  type DocRow = (typeof docs)[number]

  const totalMou = docs.filter((d: DocRow) => d.type === "MOU").length
  const totalMoa = docs.filter((d: DocRow) => d.type === "MOA").length
  const totalIa = docs.filter((d: DocRow) => d.type === "IA").length

  const prodiStats = PRODI_LIST.map((prodi) => {
    const pd = docs.filter((d: DocRow) => d.prodiName === prodi)
    return {
      prodi,
      mou: pd.filter((d: DocRow) => d.type === "MOU").length,
      moa: pd.filter((d: DocRow) => d.type === "MOA").length,
      ia: pd.filter((d: DocRow) => d.type === "IA").length,
      dudi: pd.filter((d: DocRow) => d.partnerType === "DUDI").length,
      univ: pd.filter((d: DocRow) => d.partnerType === "UNIVERSITAS").length,
    }
  })

  const firstName = session.user?.name?.split(" ")[0] || "Pengguna"

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {firstName}! 👋</h1>
          <p className="text-gray-500 mt-1">Monitor dan kelola dokumen kerja sama program studi UNU Yogyakarta</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total MoU" value={totalMou} icon={FileText} color="text-blue-600" />
          <StatsCard title="Total MoA" value={totalMoa} icon={FileText} color="text-purple-600" />
          <StatsCard title="Total IA" value={totalIa} icon={FileText} color="text-orange-600" />
          <StatsCard title="Total Dokumen" value={docs.length} icon={BookOpen} color="text-[#1e3a5f]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Program Studi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {prodiStats.map((ps) => (
                <ProdiCard key={ps.prodi} prodi={ps.prodi} mou={ps.mou} moa={ps.moa} ia={ps.ia} dudi={ps.dudi} univ={ps.univ} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terkini</h2>
            <Card>
              <CardContent className="p-4">
                <ActivityFeed logs={recentLogs as any} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
