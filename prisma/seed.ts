import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash passwords
  const mainAdminPassword = await bcrypt.hash("MainAdmin123!", 10);
  const sysAdminPassword = await bcrypt.hash("SystemAdmin123!", 10);

  // 1. Create Agencies
  const agency1 = await prisma.agency.create({
    data: {
      name: "Unity Homecare",
      code: "UCC45678",
      state: "NY",
      status: "Active",
    },
  });

  const agency2 = await prisma.agency.create({
    data: {
      name: "Harmony Care",
      code: "HMC98765",
      state: "CA",
      status: "Active",
    },
  });

  // 2. Create Users
  const mainAdmin = await prisma.user.create({
    data: {
      name: "Main Admin",
      email: "mainadmin@unitycare.com",
      password: mainAdminPassword,
      role: "main_admin",
    },
  });

  const sysAdmin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "sysadmin@unitycare.com",
      password: sysAdminPassword,
      role: "system_admin",
      agencyId: agency1.id, // Assign to Unity Homecare
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log({
    agencies: [agency1, agency2],
    users: [mainAdmin, sysAdmin],
  });
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
