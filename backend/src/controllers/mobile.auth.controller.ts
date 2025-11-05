import { Request, Response } from "express";
import { loginMobileEmployee } from "../services/mobile.auth.service";
import prisma from "../lib/db";

export async function mobileLogin(req: Request, res: Response) {
  try {
    const { agencyCode, email, password } = req.body;

    if (!agencyCode || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Agency code, email, and password are required",
      });
    }

    const result = await loginMobileEmployee(agencyCode, email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    console.error("Mobile login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getMobileProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: missing user" });
    }

    const user = await prisma.mobileEmployee.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        agencyCode: user.agencyCode,
        agencyID: user.agencyID,
        name: user.employee?.name,
        participantType: "MOBILE_EMPLOYEE",
        role: "MOBILE_EMPLOYEE",
        employeeID: user.employeeID,
      },
    });
  } catch (err) {
    console.error("Error in getMobileProfile:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
