// prisma/seed.ts
import { PrismaClient } from "../backend/src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const agencyId = "cmdnvjt6q0000sbtl8c1j12eh";

  // 1. Create the agency (if not exists)
  const agency = await prisma.agency.upsert({
    where: { id: agencyId },
    update: {},
    create: {
      id: agencyId,
      name: "Test Care Agency",
      code: "UNITY124",
      state: "NY",
      allowEvv: true,
      status: "Active",
    },
  });

  console.log("Agency created:", agency.name);

  // 2. Create 5 employees
  const employees = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.employee.create({
        data: {
          last5SSN: `1234${i}`,
          status: "Active",
          employeeID: `EMP00${i + 1}`,
          name: `Employee ${i + 1}`,
          dateOfBirth: new Date(1990, i, 1),
          gender: i % 2 === 0 ? "Male" : "Female",
          languages: ["English"],
          mainPhone: `555-000${i}`,
          email: `employee${i + 1}@test.com`,
          mobileUser: false,
          agencyID: agency.id,
          position: "Caregiver",
        },
      })
    )
  );

  console.log("Employees created:", employees.length);

  // 3. Create 5 clients
  const clients = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.client.create({
        data: {
          ssn: `987-65-432${i}`,
          status: "Active",
          clientID: `CLI00${i + 1}`,
          name: `Client ${i + 1}`,
          dateOfBirth: new Date(1985, i, 1),
          gender: i % 2 === 0 ? "Male" : "Female",
          languages: ["English"],
          mainPhone: `555-100${i}`,
          email: `client${i + 1}@test.com`,
          agencyID: agency.id,
          medicaidID: `MEDI00${i + 1}`,
        },
      })
    )
  );

  console.log("Clients created:", clients.length);

  // 4. Create 3 services
  const services = await Promise.all(
    ["Personal Care", "Companionship", "Respite Care"].map((name, i) =>
      prisma.service.create({
        data: {
          name,
          code: `SVC00${i + 1}`,
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          assignedTo: {
            connect: clients.map((c) => ({ id: c.id })),
          },
        },
      })
    )
  );

  console.log("Services created:", services.length);

  // 5. Create 5 visits
  const visits = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.visit.create({
        data: {
          agencyID: agency.id,
          clientID: Number(clients[i].id),
          employeeID: Number(employees[i].id),
          scheduledTimeIn: new Date(),
          scheduledTimeOut: new Date(new Date().getTime() + 60 * 60 * 1000),
          visitStatus: "Scheduled",
        },
      })
    )
  );

  console.log("Visits created:", visits.length);

  // 6. Add 1 exception per visit
  await Promise.all(
    visits.map((v, i) =>
      prisma.visitException.create({
        data: {
          visitId: v.id,
          exceptionType: "No Show",
          date: new Date(),
        },
      })
    )
  );

  console.log("Exceptions created:", visits.length);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
