import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      store: true,
      items: {
        include: {
          product: {
            include: {
              inventories: {
                include: { location: { select: { code: true } } },
              },
            },
          },
        },
      },
      pickingTask: { include: { assignedTo: { select: { name: true } } } },
      packingTask: { include: { assignedTo: { select: { name: true } } } },
      shipment: true,
    },
  });

  if (!order)
    return NextResponse.json(
      { error: "Pesanan tidak ditemukan" },
      { status: 404 },
    );

  return NextResponse.json({ data: order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, notes, priority, scheduledShipAt } = body as {
    status?: OrderStatus;
    notes?: string;
    priority?: string;
    scheduledShipAt?: string;
  };

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order)
    return NextResponse.json(
      { error: "Pesanan tidak ditemukan" },
      { status: 404 },
    );

  // When confirming, create picking task
  if (status === OrderStatus.CONFIRMED && order.status === OrderStatus.DRAFT) {
    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CONFIRMED },
      });
      await tx.pickingTask.create({ data: { orderId: id } });
      return o;
    });
    return NextResponse.json({ data: updated });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(priority && { priority }),
      ...(scheduledShipAt !== undefined && {
        scheduledShipAt: scheduledShipAt ? new Date(scheduledShipAt) : null,
      }),
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order)
    return NextResponse.json(
      { error: "Pesanan tidak ditemukan" },
      { status: 404 },
    );

  if (order.status !== OrderStatus.DRAFT) {
    return NextResponse.json(
      { error: "Hanya pesanan Draft yang dapat dihapus" },
      { status: 400 },
    );
  }

  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
