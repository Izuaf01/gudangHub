import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const skip = (page - 1) * limit;

  // QC page shows StockIn items in QC status
  const [items, total] = await Promise.all([
    prisma.stockIn.findMany({
      where: { status: "QC" },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        supplier: { select: { id: true, name: true } },
        qualityChecks: {
          include: { checkedBy: { select: { name: true } } },
          orderBy: { checkedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { receivedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.stockIn.count({ where: { status: "QC" } }),
  ]);

  return NextResponse.json({ data: items, total, page, limit });
}
