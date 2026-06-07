import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "";

  const tasks = await prisma.packingTask.findMany({
    where: { ...(status && { status }) },
    include: {
      order: {
        include: {
          store: { select: { name: true, city: true } },
          items: {
            include: {
              product: { select: { name: true, sku: true, unit: true } },
            },
          },
        },
      },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: tasks });
}
