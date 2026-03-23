import { PrismaClient, Prisma } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

function getDatabaseUrl() {
  return process.env.DATABASE_URL
}

function getSafeDatabaseInfo(connectionString: string) {
  try {
    const url = new URL(connectionString)
    return {
      protocol: url.protocol,
      host: url.hostname,
      port: url.port || undefined,
      database: url.pathname.replace(/^\//, ""),
      user: decodeURIComponent(url.username || ""),
      params: Object.fromEntries(url.searchParams.entries()),
    }
  } catch {
    return { unparseable: true }
  }
}

const createPrismaClient = () => {
  const connectionString = getDatabaseUrl()
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (and restart the dev server).",
    )
  }

  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as typeof globalThis & {
  __prisma?: PrismaClient
}

export const prisma = globalForPrisma.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma
}