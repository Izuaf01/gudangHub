import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storeSchema } from "@/lib/validations/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      _count: { select: { orders: true, shipments: true } },
    },
  });
  if (!store)
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json(store);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();

  if (body.isActive !== undefined) {
    const updated = await prisma.store.update({
      where: { id },
      data: { isActive: body.isActive },
    });
    return NextResponse.json(updated);
  }

  const parsed = storeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const updated = await prisma.store.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.store.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
