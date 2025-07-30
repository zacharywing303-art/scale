import prisma from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const existingAgency = await prisma.agency.findFirst({
    where: { code: "UNITY124" },
  });

  let agency;
  if (!existingAgency) {
    agency = await prisma.agency.create({
      data: {
        name: "Test Care Agency",
        code: "UNITY124",
        state: "NY",
        allowEvv: true,
      },
    });
    console.log("✅ Agency created");
  } else {
    agency = existingAgency;
    console.log("ℹ️ Agency already exists");
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: "test@unitycare.com" },
  });

  if (!existingUser) {
    const hashed = await bcrypt.hash("password123", 10);
    await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@unitycare.com",
        passwordHash: hashed,
        agencyId: agency.id,
        role: "AGENCY_USER", // Adjust role as needed
      },
    });
    console.log("✅ User created");
  } else {
    console.log("ℹ️ User already exists");
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
