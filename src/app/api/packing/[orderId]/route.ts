import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { packingSchema } from "@/lib/validations/packing";
import { OrderStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  const task = await prisma.packingTask.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          store: true,
          items: {
            include: {
              product: { select: { name: true, sku: true, unit: true } },
            },
          },
        },
      },
      assignedTo: { select: { name: true } },
    },
  });

  if (!task)
    return NextResponse.json(
      { error: "Task tidak ditemukan" },
      { status: 404 },
    );

  return NextResponse.json({ data: task });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  const body = await req.json();
  const parsed = packingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.packingTask.update({
      where: { orderId },
      data: {
        ...parsed.data,
        status: "COMPLETED",
        packedAt: new Date(),
        assignedToId: session.user?.id ?? undefined,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.READY },
    });

    return updated;
  });

  return NextResponse.json({ data: result });
}
