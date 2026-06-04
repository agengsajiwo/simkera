"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RecommendationCard } from "./RecommendationCard"

interface Rec {
  id: string
  type: string
  recommendedTitle: string
  theme: string
  topicSuggestions: string
  impactAreas: string
  impactLevel: string
  rationale: string
  draftScope: string
  targetBeneficiary: string
  estimatedDuration: string
  exampleActivities: string
  priority: string
  status: string
  prodiName: string
  createdAt: string | Date
  sourceDocument?: { id: string; title: string; partnerName: string }
}

interface RecommendationListProps {
  initialRecs: Rec[]
  title?: string
}

export function RecommendationList({ initialRecs, title = "Rekomendasi AI" }: RecommendationListProps) {
  const router = useRouter()
  const [recs, setRecs] = useState<Rec[]>(initialRecs)

  const handleStatusChange = (id: string, newStatus: string) => {
    setRecs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    )
    // Refresh server-side data juga agar konsisten
    router.refresh()
  }

  if (recs.length === 0) return null

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
        🤖 {title}
        <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {recs.length} rekomendasi
        </span>
      </h2>
      <div className="space-y-4">
        {recs.map((rec) => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  )
}
