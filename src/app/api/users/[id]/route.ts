import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  if (!user)
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionRole = (session.user as unknown as { role: string }).role;
  if (sessionRole !== "ADMIN") {
    return NextResponse.json(
      { error: "Hanya ADMIN yang dapat mengubah pengguna" },
      { status: 403 },
    );
  }

  const { id } = await ctx.params;
  const body = await req.json();

  // Toggle active
  if (body.isActive !== undefined) {
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: body.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return NextResponse.json(updated);
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { name, email, role, password } = parsed.data;

  // Check email conflict (exclude self)
  const conflict = await prisma.user.findFirst({
    where: { email, NOT: { id } },
  });
  if (conflict) {
    return NextResponse.json(
      { error: "Email sudah digunakan" },
      { status: 400 },
    );
  }

  const data: Record<string, unknown> = { name, email, role };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}
