import path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/app/generated/prisma/client";

function getDbUrl(): string {
  // Turso (本番): TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  // ローカル開発: SQLiteファイル
  const rawPath = path.resolve(process.cwd(), "dev.db");
  return `file:${rawPath.replace(/\\/g, "/")}`;
}

const adapter = new PrismaLibSql({
  url: getDbUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
