import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.verified) {
      return NextResponse.json({ error: "User not found or already verified." }, { status: 400 });
    }

    // Generate new verification code
    const newCode = crypto.randomInt(100000, 999999).toString();

    // Update user with new code
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode: newCode },
    });

    // Send email
    await sendVerificationEmail(user.email, newCode);

    return NextResponse.json({ message: "New verification code sent." });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
