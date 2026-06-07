import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validations/order";
import { generateOrderNo } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "";
  const storeId = searchParams.get("storeId") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status: status as never }),
    ...(storeId && { storeId }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        store: { select: { id: true, name: true, city: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true, unit: true } },
          },
        },
        pickingTask: { select: { status: true } },
        packingTask: { select: { status: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    data: orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { items, scheduledShipAt, ...orderData } = parsed.data;

  const order = await prisma.order.create({
    data: {
      ...orderData,
      orderNo: generateOrderNo(),
      scheduledShipAt: scheduledShipAt ? new Date(scheduledShipAt) : null,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          requestedQty: item.requestedQty,
        })),
      },
    },
    include: {
      store: { select: { name: true } },
      items: { include: { product: { select: { name: true, sku: true } } } },
    },
  });

  return NextResponse.json({ data: order }, { status: 201 });
}
