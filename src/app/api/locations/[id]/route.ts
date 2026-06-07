import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { locationSchema } from "@/lib/validations/location";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = locationSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const data = {
    ...parsed.data,
    ...(parsed.data.zone &&
      parsed.data.row &&
      parsed.data.shelf && {
        code: `${parsed.data.zone}-${parsed.data.row}-${parsed.data.shelf}`.toUpperCase(),
      }),
  };

  const location = await prisma.location.update({ where: { id }, data });
  return NextResponse.json({ data: location });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.location.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
