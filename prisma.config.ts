// TaxCore360 Prisma Configuration
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Supabase Transaction Pooler (for Prisma compatibility)
    url:
      process.env["DIRECT_URL"] ||
      process.env["DATABASE_URL"] ||
      "postgresql://postgres.xcnkegvtqwtaodvogbij:%2baz5R*rc%25g4%23%3f-J@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10",
  },
});
