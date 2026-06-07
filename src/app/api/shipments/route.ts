import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shipmentSchema } from "@/lib/validations/shipment";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const storeId = searchParams.get("storeId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where = {
    ...(status
      ? { status: status as "READY" | "DEPARTED" | "IN_TRANSIT" | "DELIVERED" }
      : {}),
    ...(storeId ? { storeId } : {}),
  };

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      include: {
        order: {
          include: {
            store: { select: { name: true, city: true } },
            items: { select: { id: true } },
          },
        },
        store: { select: { name: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.shipment.count({ where }),
  ]);

  return NextResponse.json({ data: shipments, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = shipmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { orderId, vehicleNo, driverName, estimatedArrival, notes } =
    parsed.data;

  // Verify order is READY
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, storeId: true },
  });
  if (!order)
    return NextResponse.json(
      { error: "Pesanan tidak ditemukan" },
      { status: 404 },
    );
  if (order.status !== "READY") {
    return NextResponse.json(
      { error: "Pesanan harus berstatus SIAP KIRIM untuk membuat pengiriman" },
      { status: 400 },
    );
  }

  // Check no existing shipment
  const existing = await prisma.shipment.findUnique({ where: { orderId } });
  if (existing) {
    return NextResponse.json(
      { error: "Pengiriman untuk pesanan ini sudah ada" },
      { status: 400 },
    );
  }

  const shipment = await prisma.$transaction(async (tx) => {
    const s = await tx.shipment.create({
      data: {
        orderId,
        storeId: order.storeId,
        vehicleNo,
        driverName,
        estimatedArrival: estimatedArrival
          ? new Date(estimatedArrival)
          : undefined,
        notes,
        status: "READY",
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "SHIPPED" },
    });

    return s;
  });

  return NextResponse.json(shipment, { status: 201 });
}
