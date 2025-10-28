import { Router } from "express";
import prisma from "../lib/db";

const router = Router();

// Later will update to pull from controller and service files.

router.get("/agency/:agencyId", async (req, res) => {
  try {
    const payers = await prisma.payer.findMany({
      where: {
        assignedClients: {
          some: { agencyID: req.params.agencyId },
        },
      },
      select: { id: true, payerName: true },
    });
    res.json(payers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching payers" });
  }
});

export default router;
