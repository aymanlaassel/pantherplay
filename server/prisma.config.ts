import "dotenv/config";
import { defineConfig } from "prisma/config";

// Used by the Prisma CLI (migrate, db push, studio).
// Migrations must use the session-mode pooler (DIRECT_URL), not the transaction pooler.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
