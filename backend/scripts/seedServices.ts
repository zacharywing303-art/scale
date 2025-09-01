import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const services = [
    { name: "Companion Basic 1:3", code: "W1724" },
    { name: "Companion (Level 1 1:2)", code: "W1725" },
    { name: "Companion (Level 2 1:1)", code: "W1726" },
    { name: "In-Home & Commnty Supprts (Basic)", code: "W7058" },
    { name: "IHCS (Basic 1:3)", code: "W7058" },
    { name: "IHCS (Level 1)", code: "W7059" },
    { name: "IHCS (Level 2)", code: "W7060" },
    { name: "IHCS (Level 3)", code: "W7068" },
    { name: "IHCS (Level 2 Enhanced)", code: "W7061" },
    { name: "IHCS (Level 3 Enhanced)", code: "W7069" },
    { name: "Respite 15 mins Basic (1:4)", code: "W8096" },
    { name: "Respite Unlicensed Basic (1:4) Day", code: "W9795" },
    { name: "Respite Unlicensed Level 1 (1:3) 15 mins", code: "W9860" },
    { name: "Respite Unlicensed Level 1 (1:3) Day", code: "W9796" },
    { name: "Respite Unlicensed Level 2 (1:2) 15 mins", code: "W9861" },
    { name: "Respite Unlicensed Level 2 (1:2) Day", code: "W9797" },
    { name: "Respite Unlicensed Level 3 (1:1) 15 mins", code: "W9862" },
    { name: "Respite Unlicensed Level 3 (1:1) Day", code: "W9798" },
    {
      name: "Respite Unlicensed Level 3 (1:1) 15 mins Enhanced",
      code: "W9863",
    },
    { name: "Respite Unlicensed Level 3 (1:1) Day Enhanced", code: "W9799" },
    { name: "Respite Unlicensed Level 4 (2:1) 15 mins", code: "W9864" },
    { name: "Respite Unlicensed Level 4 (2:1) Day", code: "W9800" },
    {
      name: "Respite Unlicensed Level 4 (2:1) 15 mins Enhanced",
      code: "W8095",
    },
    { name: "Respite Unlicensed Level 4 (2:1) Day Enhanced", code: "W9801" },
    { name: "Respite Unlicensed Day", code: "W8096" },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      // You must use the unique identifier field (id) for upsert
      // If you want to upsert by code, ensure 'code' is a unique field in your Prisma schema
      where: { id: service.code },
      update: { name: service.name },
      create: {
        name: service.name,
        code: service.code,
        startDate: new Date(),
        endDate: new Date("2099-12-31"), // far future so it's always active
      },
    });
  }

  console.log("✅ Services seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
