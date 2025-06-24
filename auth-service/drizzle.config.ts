import * as dotenv from 'dotenv';
dotenv.config();
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL! || "",
  },
  dialect: "postgresql",
} satisfies Config;