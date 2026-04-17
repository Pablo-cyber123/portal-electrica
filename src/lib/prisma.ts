import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

const prismaClientSingleton = () => {
  if (connectionString) {
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  }
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma
