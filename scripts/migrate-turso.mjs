import { createClient } from "@libsql/client"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { config } from "dotenv"

config({ path: ".env.local" })

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

const url = process.env.DATABASE_URL
const authToken = process.env.DATABASE_AUTH_TOKEN

if (!url || !authToken) {
  console.error("❌ DATABASE_URL dan DATABASE_AUTH_TOKEN harus ada di .env.local")
  process.exit(1)
}

console.log("🔗 Connecting to Turso:", url)
const client = createClient({ url, authToken })

const migrationPath = join(ROOT, "prisma/migrations/20260603162930_init/migration.sql")
const sql = readFileSync(migrationPath, "utf-8")

// Strip comment lines, then split by semicolon
const cleaned = sql
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")

const statements = cleaned
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 10) // skip whitespace-only chunks

console.log(`📋 Menjalankan ${statements.length} SQL statements...\n`)

let success = 0
let skipped = 0
let failed = 0

for (const statement of statements) {
  const preview = statement.replace(/\s+/g, " ").substring(0, 70)
  try {
    await client.execute(statement)
    console.log(`✅ ${preview}`)
    success++
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.toLowerCase().includes("already exists") || msg.includes("duplicate")) {
      console.log(`⏭️  Already exists: ${preview}`)
      skipped++
    } else {
      console.error(`❌ FAILED: ${msg}\n   → ${preview}`)
      failed++
    }
  }
}

console.log(`\n📊 Hasil: ${success} berhasil, ${skipped} dilewati, ${failed} gagal`)
client.close()
