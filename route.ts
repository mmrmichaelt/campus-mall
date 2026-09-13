import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function POST() {
  (await cookies()).delete("campus_mall_session");
  return NextResponse.json({ ok: true });
}
