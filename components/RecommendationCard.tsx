"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DocumentTypeBadge } from "./DocumentTypeBadge"
import { parseJsonArray, formatDate } from "@/lib/utils"
import {
  Target, Lightbulb, ClipboardList, Users, Clock,
  ExternalLink, ChevronDown, ChevronUp, CheckCircle2,
  RefreshCcw, Ban, Loader2,
} from "lucide-react"
import Link from "next/link"

interface RecommendationCardProps {
  rec: {
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
  onStatusChange?: (id: string, status: string) => void
}

const PRIORITY_STYLE: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  LOW: "bg-gray-100 text-gray-600 border-gray-200",
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  FOLLOWED_UP: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  DISMISSED: "bg-gray-50 text-gray-500 border-gray-200",
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  FOLLOWED_UP: "Ditindaklanjuti",
  COMPLETED: "Selesai",
  DISMISSED: "Diabaikan",
}

export function RecommendationCard({ rec, onStatusChange }: RecommendationCardProps) {
  const [status, setStatus] = useState(rec.status)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const topics = parseJsonArray(rec.topicSuggestions)
  const impacts = parseJsonArray(rec.impactAreas)
  const activities = parseJsonArray(rec.exampleActivities)

  const updateStatus = async (newStatus: string) => {
    if (loading || status === newStatus) return
    setLoading(true)
    try {
      const res = await fetch(`/api/recommendations/${rec.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setStatus(newStatus)
        onStatusChange?.(rec.id, newStatus)
      }
    } catch (e) {
      console.error("Failed to update status:", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={`border transition-colors ${status === "DISMISSED" ? "opacity-60 border-gray-200" : status === "COMPLETED" ? "border-green-200" : "border-gray-200 hover:border-gray-300"}`}>
      <CardContent className="p-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <DocumentTypeBadge type={rec.type} />
            <Badge variant="outline" className={`text-xs ${PRIORITY_STYLE[rec.priority]}`}>
              {rec.priority}
            </Badge>
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">
              {rec.prodiName}
            </Badge>
            <Badge variant="outline" className={`text-xs ${STATUS_STYLE[status]}`}>
              {STATUS_LABEL[status] ?? status}
            </Badge>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
            {formatDate(rec.createdAt)}
          </span>
        </div>

        {/* Title & source */}
        <h3 className="font-semibold text-gray-800 text-sm mb-1 leading-snug">
          📋 {rec.recommendedTitle}
        </h3>
        {rec.sourceDocument && (
          <p className="text-xs text-gray-500 mb-3">
            🏢 Dari: <span className="font-medium">{rec.sourceDocument.partnerName}</span>
          </p>
        )}

        {/* Theme */}
        <div className="flex items-start gap-1.5 mb-3">
          <Target className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600"><span className="font-medium">Tema:</span> {rec.theme}</p>
        </div>

        {/* Rationale */}
        <div className="p-3 bg-blue-50 rounded-lg mb-3">
          <p className="text-xs font-semibold text-blue-800 flex items-center gap-1 mb-1">
            <Lightbulb className="h-3.5 w-3.5" /> Mengapa ini penting
          </p>
          <p className="text-xs text-blue-700 leading-relaxed">{rec.rationale}</p>
        </div>

        {/* Topics */}
        {topics.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1.5">
              <ClipboardList className="h-3.5 w-3.5" /> Topik yang Bisa Dikerjakan
            </p>
            <ul className="space-y-0.5">
              {topics.map((t, i) => (
                <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                  <span className="text-gray-300 mt-0.5">•</span>{t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expanded detail */}
        {expanded && (
          <div className="space-y-3 mt-3 pt-3 border-t border-dashed">
            {activities.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1.5">✨ Contoh Aktivitas Nyata</p>
                <ul className="space-y-0.5">
                  {activities.map((a, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                      <span className="text-gray-300 mt-0.5">•</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">📋 Ruang Lingkup</p>
              <p className="text-xs text-gray-600 leading-relaxed">{rec.draftScope}</p>
            </div>
            {impacts.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1.5">🎯 Dampak</p>
                <div className="flex flex-wrap gap-1.5">
                  {impacts.map((imp, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      {imp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {rec.targetBeneficiary}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {rec.estimatedDuration}
              </span>
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t">
          {/* Status actions */}
          <div className="flex gap-2 flex-wrap">
            {status === "PENDING" && (
              <>
                <Button size="sm" variant="outline"
                  className="h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                  disabled={loading} onClick={() => updateStatus("FOLLOWED_UP")}>
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
                  Follow Up
                </Button>
                <Button size="sm" variant="outline"
                  className="h-7 text-xs gap-1 border-green-200 text-green-700 hover:bg-green-50"
                  disabled={loading} onClick={() => updateStatus("COMPLETED")}>
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  Selesai
                </Button>
                <Button size="sm" variant="ghost"
                  className="h-7 text-xs gap-1 text-gray-400 hover:text-gray-600"
                  disabled={loading} onClick={() => updateStatus("DISMISSED")}>
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
                  Abaikan
                </Button>
              </>
            )}
            {status === "FOLLOWED_UP" && (
              <>
                <Button size="sm" variant="outline"
                  className="h-7 text-xs gap-1 border-green-200 text-green-700 hover:bg-green-50"
                  disabled={loading} onClick={() => updateStatus("COMPLETED")}>
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  Tandai Selesai
                </Button>
                <Button size="sm" variant="ghost"
                  className="h-7 text-xs text-gray-400 hover:text-gray-600"
                  disabled={loading} onClick={() => updateStatus("PENDING")}>
                  Reset
                </Button>
              </>
            )}
            {(status === "COMPLETED" || status === "DISMISSED") && (
              <Button size="sm" variant="ghost"
                className="h-7 text-xs gap-1 text-gray-500 hover:text-gray-700"
                disabled={loading} onClick={() => updateStatus("PENDING")}>
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
                Buka Kembali
              </Button>
            )}
          </div>

          {/* Right side */}
          <div className="flex gap-1.5">
            {rec.sourceDocument && (
              <Link href={`/documents/${rec.sourceDocument.id}`}>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-gray-500">
                  <ExternalLink className="h-3 w-3" /> Dokumen Induk
                </Button>
              </Link>
            )}
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-gray-500"
              onClick={() => setExpanded(!expanded)}>
              {expanded
                ? <><ChevronUp className="h-3 w-3" />Ringkas</>
                : <><ChevronDown className="h-3 w-3" />Detail</>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
