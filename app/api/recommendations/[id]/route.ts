import { NextRequest, NextResponse } from "next/server"
import { validateApiSessionWithUser } from "@/lib/api-auth"
import { prisma } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await validateApiSessionWithUser()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const { status } = body

  const validStatuses = ["PENDING", "FOLLOWED_UP", "COMPLETED", "DISMISSED"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const recommendation = await prisma.recommendation.update({
    where: { id },
    data: { status },
  })

  await prisma.activityLog.create({
    data: {
      userId: user!.id,
      action: "UPDATE_RECOMMENDATION",
      description: `Updated recommendation status to ${status}: ${recommendation.recommendedTitle}`,
      metadata: JSON.stringify({ recommendationId: id, status }),
    },
  })

  return NextResponse.json(recommendation)
}
