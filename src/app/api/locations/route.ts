import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { locationSchema } from "@/lib/validations/location";
import { z } from "zod";

const createLocationSchema = locationSchema.extend({
  code: z.string().optional(),
});

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const locations = await prisma.location.findMany({
    where: { isActive: true },
    include: { inventories: { select: { quantity: true } } },
    orderBy: [{ zone: "asc" }, { row: "asc" }, { shelf: "asc" }],
  });

  return NextResponse.json({
    data: locations.map((loc) => ({
      ...loc,
      usedCapacity: loc.inventories.reduce((s, i) => s + i.quantity, 0),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createLocationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const code =
    parsed.data.code ??
    `${parsed.data.zone}-${parsed.data.row}-${parsed.data.shelf}`.toUpperCase();

  const existing = await prisma.location.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json(
      { error: "Kode lokasi sudah digunakan" },
      { status: 409 },
    );
  }

  const location = await prisma.location.create({
    data: {
      code,
      zone: parsed.data.zone,
      row: parsed.data.row,
      shelf: parsed.data.shelf,
      capacity: parsed.data.capacity,
    },
  });

  return NextResponse.json({ data: location }, { status: 201 });
}
