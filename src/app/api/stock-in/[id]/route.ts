import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StockInStatus } from "@prisma/client";

const STATUS_TRANSITIONS: Record<StockInStatus, StockInStatus[]> = {
  PENDING: ["RECEIVING"],
  RECEIVING: ["QC"],
  QC: ["PUTAWAY"],
  PUTAWAY: ["DONE"],
  DONE: [],
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const stockIn = await prisma.stockIn.findUnique({
    where: { id },
    include: {
      product: true,
      supplier: true,
      qualityChecks: {
        include: { checkedBy: { select: { name: true } } },
        orderBy: { checkedAt: "desc" },
      },
    },
  });

  if (!stockIn)
    return NextResponse.json(
      { error: "Data tidak ditemukan" },
      { status: 404 },
    );

  return NextResponse.json({ data: stockIn });
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
  const { status, notes } = body as { status?: StockInStatus; notes?: string };

  const stockIn = await prisma.stockIn.findUnique({ where: { id } });
  if (!stockIn)
    return NextResponse.json(
      { error: "Data tidak ditemukan" },
      { status: 404 },
    );

  if (status) {
    const allowed = STATUS_TRANSITIONS[stockIn.status];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        {
          error: `Tidak bisa mengubah status dari ${stockIn.status} ke ${status}`,
        },
        { status: 400 },
      );
    }
  }

  const updated = await prisma.stockIn.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
    },
    include: {
      product: { select: { name: true, sku: true } },
      supplier: { select: { name: true } },
    },
  });

  return NextResponse.json({ data: updated });
}
