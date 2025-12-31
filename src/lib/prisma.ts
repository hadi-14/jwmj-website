import "dotenv/config";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../../generated/prisma/client";

// SQL Server connection configuration using integrated security
const sqlConfig = {
  server: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
  database: process.env.DB_NAME || "DBWehvaria_Membership",
  authentication: {
    type: "default",
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
  options: {
    encrypt: true,
    trustServerCertificate: process.env.NODE_ENV !== "production",
    enableKeepAlive: true,
  },
};

// For integrated security (Windows authentication), use environment variable or direct connection
const useIntegratedSecurity = !process.env.DB_USER || !process.env.DB_PASSWORD;

const adapter = new PrismaMssql(
  useIntegratedSecurity
    ? { connectionString: process.env.DATABASE_URL }
    : sqlConfig
);

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export { prisma };
