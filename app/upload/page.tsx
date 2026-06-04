"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PRODI_LIST } from "@/lib/prodi-context"
import { Upload, FileText, CheckCircle, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react"

const DOC_TYPES = ["MOU", "MOA", "IA"]
const SECTORS = ["Pendidikan", "Teknologi", "Kesehatan", "Pertanian", "Industri", "Keuangan", "Hukum", "Sosial", "Keagamaan", "Pariwisata", "Energi", "Penelitian"]
const VALIDITY_OPTIONS = [1, 2, 3, 4, 5]

interface ExtractedData {
  fileUrl: string
  fileName: string
  extractedText: string
  title: string
  partnerName: string
  partnerType: string
  signedDate: string
  sector: string
  cooperationField: string
  validityYears: number
  summary: string
}

export default function UploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [prodiName, setProdiName] = useState("")
  const [docType, setDocType] = useState("MOU")
  const [mouParentId, setMouParentId] = useState("")
  const [moaParentId, setMoaParentId] = useState("")
  const [parentDocs, setParentDocs] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractStep, setExtractStep] = useState(0)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [form, setForm] = useState<Partial<ExtractedData>>({})
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  if (status === "loading") return null

  const handleProdiChange = async (prodi: string | null) => {
    if (!prodi) return
    setProdiName(prodi)
    const res = await fetch(`/api/prodi/${prodi.toLowerCase().replace(/\s+/g, "-")}/documents`)
    if (res.ok) {
      const data = await res.json()
      setParentDocs(data.documents || [])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && f.type === "application/pdf") {
      setFile(f)
      setError("")
    } else if (f) {
      setError("Hanya file PDF yang diizinkan")
    }
  }

  const handleExtract = async () => {
    if (!file) return
    setExtracting(true)
    setExtractStep(1)
    setError("")

    try {
      const fd = new FormData()
      fd.append("file", file)

      setTimeout(() => setExtractStep(2), 800)
      const res = await fetch("/api/documents/extract", { method: "POST", body: fd })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal mengekstrak dokumen")
      }

      setExtractStep(3)
      const data: ExtractedData = await res.json()
      setExtracted(data)
      setForm({
        ...data,
        validityYears: data.validityYears || 2,
      })
      setTimeout(() => {
        setExtracting(false)
        setStep(3)
      }, 800)
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
      setExtracting(false)
      setExtractStep(0)
    }
  }

  const handleSave = async () => {
    if (!form.title || !form.partnerName) {
      setError("Judul dan nama mitra harus diisi")
      return
    }
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prodiName,
          type: docType,
          title: form.title,
          partnerName: form.partnerName,
          partnerType: form.partnerType || "DUDI",
          sector: form.sector || "Pendidikan",
          signedDate: form.signedDate || new Date().toISOString().split("T")[0],
          fileUrl: extracted?.fileUrl || "",
          fileName: extracted?.fileName || "",
          validityYears: form.validityYears || 2,
          mouId: mouParentId || null,
          moaId: moaParentId || null,
          extractedText: extracted?.extractedText || "",
          aiSummary: form.summary || "",
          cooperationField: form.cooperationField || "",
          notes: (form as any).notes || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal menyimpan dokumen")
      }

      const data = await res.json()
      setResult(data)
      setStep(4)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const mouList = parentDocs.filter((d) => d.type === "MOU")
  const moaList = parentDocs.filter((d) => d.type === "MOA")

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar session={session as any} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Upload Dokumen Kerja Sama</h1>
          <p className="text-gray-500 text-sm mt-1">Unggah dokumen MoU, MoA, atau IA program studi</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                s < step ? "bg-green-500 text-white" :
                s === step ? "bg-[#1e3a5f] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {s < step ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 4 && <div className={`h-0.5 w-12 ${s < step ? "bg-green-400" : "bg-gray-200"}`} />}
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-500">Langkah {step} dari 4</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pilih Program Studi &amp; Jenis Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Program Studi *</Label>
                <Select value={prodiName} onValueChange={handleProdiChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih program studi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODI_LIST.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Jenis Dokumen *</Label>
                <div className="flex gap-3 mt-2">
                  {DOC_TYPES.map((t) => (
                    <button key={t} onClick={() => setDocType(t)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        docType === t ? "border-[#2563eb] bg-blue-50 text-[#2563eb]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {(docType === "MOA" || docType === "IA") && mouList.length > 0 && (
                <div>
                  <Label>MoU Induk</Label>
                  <Select value={mouParentId} onValueChange={(v) => setMouParentId(v ?? "")}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih MoU induk (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {mouList.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {docType === "IA" && moaList.length > 0 && (
                <div>
                  <Label>MoA Induk</Label>
                  <Select value={moaParentId} onValueChange={(v) => setMoaParentId(v ?? "")}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih MoA induk (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {moaList.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button className="w-full bg-[#1e3a5f] hover:bg-[#2d4f7c]" onClick={() => setStep(2)}
                disabled={!prodiName}>
                Lanjut <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upload Dokumen PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                  file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-[#2563eb] hover:bg-blue-50"
                }`}>
                <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                {file ? (
                  <div>
                    <FileText className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-700">{file.name}</p>
                    <p className="text-sm text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Klik atau seret file PDF ke sini</p>
                    <p className="text-sm text-gray-400 mt-1">Maks. 10MB • Format PDF saja</p>
                  </div>
                )}
              </div>

              {extracting && (
                <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                  {[
                    "📄 Mengekstrak teks dokumen...",
                    "🤖 Menganalisis dengan AI Claude...",
                    "✅ Ekstraksi selesai!",
                  ].map((msg, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm ${extractStep > i ? "text-green-700" : extractStep === i + 1 ? "text-blue-700 font-medium" : "text-gray-400"}`}>
                      {extractStep > i && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {extractStep === i + 1 && <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                      {extractStep <= i && <div className="h-4 w-4" />}
                      {msg}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} disabled={extracting}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
                </Button>
                <Button className="flex-1 bg-[#1e3a5f] hover:bg-[#2d4f7c]" onClick={handleExtract}
                  disabled={!file || extracting}>
                  {extracting ? "Memproses..." : "Analisis Dokumen"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verifikasi Data Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                ⚠️ Data diekstrak otomatis oleh AI. Mohon periksa dan koreksi jika diperlukan.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Judul Dokumen *</Label>
                  <Input className="mt-1" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label>Nama Mitra *</Label>
                  <Input className="mt-1" value={form.partnerName || ""} onChange={(e) => setForm({ ...form, partnerName: e.target.value })} />
                </div>
                <div>
                  <Label>Tipe Mitra</Label>
                  <Select value={form.partnerType || "DUDI"} onValueChange={(v) => setForm({ ...form, partnerType: v ?? "DUDI" })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DUDI">DUDI</SelectItem>
                      <SelectItem value="UNIVERSITAS">Universitas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sektor</Label>
                  <Select value={form.sector || "Pendidikan"} onValueChange={(v) => setForm({ ...form, sector: v ?? "Pendidikan" })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tanggal Penandatanganan</Label>
                  <Input type="date" className="mt-1" value={form.signedDate || ""} onChange={(e) => setForm({ ...form, signedDate: e.target.value })} />
                </div>
                <div>
                  <Label>Masa Berlaku (Tahun)</Label>
                  <Select value={String(form.validityYears || 2)} onValueChange={(v) => setForm({ ...form, validityYears: parseInt(v ?? "2") })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALIDITY_OPTIONS.map((y) => <SelectItem key={y} value={String(y)}>{y} Tahun</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Bidang Kerja Sama</Label>
                  <Input className="mt-1" value={form.cooperationField || ""} onChange={(e) => setForm({ ...form, cooperationField: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Ringkasan AI</Label>
                  <Textarea className="mt-1 h-24" value={form.summary || ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Catatan (Opsional)</Label>
                  <Textarea className="mt-1 h-16" value={(form as any).notes || ""} onChange={(e) => setForm({ ...form, ...{ notes: e.target.value } })} />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
                Diupload oleh: {session?.user?.name} ({session?.user?.email})
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
                </Button>
                <Button className="flex-1 bg-[#1e3a5f] hover:bg-[#2d4f7c]" onClick={handleSave} disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Dokumen"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 */}
        {step === 4 && result && (
          <Card className="border-green-200">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Dokumen Berhasil Disimpan!</h2>
              <p className="text-gray-500 mb-4">
                {result.recommendationCount > 0
                  ? `${result.recommendationCount} rekomendasi baru telah digenerate oleh AI.`
                  : "Dokumen berhasil ditambahkan ke sistem."}
              </p>

              <div className="p-4 bg-gray-50 rounded-lg text-left mb-6 text-sm">
                <p className="font-semibold text-gray-700 mb-1">{result.document.title}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">{result.document.type}</Badge>
                  <Badge variant="outline" className="text-xs">{result.document.prodiName}</Badge>
                  <Badge variant="outline" className="text-xs">{result.document.partnerName}</Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setStep(1); setFile(null); setExtracted(null); setForm({}); setResult(null); }}>
                  Upload Lagi
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>
                  Lihat Rekomendasi
                </Button>
                <Button className="flex-1 bg-[#1e3a5f] hover:bg-[#2d4f7c]" onClick={() => router.push(`/documents/${result.document.id}`)}>
                  Lihat Dokumen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
