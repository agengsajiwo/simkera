import fs from "fs"
import path from "path"

export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    // Gunakan options render_page: false agar tidak butuh canvas/DOMMatrix
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
  const uploadDir = process.env.UPLOAD_DIR || "./public/uploads"
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const timestamp = Date.now()
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_")
  const fileName = `${timestamp}_${safeName}`
  const filePath = path.join(uploadDir, fileName)

  fs.writeFileSync(filePath, buffer)

  return { fileUrl: `/uploads/${fileName}`, fileName, filePath }
}
