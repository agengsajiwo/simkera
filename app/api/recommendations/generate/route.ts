import { NextRequest, NextResponse } from "next/server"
import { validateApiSessionWithUser } from "@/lib/api-auth"
import { generateRecommendationsForDocument } from "@/lib/recommendations"

export async function POST(req: NextRequest) {
  const { error, user } = await validateApiSessionWithUser()
  if (error) return error

  const { documentId } = await req.json()
  if (!documentId) {
    return NextResponse.json({ error: "documentId required" }, { status: 400 })
  }

  const result = await generateRecommendationsForDocument(documentId, user!.id)
  return NextResponse.json(result)
}
