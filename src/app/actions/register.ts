"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  name:     z.string().min(1, "Name is required").max(50).trim(),
  email:    z.string().email("Invalid email address").toLowerCase(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
});

export type RegisterResult =
  | { success: true }
  | { success: false; errors: Record<string, string[]> | string };

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const parsed = RegisterSchema.safeParse({
    name:     formData.get("name"),
    email:    formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { name, email, password } = parsed.data;

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, errors: "An account with this email already exists." };
  }

  // Hash password with bcrypt (12 rounds)
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  return { success: true };
}