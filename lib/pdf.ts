import fs from "fs"
import path from "path"
import os from "os"

function getUploadDir(): string {
  // Vercel & serverless: hanya /tmp yang writable
  // Local dev: ./public/uploads
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), "simkera-uploads")
  }
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads")
}

export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse.js")
    const data = await pdfParse(dataBuffer, { max: 0 })
    return (data.text as string) || ""
  } catch {
    return ""
  }
}

export function readPDFAsBase64(filePath: string): string {
  return fs.readFileSync(filePath).toString("base64")
}

export async function savePDFFile(
  buffer: Buffer,
  originalName: string
): Promise<{ fileUrl: string; fileName: string; filePath: string }> {
  const uploadDir = getUploadDir()

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const timestamp = Date.now()
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_")
  const fileName = `${timestamp}_${safeName}`
  const filePath = path.join(uploadDir, fileName)

  fs.writeFileSync(filePath, buffer)

  // fileUrl hanya untuk referensi — di production file bersifat sementara
  const fileUrl = process.env.VERCEL || process.env.NODE_ENV === "production"
    ? `/tmp/${fileName}`
    : `/uploads/${fileName}`

  return { fileUrl, fileName, filePath }
}
