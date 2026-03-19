import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // process.env so prisma generate works without DATABASE_URL set
    url: process.env.DATABASE_URL ?? "",
  },
});
