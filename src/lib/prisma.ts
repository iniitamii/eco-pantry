import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.set("connectionLimit", "3");
  url.searchParams.set("connectTimeout", "10000");   // 10 seconds in ms
  url.searchParams.set("acquireTimeout", "15000");   // 15 seconds in ms

  const adapter = new PrismaMariaDb(url.toString());
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;