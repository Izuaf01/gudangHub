import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stockInSchema } from "@/lib/validations/stock-in";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "";
  const supplierId = searchParams.get("supplierId") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status: status as never }),
    ...(supplierId && { supplierId }),
  };

  const [stockIns, total] = await Promise.all([
    prisma.stockIn.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        supplier: { select: { id: true, name: true } },
        qualityChecks: { take: 1, orderBy: { checkedAt: "desc" } },
      },
      orderBy: { receivedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.stockIn.count({ where }),
  ]);

  return NextResponse.json({
    data: stockIns,
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
  const parsed = stockInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const stockIn = await prisma.stockIn.create({
    data: {
      ...parsed.data,
      status: "PENDING",
    },
    include: {
      product: { select: { name: true, sku: true } },
      supplier: { select: { name: true } },
    },
  });

  return NextResponse.json({ data: stockIn }, { status: 201 });
}
