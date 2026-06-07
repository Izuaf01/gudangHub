import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supplierSchema } from "@/lib/validations/supplier";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      stockIns: {
        take: 10,
        orderBy: { receivedAt: "desc" },
        include: { product: true },
      },
    },
  });

  if (!supplier)
    return NextResponse.json(
      { error: "Supplier tidak ditemukan" },
      { status: 404 },
    );
  return NextResponse.json({ data: supplier });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = supplierSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const supplier = await prisma.supplier.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ data: supplier });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.supplier.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
