import { NextRequest, NextResponse } from "next/server"
import { validateApiSession, validateApiSessionWithUser } from "@/lib/api-auth"
import { prisma } from "@/lib/db"
import { generateRecommendationsForDocument } from "@/lib/recommendations"
import { addYears } from "date-fns"

export async function GET(req: NextRequest) {
  const { error } = await validateApiSession()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const prodiName = searchParams.get("prodiName")
  const type = searchParams.get("type")
  const status = searchParams.get("status")

  const where: any = {}
  if (prodiName) where.prodiName = prodiName
  if (type) where.type = type
  if (status) where.status = status

  const documents = await prisma.document.findMany({
    where,
    include: {
      uploadedBy: { select: { id: true, name: true, email: true, image: true } },
      recommendations: { select: { id: true, status: true } },
      mouChildren: { select: { id: true, type: true, title: true } },
      moaChildren: { select: { id: true, type: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(documents)
}

export async function POST(req: NextRequest) {
  const { error, user } = await validateApiSessionWithUser()
  if (error) return error

  try {
    const body = await req.json()
    const {
      prodiName, type, title, partnerName, partnerType, sector,
      signedDate, fileUrl, fileName, validityYears, mouId, moaId,
      extractedText, aiSummary, cooperationField, notes,
    } = body

    const signed = new Date(signedDate)
    const expiry = addYears(signed, validityYears || 2)

    const document = await prisma.document.create({
      data: {
        prodiName,
        type,
        title,
        partnerName,
        partnerType,
        sector,
        signedDate: signed,
        fileUrl,
        fileName,
        status: "ACTIVE",
        validityYears: validityYears || 2,
        expiryDate: expiry,
        mouId: mouId || null,
        moaId: moaId || null,
        extractedText: extractedText || "",
        aiSummary: aiSummary || "",
        cooperationField: cooperationField || "",
        notes: notes || null,
        uploadedById: user!.id,
      },
    })

    await prisma.activityLog.create({
      data: {
        userId: user!.id,
        action: "UPLOAD_DOCUMENT",
        description: `Uploaded ${type} document: ${title}`,
        metadata: JSON.stringify({ documentId: document.id, type, prodiName }),
      },
    })

    let recommendationCount = 0
    if (type === "MOU") {
      const result = await generateRecommendationsForDocument(document.id, user!.id)
      recommendationCount = result.count
    }

    return NextResponse.json({ document, recommendationCount }, { status: 201 })
  } catch (err) {
    console.error("Create document error:", err)
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
  }
}
