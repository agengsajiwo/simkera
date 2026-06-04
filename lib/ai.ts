import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = "claude-sonnet-4-5"

const EXTRACT_SYSTEM =
  "Kamu adalah sistem ekstraksi informasi dokumen kerja sama akademik Indonesia yang sangat akurat. Tugasmu hanya mengekstrak informasi dari teks/gambar dokumen dan mengembalikan JSON valid. Jangan menambahkan informasi yang tidak ada di dokumen."

const EXTRACT_PROMPT = `Ekstrak informasi dari dokumen kerja sama berikut dan kembalikan HANYA JSON valid tanpa markdown, tanpa penjelasan:

FORMAT JSON yang harus dikembalikan:
{
  "title": "judul resmi dokumen",
  "partnerName": "nama lengkap institusi/perusahaan mitra",
  "partnerType": "DUDI atau UNIVERSITAS",
  "signedDate": "YYYY-MM-DD format tanggal penandatanganan dari dokumen",
  "sector": "salah satu dari: Pendidikan, Teknologi, Kesehatan, Pertanian, Industri, Keuangan, Hukum, Sosial, Keagamaan, Pariwisata, Energi, Penelitian",
  "cooperationField": "deskripsi singkat bidang kerja sama 1-2 kalimat",
  "validityYears": 2,
  "summary": "ringkasan dokumen 2-3 kalimat dalam bahasa Indonesia"
}`

export interface ExtractedDocumentInfo {
  title: string
  partnerName: string
  partnerType: "DUDI" | "UNIVERSITAS"
  signedDate: string
  sector: string
  cooperationField: string
  validityYears: number
  summary: string
}

function parseExtractedJSON(text: string): ExtractedDocumentInfo {
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      title: "Dokumen Kerja Sama",
      partnerName: "Tidak Diketahui",
      partnerType: "DUDI",
      signedDate: new Date().toISOString().split("T")[0],
      sector: "Pendidikan",
      cooperationField: "Kerja sama umum",
      validityYears: 2,
      summary: text.substring(0, 300),
    }
  }
}

/** Ekstrak info dari teks (PDF biasa dengan text layer) */
export async function extractDocumentInfo(
  extractedText: string
): Promise<ExtractedDocumentInfo> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: EXTRACT_SYSTEM,
    messages: [
      {
        role: "user",
        content: `${EXTRACT_PROMPT}\n\nTEKS DOKUMEN:\n${extractedText}`,
      },
    ],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  return parseExtractedJSON(text)
}

/** Ekstrak info dari PDF scanned menggunakan Claude Vision (base64 PDF) */
export async function extractDocumentInfoFromPDF(
  pdfBase64: string
): Promise<ExtractedDocumentInfo> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: EXTRACT_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          } as any,
          {
            type: "text",
            text: EXTRACT_PROMPT,
          },
        ],
      },
    ],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  return parseExtractedJSON(text)
}

export interface RecommendationItem {
  type: "MOA" | "IA"
  recommendedTitle: string
  theme: string
  topicSuggestions: string[]
  impactAreas: string[]
  impactLevel: "HIGH" | "MEDIUM" | "LOW"
  rationale: string
  draftScope: string
  targetBeneficiary: string
  estimatedDuration: string
  exampleActivities: string[]
  priority: "HIGH" | "MEDIUM" | "LOW"
}

export async function generateRecommendationsAI(params: {
  partnerName: string
  partnerType: string
  cooperationField: string
  sector: string
  prodiName: string
  aiSummary: string
  prodiContext: string
}): Promise<RecommendationItem[]> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: `Kamu adalah konsultan pengembangan kerja sama institusi pendidikan tinggi Indonesia yang berpengalaman 15 tahun. Kamu memahami secara mendalam: Tridharma Perguruan Tinggi (Pendidikan, Penelitian, Pengabdian Masyarakat), program MBKM (Merdeka Belajar Kampus Merdeka), standar akreditasi BAN-PT dan LAM, kebutuhan link and match kampus-industri, dan karakteristik masing-masing bidang ilmu. Rekomendasimu selalu substantif, berdampak nyata, dan dapat dieksekusi.`,
    messages: [
      {
        role: "user",
        content: `Analisis dokumen MoU berikut dan hasilkan rekomendasi kerja sama lanjutan yang berdampak.

INFORMASI DOKUMEN MoU:
- Nama Mitra: ${params.partnerName}
- Tipe Mitra: ${params.partnerType}
- Bidang Kerja Sama: ${params.cooperationField}
- Sektor: ${params.sector}
- Program Studi: ${params.prodiName}
- Ringkasan MoU: ${params.aiSummary}

KONTEKS PROGRAM STUDI ${params.prodiName}:
${params.prodiContext}

TUGAS: Hasilkan TEPAT 3 rekomendasi MoA dan 2 rekomendasi IA.

PANDUAN REKOMENDASI:

Jika mitra DUDI:
- MoA themes: magang terstruktur MBKM, kurikulum berbasis industri, rekrutmen alumni, penelitian terapan, sertifikasi kompetensi, praktisi mengajar
- IA themes: program magang 1 semester, workshop bersertifikat, joint research project, pengabdian berbasis solusi industri, kompetisi mahasiswa

Jika mitra UNIVERSITAS:
- MoA themes: pertukaran mahasiswa, kolaborasi penelitian, joint/dual degree, sharing fasilitas akademik, pengembangan kapasitas dosen
- IA themes: student exchange semester, joint seminar/konferensi, co-authorship penelitian jurnal terindeks, KKN/PKL bersama, pengembangan buku ajar

Kembalikan HANYA JSON array valid tanpa markdown:
[
  {
    "type": "MOA",
    "recommendedTitle": "judul MoA yang spesifik dan profesional",
    "theme": "tema utama kerja sama",
    "topicSuggestions": ["topik spesifik 1", "topik spesifik 2", "topik spesifik 3"],
    "impactAreas": ["dampak konkret 1", "dampak konkret 2"],
    "impactLevel": "HIGH",
    "rationale": "alasan mengapa rekomendasi ini relevan dan penting untuk prodi dan mitra ini, 2-3 kalimat",
    "draftScope": "ruang lingkup konkret yang akan dicakup MoA ini",
    "targetBeneficiary": "Mahasiswa / Dosen / Institusi / Mahasiswa & Dosen",
    "estimatedDuration": "1 tahun / 2 tahun / 3 tahun",
    "exampleActivities": ["aktivitas konkret 1", "aktivitas konkret 2", "aktivitas konkret 3"],
    "priority": "HIGH"
  }
]`,
      },
    ],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : "[]"

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}
