import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, userId } = await req.json();
    
    // Generate a unique slug
    let slug = slugify(name, { lower: true, strict: true });
    let counter = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${slug}-${counter}`;
      counter++;
    }

    // Create organization with the slug
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        members: { connect: { id: userId } },
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Could not create organization" }, { status: 500 });
  }
}
