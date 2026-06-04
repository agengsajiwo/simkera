import { NextRequest, NextResponse } from "next/server"
import { validateApiSession } from "@/lib/api-auth"
import { savePDFFile, extractTextFromPDF, readPDFAsBase64 } from "@/lib/pdf"
import { extractDocumentInfo, extractDocumentInfoFromPDF } from "@/lib/ai"

export async function POST(req: NextRequest) {
  const { error } = await validateApiSession()
  if (error) return error

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { fileUrl, fileName, filePath } = await savePDFFile(buffer, file.name)

    // Coba ekstrak teks dari PDF (untuk PDF dengan text layer)
    const extractedText = await extractTextFromPDF(filePath)
    const isScanned = !extractedText || extractedText.trim().length < 100

    let docInfo
    if (isScanned) {
      // PDF scanned / gambar — kirim langsung ke Claude Vision
      console.log("PDF scanned terdeteksi, menggunakan Claude Vision API...")
      const pdfBase64 = readPDFAsBase64(filePath)
      docInfo = await extractDocumentInfoFromPDF(pdfBase64)
    } else {
      // PDF dengan text layer — gunakan teks yang sudah diekstrak
      docInfo = await extractDocumentInfo(extractedText)
    }

    return NextResponse.json({
      fileUrl,
      fileName,
      extractedText: isScanned ? "[PDF Scanned — dibaca via Claude Vision]" : extractedText.substring(0, 5000),
      isScanned,
      ...docInfo,
    })
  } catch (err: any) {
    console.error("Extract error:", err)
    const msg = err?.error?.error?.message || err?.message || "Failed to process document"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
