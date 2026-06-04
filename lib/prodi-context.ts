export const PRODI_LIST = [
  "Manajemen",
  "Akuntansi",
  "Farmasi",
  "Teknologi Hasil Pertanian",
  "Agribisnis",
  "Studi Islam Interdisipliner",
  "Teknik Elektro",
  "Informatika",
  "Teknik Komputer",
  "PGSD",
  "PBI",
]

export function prodiToSlug(prodi: string): string {
  return prodi.toLowerCase().replace(/\s+/g, "-")
}

export function slugToProdi(slug: string): string | undefined {
  return PRODI_LIST.find((p) => prodiToSlug(p) === slug)
}

export const PRODI_CONTEXT: Record<string, string> = {
  Manajemen: `
    Fokus: bisnis, kewirausahaan, manajemen SDM, keuangan, pemasaran digital
    Kebutuhan utama: magang di perusahaan, studi kasus bisnis nyata, sertifikasi manajemen
    Relevansi MBKM: magang industri, proyek wirausaha, pertukaran mahasiswa
    Pendukung akreditasi: kerja sama industri untuk tracer study, rekrutmen alumni
    Mitra ideal DUDI: perusahaan manufaktur, retail, perbankan, startup, konsultan bisnis
    Mitra ideal Universitas: prodi manajemen/bisnis, sekolah bisnis ternama
  `,
  Akuntansi: `
    Fokus: akuntansi keuangan, perpajakan, auditing, sistem informasi akuntansi
    Kebutuhan utama: magang KAP/perusahaan, sertifikasi (ACCA, Brevet Pajak), akses data keuangan riil
    Relevansi MBKM: magang di KAP, BPK, perusahaan tbk, fintech
    Pendukung akreditasi: kerja sama dengan IAI, Kanwil DJP, KAP terdaftar
    Mitra ideal DUDI: Kantor Akuntan Publik, perusahaan tbk, fintech, perbankan, BUMN
    Mitra ideal Universitas: prodi akuntansi terakreditasi A, universitas dengan lab akuntansi
  `,
  Farmasi: `
    Fokus: ilmu kefarmasian, farmakologi, kimia farmasi, farmasi klinis dan komunitas
    Kebutuhan utama: praktik kerja apotek/RS/industri farmasi, riset formulasi obat
    Relevansi MBKM: magang di BPOM, rumah sakit, industri farmasi, apotek jaringan
    Pendukung akreditasi: kerja sama RS untuk PKPA, industri untuk praktik kerja
    Mitra ideal DUDI: rumah sakit, industri farmasi, apotek jaringan, BPOM, distributor alkes
    Mitra ideal Universitas: fakultas farmasi terakreditasi, universitas dengan lab farmasi lengkap
  `,
  "Teknologi Hasil Pertanian": `
    Fokus: pengolahan pangan, teknologi pasca panen, keamanan pangan, agroindustri
    Kebutuhan utama: akses lab industri pangan, riset produk baru, uji sensoris
    Relevansi MBKM: magang di industri pangan (BUMN/swasta), BPOM, Balitbang pertanian
    Pendukung akreditasi: kerja sama dengan industri pangan bersertifikat ISO/HACCP
    Mitra ideal DUDI: perusahaan pangan olahan, BUMN pangan, industri minuman, cold chain
    Mitra ideal Universitas: fakultas teknologi pertanian, IPB, universitas dengan lab pangan
  `,
  Agribisnis: `
    Fokus: bisnis pertanian, rantai pasok agro, kebijakan pertanian, kewirausahaan agro
    Kebutuhan utama: akses lapangan pertanian/perkebunan, data pasar komoditas, ekosistem startup agro
    Relevansi MBKM: magang di Kementan, perusahaan agribisnis, startup agtech
    Pendukung akreditasi: kerja sama dengan BULOG, perusahaan perkebunan, dinas pertanian
    Mitra ideal DUDI: perusahaan perkebunan, koperasi pertanian, startup agtech, eksportir komoditas
    Mitra ideal Universitas: IPB, universitas pertanian, prodi agribisnis terakreditasi
  `,
  "Studi Islam Interdisipliner": `
    Fokus: studi Islam, fikih kontemporer, ekonomi Islam, dakwah, sosial keagamaan
    Kebutuhan utama: riset keislaman, praktik lembaga keagamaan, pengabdian berbasis nilai Islam
    Relevansi MBKM: magang di lembaga fatwa, perbankan syariah, pesantren, NGO keislaman
    Pendukung akreditasi: kerja sama dengan MUI, PBNU, Muhammadiyah, bank syariah, BAZNAS
    Mitra ideal DUDI: bank syariah, BAZNAS, lembaga zakat, pesantren modern, LSM keislaman
    Mitra ideal Universitas: UIN, IAIN, universitas Islam internasional, LIPIA
  `,
  "Teknik Elektro": `
    Fokus: elektronika, sistem tenaga listrik, telekomunikasi, otomasi industri, IoT
    Kebutuhan utama: lab elektronika dan instrumentasi, proyek engineering nyata, sertifikasi kelistrikan
    Relevansi MBKM: magang di PLN, perusahaan telko, manufaktur elektronik, startup IoT
    Pendukung akreditasi: kerja sama dengan PLN, Telkom, perusahaan otomasi industri
    Mitra ideal DUDI: PLN, Telkom, perusahaan panel listrik, manufaktur elektronik, sistem integrator
    Mitra ideal Universitas: teknik elektro ITB, ITS, universitas dengan lab power systems
  `,
  Informatika: `
    Fokus: software engineering, AI/ML, data science, keamanan siber, mobile/web development
    Kebutuhan utama: proyek software nyata, akses cloud computing, kompetisi coding, sertifikasi IT
    Relevansi MBKM: magang di perusahaan teknologi, startup, instansi pemerintah digital
    Pendukung akreditasi: kerja sama dengan Google, Microsoft, perusahaan teknologi nasional
    Mitra ideal DUDI: startup teknologi, perusahaan software house, e-commerce, fintech, BSSN
    Mitra ideal Universitas: Fasilkom UI, teknik informatika ITS, universitas dengan riset AI kuat
  `,
  "Teknik Komputer": `
    Fokus: embedded systems, hardware, robotika, jaringan komputer, sistem real-time
    Kebutuhan utama: lab hardware dan embedded, proyek robotika, sertifikasi jaringan (Cisco, CompTIA)
    Relevansi MBKM: magang di manufaktur elektronik, perusahaan jaringan, perusahaan robotik
    Pendukung akreditasi: kerja sama dengan vendor hardware, perusahaan sistem integrator
    Mitra ideal DUDI: perusahaan jaringan/networking, manufaktur elektronik, perusahaan robotik, IoT
    Mitra ideal Universitas: teknik komputer ITS, UI, universitas dengan lab embedded systems
  `,
  PGSD: `
    Fokus: pendidikan dasar, pedagogi, pengembangan kurikulum SD, literasi dan numerasi
    Kebutuhan utama: PPL di sekolah berkualitas, riset pendidikan dasar, pengembangan media ajar
    Relevansi MBKM: magang mengajar di SD unggulan, riset lesson study, asistensi mengajar
    Pendukung akreditasi: kerja sama dengan Dinas Pendidikan, sekolah mitra PPL, PGRI
    Mitra ideal DUDI: sekolah dasar negeri/swasta unggulan, dinas pendidikan, penerbit buku ajar
    Mitra ideal Universitas: PGSD UNY, UPI, universitas LPTK dengan riset pendidikan dasar kuat
  `,
  PBI: `
    Fokus: pendidikan bahasa Inggris, linguistik terapan, TEFL/TESOL, literasi bahasa
    Kebutuhan utama: praktik mengajar, exposure native speaker, sertifikasi TOEFL/IELTS/Cambridge
    Relevansi MBKM: magang mengajar, pertukaran mahasiswa internasional, teaching assistant
    Pendukung akreditasi: kerja sama dengan lembaga bahasa internasional, sekolah bilingual
    Mitra ideal DUDI: British Council, EF, lembaga kursus bahasa, sekolah internasional, hotel bintang
    Mitra ideal Universitas: universitas luar negeri berbahasa Inggris, prodi PBI terakreditasi A unggul
  `,
}
