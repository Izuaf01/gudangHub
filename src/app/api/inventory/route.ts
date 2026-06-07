import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const skip = (page - 1) * limit;

  const productWhere = {
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(category && { category }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,
      include: {
        inventories: {
          include: { location: { select: { code: true, zone: true } } },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where: productWhere }),
  ]);

  return NextResponse.json({
    data: products.map((p) => ({
      ...p,
      totalStock: p.inventories.reduce((s, i) => s + i.quantity, 0),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
