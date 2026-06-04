import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function validateApiSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email?.endsWith("@unu-jogja.ac.id")) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
      user: null,
    }
  }
  return { error: null, session, user: null }
}

/**
 * Validasi session DAN pastikan user ada di database.
 * Jika user belum ada (misal setelah truncate DB), auto-upsert dari data session.
 */
export async function validateApiSessionWithUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email?.endsWith("@unu-jogja.ac.id")) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
      user: null,
    }
  }

  // Upsert user — buat jika belum ada, update jika sudah ada
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    },
    create: {
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      role: (session.user as any).role ?? "USER",
    },
  })

  return { error: null, session, user }
}
