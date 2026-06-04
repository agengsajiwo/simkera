import { NextRequest, NextResponse } from "next/server"
import { validateApiSession } from "@/lib/api-auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { error } = await validateApiSession()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const prodiName = searchParams.get("prodiName")
  const type = searchParams.get("type")
  const priority = searchParams.get("priority")
  const status = searchParams.get("status")
  const beneficiary = searchParams.get("beneficiary")
  const sort = searchParams.get("sort") || "createdAt"

  const where: any = {}
  if (prodiName) where.prodiName = prodiName
  if (type && type !== "ALL") where.type = type
  if (priority && priority !== "ALL") where.priority = priority
  if (status && status !== "ALL") where.status = status
  if (beneficiary && beneficiary !== "ALL") where.targetBeneficiary = { contains: beneficiary }

  const orderBy: any =
    sort === "priority"
      ? [{ priority: "asc" }, { createdAt: "desc" }]
      : sort === "impact"
      ? [{ impactLevel: "asc" }, { createdAt: "desc" }]
      : { createdAt: "desc" }

  const recommendations = await prisma.recommendation.findMany({
    where,
    include: {
      sourceDocument: {
        select: { id: true, title: true, partnerName: true, type: true },
      },
    },
    orderBy,
  })

  return NextResponse.json(recommendations)
}
