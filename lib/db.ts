import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db"
  const authToken = process.env.DATABASE_AUTH_TOKEN // undefined for local SQLite, required for Turso
  const adapter = new PrismaLibSql({ url: dbUrl, authToken })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
