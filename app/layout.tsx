import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/SessionProvider"

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SIMKERA — Sistem Monitoring Kerja Sama",
  description: "Sistem Monitoring Kerja Sama Program Studi UNU Yogyakarta",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f8fafc] flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
