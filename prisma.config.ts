import { defineConfig } from "prisma/config";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
