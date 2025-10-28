import { Router } from "express";
import prisma from "../lib/db";

const router = Router();

// Later will update to pull from controller and service files.

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
