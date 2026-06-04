import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { addYears } from "date-fns"

const adapter = new PrismaLibSql({ url: "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // System seed user
  const systemUser = await prisma.user.upsert({
    where: { email: "system@unu-jogja.ac.id" },
    update: {},
    create: {
      email: "system@unu-jogja.ac.id",
      name: "System Seed",
      role: "ADMIN",
    },
  })

  console.log("Created system user:", systemUser.email)

  const createDoc = async (data: {
    prodiName: string
    type: string
    title: string
    partnerName: string
    partnerType: string
    sector: string
    signedDate: Date
    validityYears?: number
    mouId?: string
    moaId?: string
    cooperationField: string
    aiSummary: string
  }) => {
    const validityYears = data.validityYears || 2
    const expiryDate = addYears(data.signedDate, validityYears)
    return prisma.document.create({
      data: {
        prodiName: data.prodiName,
        type: data.type,
        title: data.title,
        partnerName: data.partnerName,
        partnerType: data.partnerType,
        sector: data.sector,
        signedDate: data.signedDate,
        expiryDate,
        fileUrl: "/uploads/sample.pdf",
        fileName: "sample.pdf",
        status: "ACTIVE",
        validityYears,
        mouId: data.mouId || null,
        moaId: data.moaId || null,
        extractedText: "Dokumen kerja sama antara UNU Yogyakarta dengan " + data.partnerName,
        aiSummary: data.aiSummary,
        cooperationField: data.cooperationField,
        uploadedById: systemUser.id,
      },
    })
  }

  // 1. MoU Informatika - Gojek
  const mou1 = await createDoc({
    prodiName: "Informatika",
    type: "MOU",
    title: "Nota Kesepahaman Kerja Sama Bidang Teknologi dan Inovasi Digital",
    partnerName: "PT. Gojek Indonesia",
    partnerType: "DUDI",
    sector: "Teknologi",
    signedDate: new Date("2024-01-15"),
    cooperationField: "Pengembangan sumber daya manusia di bidang teknologi dan inovasi digital, termasuk program magang, pelatihan, dan riset bersama.",
    aiSummary: "MoU antara Prodi Informatika UNU Yogyakarta dengan PT. Gojek Indonesia untuk kerja sama di bidang teknologi. Ruang lingkup meliputi program magang mahasiswa, pengembangan kurikulum berbasis industri, dan kolaborasi riset terapan bidang rekayasa perangkat lunak dan kecerdasan buatan.",
  })

  // 2. MoU Informatika - UGM
  const mou2 = await createDoc({
    prodiName: "Informatika",
    type: "MOU",
    title: "Perjanjian Kerja Sama Bidang Akademik dan Penelitian",
    partnerName: "Universitas Gadjah Mada",
    partnerType: "UNIVERSITAS",
    sector: "Pendidikan",
    signedDate: new Date("2024-03-20"),
    cooperationField: "Kolaborasi akademik dan penelitian bidang informatika, pertukaran mahasiswa, dan pengembangan bersama program pendidikan berbasis teknologi.",
    aiSummary: "MoU kerja sama akademik antara Prodi Informatika UNU Yogyakarta dengan Universitas Gadjah Mada. Mencakup pertukaran mahasiswa, kolaborasi penelitian ilmu komputer, pengembangan buku ajar, dan joint seminar ilmiah tahunan.",
  })

  // 3. MoA Informatika - Gojek (linked to MoU 1)
  const moa3 = await createDoc({
    prodiName: "Informatika",
    type: "MOA",
    title: "Perjanjian Kerja Sama Program Magang Terstruktur MBKM Prodi Informatika",
    partnerName: "PT. Gojek Indonesia",
    partnerType: "DUDI",
    sector: "Teknologi",
    signedDate: new Date("2024-04-10"),
    mouId: mou1.id,
    cooperationField: "Program magang terstruktur 1 semester bagi mahasiswa Informatika di PT. Gojek Indonesia, mencakup pengembangan software, data engineering, dan product management.",
    aiSummary: "MoA yang mengatur pelaksanaan program magang MBKM mahasiswa Informatika UNU Yogyakarta di PT. Gojek Indonesia. Mahasiswa ditempatkan di divisi Engineering, Data Science, dan Product selama 6 bulan dengan bimbingan mentor dari industri.",
  })

  // 4. IA Informatika - Gojek (linked to MoU 1 + MoA 3)
  await createDoc({
    prodiName: "Informatika",
    type: "IA",
    title: "Perjanjian Implementasi Program Magang Software Engineering Batch 1 - 2024",
    partnerName: "PT. Gojek Indonesia",
    partnerType: "DUDI",
    sector: "Teknologi",
    signedDate: new Date("2024-05-01"),
    mouId: mou1.id,
    moaId: moa3.id,
    cooperationField: "Implementasi konkret magang 10 mahasiswa Informatika angkatan 2021-2022 di Gojek pada divisi Backend Engineering dan Data Science selama Agustus-Desember 2024.",
    aiSummary: "IA yang mengatur teknis pelaksanaan magang batch pertama 10 mahasiswa Informatika UNU Yogyakarta di PT. Gojek Indonesia. Detail mencakup jadwal, pembiayaan, mekanisme penilaian, dan hak-kewajiban kedua pihak.",
  })

  // 5. MoU Manajemen - Bank Mandiri
  const mou5 = await createDoc({
    prodiName: "Manajemen",
    type: "MOU",
    title: "Nota Kesepahaman Kerja Sama Pengembangan SDM dan Pendidikan Keuangan",
    partnerName: "PT. Bank Mandiri (Persero) Tbk",
    partnerType: "DUDI",
    sector: "Keuangan",
    signedDate: new Date("2024-02-10"),
    cooperationField: "Kerja sama pengembangan sumber daya manusia di bidang perbankan dan keuangan, termasuk program magang, kuliah tamu praktisi, dan rekrutmen alumni.",
    aiSummary: "MoU antara Prodi Manajemen UNU Yogyakarta dengan PT. Bank Mandiri Tbk untuk mendukung pendidikan keuangan dan pengembangan kompetensi mahasiswa di sektor perbankan. Meliputi program magang, beasiswa, dan program praktisi mengajar.",
  })

  // 6. MoU Farmasi - RS Sardjito
  const mou6 = await createDoc({
    prodiName: "Farmasi",
    type: "MOU",
    title: "Nota Kesepahaman Kerja Sama Pendidikan dan Pelayanan Kefarmasian",
    partnerName: "RSUP Dr. Sardjito Yogyakarta",
    partnerType: "DUDI",
    sector: "Kesehatan",
    signedDate: new Date("2023-11-20"),
    cooperationField: "Kerja sama pendidikan profesi apoteker, praktik kerja profesi apoteker (PKPA), penelitian klinis, dan pelayanan kefarmasian berbasis rumah sakit.",
    aiSummary: "MoU antara Prodi Farmasi UNU Yogyakarta dengan RSUP Dr. Sardjito untuk penyelenggaraan Praktik Kerja Profesi Apoteker (PKPA) dan penelitian farmasi klinis. Mencakup penyediaan tempat praktik, pembimbing klinis, dan akses pasien untuk studi kasus.",
  })

  // 7. MoA Farmasi - RS Sardjito (linked to MoU 6)
  await createDoc({
    prodiName: "Farmasi",
    type: "MOA",
    title: "Perjanjian Kerja Sama Praktik Kerja Profesi Apoteker (PKPA) Prodi Farmasi",
    partnerName: "RSUP Dr. Sardjito Yogyakarta",
    partnerType: "DUDI",
    sector: "Kesehatan",
    signedDate: new Date("2024-01-05"),
    mouId: mou6.id,
    cooperationField: "Penyelenggaraan PKPA bagi mahasiswa Farmasi UNU Yogyakarta di RSUP Dr. Sardjito, mencakup rotasi di apotek rawat jalan, rawat inap, dan ICU.",
    aiSummary: "MoA pelaksanaan PKPA mahasiswa Farmasi UNU Yogyakarta di RSUP Dr. Sardjito. Mengatur kuota mahasiswa (max 10/semester), jadwal rotasi, sistem penilaian, dan pembayaran biaya supervisi kepada RS.",
  })

  // 8. MoU PGSD - Dinas Pendidikan
  await createDoc({
    prodiName: "PGSD",
    type: "MOU",
    title: "Nota Kesepahaman Kerja Sama Penyelenggaraan PPL dan Pengembangan Pendidikan Dasar",
    partnerName: "Dinas Pendidikan Kota Yogyakarta",
    partnerType: "DUDI",
    sector: "Pendidikan",
    signedDate: new Date("2024-06-01"),
    cooperationField: "Kerja sama penyelenggaraan Praktik Pengalaman Lapangan (PPL) mahasiswa PGSD dan pengembangan inovasi pendidikan dasar di sekolah-sekolah mitra.",
    aiSummary: "MoU antara PGSD UNU Yogyakarta dengan Dinas Pendidikan Kota Yogyakarta untuk mendukung penyelenggaraan PPL mahasiswa di SD-SD negeri Kota Yogyakarta. Membuka akses ke 25 SD mitra untuk praktik mengajar dan riset pendidikan dasar.",
  })

  // 9. MoU Akuntansi - KAP
  await createDoc({
    prodiName: "Akuntansi",
    type: "MOU",
    title: "Nota Kesepahaman Kerja Sama Bidang Akuntansi dan Audit Profesional",
    partnerName: "KAP Tanudiredja, Wibisana, Rintis & Rekan (PwC Indonesia)",
    partnerType: "DUDI",
    sector: "Keuangan",
    signedDate: new Date("2024-04-15"),
    cooperationField: "Kerja sama pengembangan kompetensi akuntansi dan auditing, program magang di Kantor Akuntan Publik, sertifikasi profesional, dan kuliah tamu oleh auditor senior.",
    aiSummary: "MoU antara Prodi Akuntansi UNU Yogyakarta dengan KAP Tanudiredja Wibisana (PwC Indonesia) untuk program magang audit, kuliah tamu praktisi CPA, dan jalur rekrutmen alumni ke firma audit Big 4. Mencakup program beasiswa bagi mahasiswa berprestasi.",
  })

  // 10. MoU Agribisnis - IPB
  await createDoc({
    prodiName: "Agribisnis",
    type: "MOU",
    title: "Perjanjian Kerja Sama Akademik dan Riset Bidang Agribisnis",
    partnerName: "Institut Pertanian Bogor (IPB University)",
    partnerType: "UNIVERSITAS",
    sector: "Pertanian",
    signedDate: new Date("2024-05-20"),
    cooperationField: "Kolaborasi riset dan akademik bidang agribisnis dan ekonomi pertanian, pertukaran mahasiswa, pengembangan kurikulum, dan joint publication ilmiah.",
    aiSummary: "MoU antara Prodi Agribisnis UNU Yogyakarta dengan IPB University untuk kolaborasi riset komoditas pangan strategis, pertukaran mahasiswa di program Agribisnis IPB, co-authorship artikel jurnal terakreditasi, dan pengembangan buku ajar agribisnis berbasis kearifan lokal.",
  })

  console.log("Created 10 seed documents")

  // Pre-seeded recommendations for MoU 1 (Gojek-Informatika)
  await prisma.recommendation.createMany({
    data: [
      {
        sourceDocumentId: mou1.id,
        prodiName: "Informatika",
        type: "MOA",
        recommendedTitle: "MoA Program Kurikulum Berbasis Industri Teknologi bersama PT. Gojek Indonesia",
        theme: "Kurikulum berbasis industri dan link-and-match",
        topicSuggestions: JSON.stringify(["Penyusunan mata kuliah Project-Based Learning berbasis tantangan nyata Gojek", "Pengembangan modul kecerdasan buatan dan machine learning sesuai kebutuhan industri", "Penyusunan capstone project dengan studi kasus produk Gojek"]),
        impactAreas: JSON.stringify(["Relevansi kurikulum dengan industri meningkat signifikan", "Lulusan lebih siap kerja di sektor teknologi"]),
        impactLevel: "HIGH",
        rationale: "Kerja sama kurikulum dengan Gojek akan memastikan mahasiswa Informatika mendapatkan pengalaman belajar berbasis permasalahan nyata industri teknologi terkemuka Indonesia. Hal ini langsung mendukung standar akreditasi BAN-PT terkait relevansi kurikulum.",
        draftScope: "Pengembangan 3-5 mata kuliah baru berbasis tantangan industri Gojek, melibatkan praktisi Gojek sebagai co-lecturer, dan penilaian akhir semester oleh panel industri.",
        targetBeneficiary: "Mahasiswa & Dosen",
        estimatedDuration: "2 tahun",
        exampleActivities: JSON.stringify(["Workshop perancangan kurikulum bersama CTO Gojek", "Guest lecture series oleh Software Engineer dan Data Scientist Gojek", "Capstone Project Challenge dengan produk Gojek sebagai case study"]),
        priority: "HIGH",
        status: "PENDING",
        aiGenerated: false,
      },
      {
        sourceDocumentId: mou1.id,
        prodiName: "Informatika",
        type: "MOA",
        recommendedTitle: "MoA Penelitian Terapan Kecerdasan Buatan dan Data Science bersama Gojek R&D",
        theme: "Penelitian terapan dan inovasi teknologi",
        topicSuggestions: JSON.stringify(["Riset sistem rekomendasi berbasis machine learning untuk platform ride-hailing", "Penelitian optimasi rute dan logistics menggunakan graph neural network", "Studi keamanan siber pada platform fintech Gopay"]),
        impactAreas: JSON.stringify(["Peningkatan publikasi ilmiah dosen dan mahasiswa", "Transfer pengetahuan teknologi mutakhir ke kampus"]),
        impactLevel: "HIGH",
        rationale: "Gojek memiliki tim R&D yang aktif mengembangkan teknologi AI untuk produknya. Kolaborasi penelitian ini akan membuka akses dataset nyata dan tantangan penelitian yang relevan bagi dosen dan mahasiswa Informatika.",
        draftScope: "Minimal 2 proyek riset bersama per tahun antara dosen Informatika UNU dan tim R&D Gojek, dengan target publikasi di jurnal terindeks Scopus atau konferensi IEEE.",
        targetBeneficiary: "Dosen",
        estimatedDuration: "2 tahun",
        exampleActivities: JSON.stringify(["Joint Research Grant antara UNU dan Gojek untuk proyek AI", "Workshop metodologi riset AI bersama peneliti Gojek", "Co-authorship paper untuk konferensi ICCV, NeurIPS, atau ICML"]),
        priority: "MEDIUM",
        status: "PENDING",
        aiGenerated: false,
      },
      {
        sourceDocumentId: mou1.id,
        prodiName: "Informatika",
        type: "MOA",
        recommendedTitle: "MoA Program Sertifikasi Kompetensi Teknologi bersama PT. Gojek Indonesia",
        theme: "Sertifikasi kompetensi dan pengembangan profesional",
        topicSuggestions: JSON.stringify(["Program persiapan sertifikasi Google Cloud Professional bagi mahasiswa", "Bootcamp intensif algoritma dan struktur data untuk persiapan technical interview", "Program mentoring karir teknologi oleh alumni Gojek lulusan UNU"]),
        impactAreas: JSON.stringify(["Peningkatan employability mahasiswa", "Pengakuan kompetensi oleh industri"]),
        impactLevel: "MEDIUM",
        rationale: "Sertifikasi kompetensi yang diakui industri meningkatkan daya saing lulusan Informatika secara signifikan. Gojek dapat memfasilitasi akses ke platform sertifikasi dan voucher ujian bagi mahasiswa berprestasi.",
        draftScope: "Program sertifikasi untuk 30 mahasiswa/tahun mencakup Google Cloud, AWS, atau sertifikasi Agile/Scrum yang relevan dengan kebutuhan industri teknologi.",
        targetBeneficiary: "Mahasiswa",
        estimatedDuration: "1 tahun",
        exampleActivities: JSON.stringify(["Subsidi voucher sertifikasi Google Cloud untuk mahasiswa terpilih", "Bootcamp coding 2 minggu sebelum ujian sertifikasi", "Mock technical interview dengan HRD Gojek"]),
        priority: "MEDIUM",
        status: "FOLLOWED_UP",
        aiGenerated: false,
      },
      // IA recommendations for MoU 5 (Mandiri-Manajemen)
      {
        sourceDocumentId: mou5.id,
        prodiName: "Manajemen",
        type: "IA",
        recommendedTitle: "IA Program Magang Perbankan dan Treasury Management di Bank Mandiri",
        theme: "Program magang terstruktur MBKM di sektor perbankan",
        topicSuggestions: JSON.stringify(["Rotasi magang di divisi Corporate Banking, Treasury, dan Retail Banking", "Studi kasus analisis kredit dan manajemen risiko perbankan", "Proyek digitalisasi layanan perbankan berbasis data nasabah"]),
        impactAreas: JSON.stringify(["Pengalaman kerja nyata di BUMN perbankan terkemuka", "Peningkatan kompetensi keuangan dan perbankan mahasiswa"]),
        impactLevel: "HIGH",
        rationale: "Program magang di Bank Mandiri memberikan mahasiswa Manajemen eksposur langsung ke operasional perbankan kelas dunia. Pengalaman ini sangat relevan untuk memenuhi standar MBKM dan meningkatkan profil lulusan di industri keuangan.",
        draftScope: "Penempatan 15 mahasiswa Manajemen per semester di Bank Mandiri Yogyakarta dan Regional Jawa Tengah-DIY, dengan rotasi di 3 divisi berbeda selama 6 bulan.",
        targetBeneficiary: "Mahasiswa",
        estimatedDuration: "1 tahun",
        exampleActivities: JSON.stringify(["Orientasi perbankan dan pelatihan compliance selama 2 minggu", "Rotasi divisi Corporate Banking (2 bulan), Treasury (2 bulan), dan Retail (2 bulan)", "Presentasi laporan magang kepada Direksi Mandiri Region"]),
        priority: "HIGH",
        status: "PENDING",
        aiGenerated: false,
      },
      {
        sourceDocumentId: mou5.id,
        prodiName: "Manajemen",
        type: "IA",
        recommendedTitle: "IA Workshop Keuangan Syariah dan ESG Banking untuk Mahasiswa Manajemen",
        theme: "Pengembangan kompetensi keuangan syariah dan berkelanjutan",
        topicSuggestions: JSON.stringify(["Workshop prinsip keuangan syariah dan produk perbankan syariah", "Pelatihan analisis ESG (Environmental, Social, Governance) dalam perbankan", "Simulasi manajemen portofolio investasi berbasis nilai Islam"]),
        impactAreas: JSON.stringify(["Kompetensi keuangan syariah yang relevan dengan identitas UNU", "Pemahaman tren sustainability finance global"]),
        impactLevel: "MEDIUM",
        rationale: "Sebagai universitas Islam, kompetensi keuangan syariah sangat relevan bagi mahasiswa Manajemen UNU. Bank Mandiri memiliki divisi Mandiri Syariah yang dapat menjadi narasumber dan fasilitator workshop.",
        draftScope: "Workshop intensif 3 hari (24 jam) untuk 50 mahasiswa Manajemen mencakup keuangan syariah, ESG banking, dan simulasi manajemen investasi.",
        targetBeneficiary: "Mahasiswa",
        estimatedDuration: "1 tahun",
        exampleActivities: JSON.stringify(["Workshop keuangan syariah oleh praktisi Mandiri Syariah", "Studi kasus green bond dan sustainability-linked loan di Indonesia", "Kompetisi manajemen portofolio investasi antar mahasiswa"]),
        priority: "MEDIUM",
        status: "PENDING",
        aiGenerated: false,
      },
    ],
  })

  console.log("Created seed recommendations")
  console.log("Seeding completed successfully!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
