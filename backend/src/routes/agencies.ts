import prisma from "../lib/db";
import router from "./auth.routes";

// GET /api/agencies/billing
router.get("/billing", async (req, res) => {
  try {
    const agencies = await prisma.agency.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subscriptionPlan: true,
        paymentMethod: true,
        status: true,
        updatedAt: true, // or renewalDate if you have it
      },
    });

    const data = agencies.map((a) => ({
      ...a,
      paymentStatus:
        a.status === "Active"
          ? "Paid"
          : a.status === "Not Required"
          ? "Not Required"
          : "Pending",
      renewalDate: a.updatedAt.toISOString().split("T")[0],
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch billing agencies" });
  }
});
