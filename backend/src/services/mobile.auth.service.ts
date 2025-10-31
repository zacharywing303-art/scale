import prisma from "../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const TOKEN_EXPIRES_IN = "1d"; // 7 days

export async function loginMobileEmployee(
  agencyCode: string,
  email: string,
  password: string
) {
  const user = await prisma.mobileEmployee.findUnique({
    where: { email },
    include: { employee: true },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (user.agencyCode !== agencyCode) {
    return { success: false, message: "Invalid agency code" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, message: "Incorrect password" };
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      agencyCode: user.agencyCode,
      agencyID: user.agencyID,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      agencyCode: user.agencyCode,
      participantType: "MOBILE_EMPLOYEE",
      name: user.employee?.name || "Unnamed Employee",
      displayName: user.employee?.name || user.email,
      role: "MOBILE_EMPLOYEE",
      employee: user.employee,
    },
  };
}
