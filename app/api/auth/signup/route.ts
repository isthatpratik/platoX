import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, checkOnly } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // If only checking email, return early
    if (checkOnly) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Store user as unverified
    await prisma.user.create({
      data: { email, password: hashedPassword, verified: false, verificationCode, role: "user" },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({ message: "Verification code sent" }, { status: 201 });
  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
