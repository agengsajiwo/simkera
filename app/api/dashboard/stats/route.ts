import { NextRequest, NextResponse } from "next/server"
import { validateApiSession } from "@/lib/api-auth"
import { prisma } from "@/lib/db"
import { PRODI_LIST } from "@/lib/prodi-context"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"

export async function GET(req: NextRequest) {
  const { error } = await validateApiSession()
  if (error) return error

  const [allDocs, allRecs] = await Promise.all([
    prisma.document.findMany({
      select: {
        id: true, type: true, prodiName: true, partnerType: true, sector: true,
        status: true, expiryDate: true, createdAt: true, partnerName: true, mouId: true, moaId: true,
      },
    }),
    prisma.recommendation.findMany({
      select: { id: true, prodiName: true, type: true, status: true, priority: true },
    }),
  ])

  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const totalMou = allDocs.filter((d) => d.type === "MOU").length
  const totalMoa = allDocs.filter((d) => d.type === "MOA").length
  const totalIa = allDocs.filter((d) => d.type === "IA").length
  const totalDudi = allDocs.filter((d) => d.partnerType === "DUDI").length
  const totalUniv = allDocs.filter((d) => d.partnerType === "UNIVERSITAS").length
  const expiringSoon = allDocs.filter(
    (d) => new Date(d.expiryDate) > now && new Date(d.expiryDate) <= in30Days
  ).length

  // Per-prodi breakdown
  const prodiStats = PRODI_LIST.map((prodi) => {
    const prodiDocs = allDocs.filter((d) => d.prodiName === prodi)
    const mou = prodiDocs.filter((d) => d.type === "MOU").length
    const moa = prodiDocs.filter((d) => d.type === "MOA").length
    const ia = prodiDocs.filter((d) => d.type === "IA").length
    const dudi = prodiDocs.filter((d) => d.partnerType === "DUDI").length
    const univ = prodiDocs.filter((d) => d.partnerType === "UNIVERSITAS").length
    const pendingRecs = allRecs.filter(
      (r) => r.prodiName === prodi && r.status === "PENDING"
    ).length

    let status = "BELUM_ADA"
    if (mou > 0 && moa > 0 && ia > 0) status = "LENGKAP"
    else if (mou > 0 && moa > 0) status = "PERLU_IA"
    else if (mou > 0) status = "PERLU_MOA_IA"

    return { prodi, mou, moa, ia, total: prodiDocs.length, dudi, univ, pendingRecs, status }
  })

  // Sector breakdown
  const sectorMap: Record<string, number> = {}
  allDocs.forEach((d) => {
    sectorMap[d.sector] = (sectorMap[d.sector] || 0) + 1
  })
  const bySector = Object.entries(sectorMap).map(([sector, count]) => ({ sector, count }))

  // Monthly uploads (last 12 months)
  const monthlyUploads = []
  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i)
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    const count = allDocs.filter(
      (d) => new Date(d.createdAt) >= start && new Date(d.createdAt) <= end
    ).length
    monthlyUploads.push({
      month: monthDate.toLocaleString("id-ID", { month: "short", year: "2-digit" }),
      count,
    })
  }

  // Recommendations summary
  const mouWithoutMoa = allDocs
    .filter((d) => d.type === "MOU")
    .filter((mou) => !allDocs.some((d) => d.type === "MOA" && d.mouId === mou.id)).length

  const moaWithoutIa = allDocs
    .filter((d) => d.type === "MOA")
    .filter((moa) => !allDocs.some((d) => d.type === "IA" && d.moaId === moa.id)).length

  const highPriorityRecs = allRecs.filter(
    (r) => r.priority === "HIGH" && r.status === "PENDING"
  ).length

  return NextResponse.json({
    totals: {
      documents: allDocs.length,
      mou: totalMou,
      moa: totalMoa,
      ia: totalIa,
      dudi: totalDudi,
      universitas: totalUniv,
      expiringSoon,
    },
    prodiStats,
    bySector,
    byPartnerType: [
      { type: "DUDI", count: totalDudi },
      { type: "UNIVERSITAS", count: totalUniv },
    ],
    monthlyUploads,
    recommendations: {
      total: allRecs.length,
      pending: allRecs.filter((r) => r.status === "PENDING").length,
      mouWithoutMoa,
      moaWithoutIa,
      highPriority: highPriorityRecs,
    },
  })
}
