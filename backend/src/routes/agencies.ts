// import express from "express";
// import prisma from "../lib/db";
// import e, { Router } from "express";

// import bcrypt from "bcryptjs";

// const router = express.Router();

// // GET /api/agencies/billing
// router.get("/billing", async (req, res) => {
//   try {
//     const agencies = await prisma.agency.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         phone: true,
//         subscriptionPlan: true,
//         paymentMethod: true,
//         status: true,
//         updatedAt: true, // or renewalDate if you have it
//       },
//     });

//     const data = agencies.map((a) => ({
//       ...a,
//       paymentStatus:
//         a.status === "Active"
//           ? "Paid"
//           : a.status === "Not Required"
//           ? "Not Required"
//           : "Pending",
//       renewalDate: a.updatedAt.toISOString().split("T")[0],
//     }));

//     res.json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch billing agencies" });
//   }
// });

// // POST /api/agencies/create_with_admin
// router.post("/create_with_admin", async (req, res) => {
//   const { name, email, phone, contactPerson, santraxID } = req.body;

//   console.log("Incoming body:", req.body);

//   if (!name || !email || !phone || !contactPerson || !santraxID) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   try {
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ message: "Email already in use" });
//     }

//     const hashedPassword = await bcrypt.hash("password123", 10);

//     const agency = await prisma.agency.create({
//       data: {
//         name,
//         email,
//         phone,
//         code: generateAgencyCode(),
//         state: "Unknown",
//         allowEvv: false,
//         status: "Active",
//         santraxID,
//         users: {
//           create: {
//             name: contactPerson,
//             email,
//             phone,
//             role: "AGENCY_ADMIN",
//             passwordHash: hashedPassword,
//           },
//         },
//       },
//     });

//     res.status(200).json({ message: "Agency and user created", agency });
//   } catch (error) {
//     console.error("Error creating agency:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// function generateAgencyCode(): string {
//   return Math.random().toString(36).substring(2, 8).toUpperCase();
// }

// export default router;
