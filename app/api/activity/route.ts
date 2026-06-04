import { NextRequest, NextResponse } from "next/server"
import { validateApiSession } from "@/lib/api-auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { error } = await validateApiSession()
  if (error) return error

  const logs = await prisma.activityLog.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, image: true } },
    },
  })

  return NextResponse.json(logs)
}
