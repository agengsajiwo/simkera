import { NextRequest, NextResponse } from "next/server"
import { validateApiSession } from "@/lib/api-auth"
import { prisma } from "@/lib/db"
import { slugToProdi } from "@/lib/prodi-context"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { error } = await validateApiSession()
  if (error) return error

  const { slug } = await params
  const prodiName = slugToProdi(slug)
  if (!prodiName) {
    return NextResponse.json({ error: "Prodi not found" }, { status: 404 })
  }

  const documents = await prisma.document.findMany({
    where: { prodiName },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true, image: true } },
      recommendations: { select: { id: true, status: true, type: true } },
      mouChildren: { select: { id: true, type: true, title: true, status: true } },
      moaChildren: { select: { id: true, type: true, title: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ prodiName, documents })
}
