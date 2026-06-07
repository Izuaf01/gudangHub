import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { qcSchema } from "@/lib/validations/qc";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ stockInId: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stockInId } = await params;
  const stockIn = await prisma.stockIn.findUnique({
    where: { id: stockInId },
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ stockInId: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stockInId } = await params;
  const stockIn = await prisma.stockIn.findUnique({ where: { id: stockInId } });

  if (!stockIn)
    return NextResponse.json(
      { error: "Data tidak ditemukan" },
      { status: 404 },
    );

  if (stockIn.status !== "QC") {
    return NextResponse.json(
      { error: "StockIn tidak dalam status QC" },
      { status: 400 },
    );
  }

  const body = await req.json();
  const parsed = qcSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { passedQty, rejectedQty, notes } = parsed.data;

  // Run QC + update status + update inventory in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const qc = await tx.qualityCheck.create({
      data: {
        stockInId,
        passedQty,
        rejectedQty,
        notes,
        checkedById: session.user?.id ?? "",
      },
    });

    // Move StockIn to PUTAWAY
    await tx.stockIn.update({
      where: { id: stockInId },
      data: { status: "PUTAWAY" },
    });

    // If passed qty > 0, update inventory and create stock movement
    if (passedQty > 0) {
      // Find default location (first available) or leave without location
      const defaultLocation = await tx.location.findFirst({
        where: { isActive: true },
        orderBy: { code: "asc" },
      });

      if (defaultLocation) {
        // Upsert inventory
        await tx.inventory.upsert({
          where: {
            productId_locationId: {
              productId: stockIn.productId,
              locationId: defaultLocation.id,
            },
          },
          create: {
            productId: stockIn.productId,
            locationId: defaultLocation.id,
            quantity: passedQty,
          },
          update: {
            quantity: { increment: passedQty },
          },
        });

        // Record stock movement
        await tx.stockMovement.create({
          data: {
            productId: stockIn.productId,
            toLocationId: defaultLocation.id,
            quantity: passedQty,
            type: "IN",
            notes: `QC dari penerimaan ${stockIn.invoiceNo ?? stockInId}`,
            movedById: session.user?.id ?? "",
          },
        });

        // Mark as DONE after putaway
        await tx.stockIn.update({
          where: { id: stockInId },
          data: { status: "DONE" },
        });
      }
    }

    return qc;
  });

  return NextResponse.json({ data: result }, { status: 201 });
}
