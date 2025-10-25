import { Router } from "express";
import prisma from "../lib/db";

const router = Router();

router.get("/agency/:agencyId", async (req, res) => {
  try {
    const programs = await prisma.program.findMany({
      where: {
        clients: {
          some: { agencyID: req.params.agencyId },
        },
      },
      select: { id: true, name: true },
    });
    res.json(programs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching programs" });
  }
});

export default router;
