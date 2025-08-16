import { PrismaClient } from "@prisma/client";
import { addDays, setHours, setMinutes } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Find your seeded agency, clients, and employees
  const agency = await prisma.agency.findFirst();
  const clients = await prisma.client.findMany({
    where: { agencyId: agency?.id },
  });
  const employees = await prisma.employee.findMany({
    where: { agencyId: agency?.id },
  });

  if (!agency || clients.length === 0 || employees.length === 0) {
    console.error(
      "⚠️ Missing agency, clients, or employees — seed them first."
    );
    return;
  }

  // Schedule dates from 2 days before today to 2 days after today
  const today = new Date();
  const dateOffsets = [-2, -1, 0, 1, 2];

  const schedules = [];

  for (let i = 0; i < dateOffsets.length; i++) {
    const day = addDays(today, dateOffsets[i]);
    const startTime = setMinutes(setHours(day, 9), 0); // 9:00 AM
    const endTime = setMinutes(setHours(day, 11), 0); // 11:00 AM

    schedules.push({
      scheduleType: i % 2 === 0 ? "Visit" : "Office",
      clientId: clients[i % clients.length].id,
      clientMedicaidId: `MED${1000 + i}`,
      authorizations: `Auth ${i + 1}`,
      authorizationNumber: `AUTHNUM${i + 1}`,
      serviceId: null, // if you have services seeded, you can link here
      officeReason: i % 2 === 0 ? null : "Team Meeting",
      eventCode: `EVT${i + 1}`,
      authorizationBillUnitType: i % 2 === 0 ? "Hourly" : "Visit",
      eventStatus: i % 2 === 0 ? "Confirmed" : "Pending",
      eventDate: day,
      startTime: startTime,
      endTime: endTime,
      employeeId: employees[i % employees.length].id,
      repeatedEvent: false,
      dates: [],
      comments: i % 2 === 0 ? "Routine visit" : "Internal review",
      billingOverride: false,
      rate: 100 + i * 5,
      copay: 10 + i,
      billAmount: 200 + i * 10,
    });
  }

  // Create all schedules
  await prisma.schedule.createMany({
    data: schedules,
  });

  console.log("✅ Seeded schedules successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
