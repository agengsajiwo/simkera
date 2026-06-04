"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRODI_LIST } from "@/lib/prodi-context"

interface FilterBarProps {
  filters: {
    prodiName: string
    type: string
    priority: string
    status: string
    beneficiary: string
    sort: string
  }
  onChange: (key: string, value: string) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const handle = (key: string) => (v: string | null) => onChange(key, v ?? "ALL")

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={filters.prodiName} onValueChange={handle("prodiName")}>
        <SelectTrigger className="w-44 h-8 text-xs">
          <SelectValue placeholder="Semua Prodi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Prodi</SelectItem>
          {PRODI_LIST.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.type} onValueChange={handle("type")}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Semua Tipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Tipe</SelectItem>
          <SelectItem value="MOA">MoA</SelectItem>
          <SelectItem value="IA">IA</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.priority} onValueChange={handle("priority")}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Prioritas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Prioritas</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={handle("status")}>
        <SelectTrigger className="w-36 h-8 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Status</SelectItem>
          <SelectItem value="PENDING">Menunggu</SelectItem>
          <SelectItem value="FOLLOWED_UP">Ditindaklanjuti</SelectItem>
          <SelectItem value="COMPLETED">Selesai</SelectItem>
          <SelectItem value="DISMISSED">Diabaikan</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.sort} onValueChange={handle("sort")}>
        <SelectTrigger className="w-36 h-8 text-xs">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Terbaru</SelectItem>
          <SelectItem value="priority">Prioritas</SelectItem>
          <SelectItem value="impact">Dampak</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
