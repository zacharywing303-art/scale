import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/db";

export const loginService = async (
  email: string,
  password: string,
  agencyCode?: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { agency: true },
  });

  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new Error("Invalid credentials");

  if (user.role === "AGENCY_USER" || user.role === "AGENCY_ADMIN") {
    if (!agencyCode) {
      throw new Error("Agency code is required");
    }

    if (!user.agency || user.agency.code !== agencyCode) {
      throw new Error("Invalid agency code");
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "15m" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      agency: user.agency
        ? {
            id: user.agency.id,
            code: user.agency.code,
            name: user.agency.name,
          }
        : null,
    },
  };
};

export const registerService = async (data: {
  name: string;
  email: string;
  password: string;
  agencyCode: string;
}) => {
  // Look up agency by code
  const agency = await prisma.agency.findUnique({
    where: { code: data.agencyCode },
  });

  if (!agency) throw new Error("Invalid agency code");

  const passwordHash = await bcrypt.hash(data.password, 10);

  // Create user linked to agency
  const newUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      agencyId: agency.id,
      phone: "", // Provide a default value or get from data if available
    },
  });

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    agency: {
      id: agency.id,
      name: agency.name,
    },
  };
};
