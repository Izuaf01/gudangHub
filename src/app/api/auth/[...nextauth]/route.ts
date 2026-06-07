import { handlers } from "@/lib/auth";
import type { NextRequest } from "next/server";

type Ctx = { params: Promise<{ nextauth: string[] }> };

export function GET(req: NextRequest, ctx: Ctx) {
  return (handlers.GET as (req: NextRequest, ctx: Ctx) => Promise<Response>)(
    req,
    ctx,
  );
}

export function POST(req: NextRequest, ctx: Ctx) {
  return (handlers.POST as (req: NextRequest, ctx: Ctx) => Promise<Response>)(
    req,
    ctx,
  );
}
