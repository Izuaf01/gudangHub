import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storeSchema } from "@/lib/validations/store";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where = search
    ? {
        isActive: true,
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { isActive: true };

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where,
      include: {
        _count: { select: { orders: true } },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.store.count({ where }),
  ]);

  return NextResponse.json({ data: stores, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = storeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const store = await prisma.store.create({ data: parsed.data });
  return NextResponse.json(store, { status: 201 });
}
