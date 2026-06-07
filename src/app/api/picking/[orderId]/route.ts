import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  const task = await prisma.pickingTask.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          store: { select: { name: true, city: true } },
          items: {
            include: {
              product: {
                include: {
                  inventories: {
                    include: {
                      location: { select: { code: true, zone: true } },
                    },
                    where: { quantity: { gt: 0 } },
                  },
                },
              },
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
  const { action, pickedItems } = body as {
    action: "start" | "complete";
    pickedItems?: { orderItemId: string; pickedQty: number }[];
  };

  const task = await prisma.pickingTask.findUnique({ where: { orderId } });
  if (!task)
    return NextResponse.json(
      { error: "Task tidak ditemukan" },
      { status: 404 },
    );

  if (action === "start") {
    const updated = await prisma.pickingTask.update({
      where: { orderId },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
        assignedToId: session.user?.id ?? undefined,
      },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PICKING },
    });
    return NextResponse.json({ data: updated });
  }

  if (action === "complete" && pickedItems) {
    const result = await prisma.$transaction(async (tx) => {
      // Update picked quantities
      for (const item of pickedItems) {
        await tx.orderItem.update({
          where: { id: item.orderItemId },
          data: { pickedQty: item.pickedQty },
        });
      }

      // Complete picking task
      const updated = await tx.pickingTask.update({
        where: { orderId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      // Move order to PACKING + create packing task
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PACKING },
      });
      await tx.packingTask.create({ data: { orderId } });

      return updated;
    });
    return NextResponse.json({ data: result });
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}
