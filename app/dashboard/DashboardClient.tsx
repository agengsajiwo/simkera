"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/StatsCard"
import { RecommendationCard } from "@/components/RecommendationCard"
import { FilterBar } from "@/components/FilterBar"
import { StatsLoadingSkeleton, LoadingSkeleton } from "@/components/LoadingSkeleton"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import { FileText, Building2, University, AlertTriangle, Bell, TrendingUp } from "lucide-react"

const STATUS_COLORS: Record<string, string> = {
  LENGKAP: "bg-green-100 text-green-700",
  PERLU_IA: "bg-orange-100 text-orange-700",
  PERLU_MOA_IA: "bg-red-100 text-red-700",
  BELUM_ADA: "bg-gray-100 text-gray-500",
}
const STATUS_LABELS: Record<string, string> = {
  LENGKAP: "Lengkap",
  PERLU_IA: "Perlu IA",
  PERLU_MOA_IA: "Perlu MoA & IA",
  BELUM_ADA: "Belum Ada",
}

const PIE_COLORS = ["#0d9488", "#6366f1"]

export function DashboardClient() {
  const [stats, setStats] = useState<any>(null)
  const [recs, setRecs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recLoading, setRecLoading] = useState(false)
  const [filters, setFilters] = useState({
    prodiName: "ALL",
    type: "ALL",
    priority: "ALL",
    status: "PENDING",
    beneficiary: "ALL",
    sort: "createdAt",
  })

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setRecLoading(true)
    const params = new URLSearchParams()
    if (filters.prodiName !== "ALL") params.set("prodiName", filters.prodiName)
    if (filters.type !== "ALL") params.set("type", filters.type)
    if (filters.priority !== "ALL") params.set("priority", filters.priority)
    if (filters.status !== "ALL") params.set("status", filters.status)
    params.set("sort", filters.sort)

    fetch(`/api/recommendations?${params}`)
      .then((r) => r.json())
      .then(setRecs)
      .finally(() => setRecLoading(false))
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }))
  }

  const handleRecStatusChange = (id: string, status: string) => {
    // Update status lokal dulu (langsung terasa)
    setRecs((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    // Kalau filter aktif berdasarkan status, hapus item yang tidak cocok lagi setelah 800ms
    if (filters.status !== "ALL") {
      setTimeout(() => {
        setRecs((prev) => prev.filter((r) => r.id !== id || r.status === filters.status))
      }, 800)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <StatsLoadingSkeleton />
        <LoadingSkeleton count={3} />
      </div>
    )
  }

  const { totals, prodiStats, bySector, byPartnerType, monthlyUploads, recommendations: recSummary } = stats || {}

  const prodiChartData = (prodiStats || []).map((p: any) => ({
    name: p.prodi.length > 10 ? p.prodi.substring(0, 10) + "…" : p.prodi,
    MoU: p.mou,
    MoA: p.moa,
    IA: p.ia,
  }))

  return (
    <div className="space-y-8">
      {/* Section A: Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatsCard title="Total Kerja Sama" value={totals?.documents || 0} icon={FileText} />
        <StatsCard title="Total MoU" value={totals?.mou || 0} icon={FileText} color="text-blue-600" />
        <StatsCard title="Total MoA" value={totals?.moa || 0} icon={FileText} color="text-purple-600" />
        <StatsCard title="Total IA" value={totals?.ia || 0} icon={FileText} color="text-orange-600" />
        <StatsCard title="Mitra DUDI" value={totals?.dudi || 0} icon={Building2} color="text-teal-600" />
        <StatsCard title="Mitra Universitas" value={totals?.universitas || 0} icon={University} color="text-indigo-600" />
      </div>

      {totals?.expiringSoon > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-amber-800 font-medium">
              {totals.expiringSoon} dokumen akan berakhir dalam 30 hari ke depan.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Section B: Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">Dokumen per Program Studi</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={prodiChartData} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="MoU" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="MoA" fill="#7c3aed" radius={[2, 2, 0, 0]} />
                <Bar dataKey="IA" fill="#f97316" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">Tipe Mitra</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byPartnerType || []} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label={(props: any) => `${props.type} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                  {(byPartnerType || []).map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs mt-2">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-teal-500 inline-block" />DUDI</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block" />Universitas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section C: Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">Kerja Sama per Sektor</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bySector || []} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="sector" tick={{ fontSize: 10 }} width={60} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e3a5f" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">Upload per Bulan</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyUploads || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Section D: Per-Prodi Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700">Monitoring per Program Studi</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                {["Program Studi", "MoU", "MoA", "IA", "DUDI", "Universitas", "Rec. Pending", "Status"].map((h) => (
                  <th key={h} className="py-2 px-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(prodiStats || []).map((p: any) => (
                <tr key={p.prodi} className="border-b hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-800 whitespace-nowrap">{p.prodi}</td>
                  <td className="py-2.5 px-3 text-center">{p.mou}</td>
                  <td className="py-2.5 px-3 text-center">{p.moa}</td>
                  <td className="py-2.5 px-3 text-center">{p.ia}</td>
                  <td className="py-2.5 px-3 text-center">{p.dudi}</td>
                  <td className="py-2.5 px-3 text-center">{p.univ}</td>
                  <td className="py-2.5 px-3 text-center">
                    {p.pendingRecs > 0 && <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">{p.pendingRecs}</Badge>}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className={`text-xs ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Section F: Opportunity Widget */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Peluang Kerja Sama Yang Perlu Ditindaklanjuti
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 px-3 py-1 text-xs font-medium">
              {recSummary?.mouWithoutMoa || 0} MoU tanpa MoA
            </Badge>
            <Badge variant="outline" className="bg-white text-purple-700 border-purple-200 px-3 py-1 text-xs font-medium">
              {recSummary?.moaWithoutIa || 0} MoA tanpa IA
            </Badge>
            <Badge variant="outline" className="bg-white text-red-700 border-red-200 px-3 py-1 text-xs font-medium">
              {recSummary?.highPriority || 0} Prioritas Tinggi
            </Badge>
            <Badge variant="outline" className="bg-white text-gray-700 border-gray-200 px-3 py-1 text-xs font-medium">
              {recSummary?.pending || 0} Rekomendasi Pending
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section G: Recommendations */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-[#1e3a5f]" />
          <h2 className="text-lg font-semibold text-gray-800">Rekomendasi Kerja Sama AI</h2>
        </div>

        <div className="mb-4">
          <FilterBar filters={filters} onChange={handleFilterChange} />
        </div>

        {recLoading ? (
          <LoadingSkeleton count={3} />
        ) : recs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Tidak ada rekomendasi yang sesuai dengan filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recs.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} onStatusChange={handleRecStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
