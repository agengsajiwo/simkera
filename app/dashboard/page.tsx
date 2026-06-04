import { requireAuth } from "@/lib/auth"
import { Navbar } from "@/components/Navbar"
import { DashboardClient } from "./DashboardClient"

export default async function DashboardPage() {
  const session = await requireAuth()

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar session={session} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Monitoring</h1>
          <p className="text-gray-500 text-sm mt-1">Ringkasan dan analitik kerja sama program studi UNU Yogyakarta</p>
        </div>
        <DashboardClient />
      </main>
    </div>
  )
}
