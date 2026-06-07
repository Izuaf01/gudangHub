import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const productId = searchParams.get("productId") ?? "";
  const type = searchParams.get("type") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const skip = (page - 1) * limit;

  const where = {
    ...(productId && { productId }),
    ...(type && { type: type as never }),
  };

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        fromLocation: { select: { code: true, zone: true } },
        toLocation: { select: { code: true, zone: true } },
        movedBy: { select: { name: true } },
      },
      orderBy: { movedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return NextResponse.json({
    data: movements,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
