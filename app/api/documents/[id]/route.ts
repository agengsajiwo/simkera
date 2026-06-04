import { NextRequest, NextResponse } from "next/server"
import { validateApiSession, validateApiSessionWithUser } from "@/lib/api-auth"
import { prisma } from "@/lib/db"
import fs from "fs"
import path from "path"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await validateApiSession()
  if (error) return error

  const { id } = await params

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true, image: true } },
      recommendations: true,
      parentMou: { select: { id: true, title: true, partnerName: true } },
      parentMoa: { select: { id: true, title: true, partnerName: true } },
      mouChildren: { select: { id: true, type: true, title: true, partnerName: true, status: true } },
      moaChildren: { select: { id: true, type: true, title: true, partnerName: true, status: true } },
    },
  })

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  return NextResponse.json(document)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await validateApiSessionWithUser()
  if (error) return error

  const { id } = await params

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      mouChildren: { select: { id: true } },
      moaChildren: { select: { id: true } },
    },
  })

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  // Cek apakah dokumen punya turunan
  const childCount = document.mouChildren.length + document.moaChildren.length
  if (childCount > 0) {
    return NextResponse.json(
      {
        error: `Dokumen ini memiliki ${childCount} dokumen turunan (MoA/IA). Hapus dokumen turunan terlebih dahulu.`,
        childCount,
      },
      { status: 409 }
    )
  }

  // Hapus rekomendasi terkait dulu
  await prisma.recommendation.deleteMany({ where: { sourceDocumentId: id } })

  // Hapus file PDF jika ada
  try {
    const uploadDir = process.env.UPLOAD_DIR || "./public/uploads"
    const filePath = path.join(uploadDir, document.fileName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch {
    // File tidak ada, lanjut
  }

  // Log aktivitas sebelum hapus
  await prisma.activityLog.create({
    data: {
      userId: user!.id,
      action: "DELETE_DOCUMENT",
      description: `Deleted ${document.type} document: ${document.title}`,
      metadata: JSON.stringify({ documentId: id, type: document.type, prodiName: document.prodiName }),
    },
  })

  // Hapus dokumen
  await prisma.document.delete({ where: { id } })

  return NextResponse.json({ success: true, deletedId: id })
}
