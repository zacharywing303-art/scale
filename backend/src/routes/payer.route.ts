import { Router } from "express";
import prisma from "../lib/db";

const router = Router();

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
