import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/db";

export const loginService = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "15m" }
  );

  return { token, user: { id: user.id, name: user.name, role: user.role } };
};

export const registerService = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: { ...data, password: hashedPassword },
  });
};
