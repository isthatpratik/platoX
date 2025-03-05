import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    // Find user with the code
    const user = await prisma.user.findFirst({
      where: { verificationCode: code, verified: false },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { verified: true, verificationCode: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
