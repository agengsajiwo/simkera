import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prodiToSlug } from "@/lib/prodi-context"
import { FileText, Building2, University, ArrowRight } from "lucide-react"

interface ProdiCardProps {
  prodi: string
  mou: number
  moa: number
  ia: number
  dudi: number
  univ: number
}

const prodiIcons: Record<string, string> = {
  Manajemen: "💼",
  Akuntansi: "📊",
  Farmasi: "💊",
  "Teknologi Hasil Pertanian": "🌾",
  Agribisnis: "🌿",
  "Studi Islam Interdisipliner": "🕌",
  "Teknik Elektro": "⚡",
  Informatika: "💻",
  "Teknik Komputer": "🖥️",
  PGSD: "📚",
  PBI: "🗣️",
}

export function ProdiCard({ prodi, mou, moa, ia, dudi, univ }: ProdiCardProps) {
  const slug = prodiToSlug(prodi)
  const total = mou + moa + ia
  const totalMitra = dudi + univ

  return (
    <Link href={`/prodi/${slug}`}>
      <Card className="hover:shadow-md hover:border-[#2563eb]/40 transition-all duration-200 cursor-pointer group h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-2xl">{prodiIcons[prodi] || "📋"}</span>
              <h3 className="font-semibold text-gray-800 mt-1.5 text-sm leading-tight">{prodi}</h3>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#2563eb] transition-colors mt-1" />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1.5">
              {mou} MoU
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-1.5">
              {moa} MoA
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-1.5">
              {ia} IA
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {dudi} DUDI
            </span>
            <span className="flex items-center gap-1">
              <University className="h-3 w-3" />
              {univ} Univ
            </span>
            <span className="ml-auto font-medium text-gray-700">{total} total</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
