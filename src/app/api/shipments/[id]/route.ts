import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ShipmentStatus } from "@prisma/client";

const STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus | null> = {
  READY: "DEPARTED",
  DEPARTED: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
  DELIVERED: null,
};

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const shipment = await prisma.shipment.findUnique({
    where: { id },
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
      store: true,
    },
  });

  if (!shipment)
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json(shipment);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment)
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  // Advance status
  if (body.action === "advance") {
    const next = STATUS_TRANSITIONS[shipment.status];
    if (!next) {
      return NextResponse.json(
        { error: "Status sudah final" },
        { status: 400 },
      );
    }
    const now = new Date();
    const updated = await prisma.shipment.update({
      where: { id },
      data: {
        status: next,
        ...(next === "DEPARTED" ? { departedAt: now } : {}),
        ...(next === "DELIVERED" ? { deliveredAt: now } : {}),
      },
    });
    return NextResponse.json(updated);
  }

  // Update details (vehicleNo, driverName, estimatedArrival, notes)
  const { vehicleNo, driverName, estimatedArrival, notes } = body;
  const updated = await prisma.shipment.update({
    where: { id },
    data: {
      ...(vehicleNo !== undefined ? { vehicleNo } : {}),
      ...(driverName !== undefined ? { driverName } : {}),
      ...(estimatedArrival !== undefined
        ? {
            estimatedArrival: estimatedArrival
              ? new Date(estimatedArrival)
              : null,
          }
        : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });
  return NextResponse.json(updated);
}
