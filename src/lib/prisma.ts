import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@ep-placeholder.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

export const isDatabaseReady = Boolean(
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("placeholder") &&
  process.env.DATABASE_URL.startsWith("postgres")
);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
