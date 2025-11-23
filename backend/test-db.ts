import dotenv from "dotenv";
// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "./src/prisma/generated";

dotenv.config();

console.log("DATABASE_URL is:", process.env.DATABASE_URL);
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection successful!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
