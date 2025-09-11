import { Request, Response } from "express";
import { loginMobileEmployee } from "../services/mobile.auth.service";

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
