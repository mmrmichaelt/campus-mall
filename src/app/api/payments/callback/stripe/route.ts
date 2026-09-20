import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url=new URL(request.url);
  const reference=url.searchParams.get("reference") || "";
  const sessionId=url.searchParams.get("session_id") || "";
  const intent=reference ? await prisma.paymentIntent.findUnique({where:{reference}}) : null;
  if(!intent || !sessionId) return NextResponse.redirect(new URL(`/payment-cancelled?reference=${encodeURIComponent(reference)}`,url.origin));
  const key=process.env.STRIPE_SECRET_KEY;
  if(!key) return NextResponse.redirect(new URL(`/payment-cancelled?reference=${encodeURIComponent(reference)}`,url.origin));
  const response=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,{headers:{Authorization:`Bearer ${key}`},cache:"no-store"});
  const data=await response.json();
  const success=response.ok && data?.payment_status==="paid" && data?.metadata?.reference===reference;
  await prisma.paymentIntent.update({where:{id:intent.id},data:{status:success?"SUCCESS":"FAILED",resultCode:success?0:1,resultDesc:data?.payment_status || null}});
  return NextResponse.redirect(new URL(success?`/payment-success?reference=${encodeURIComponent(reference)}`:`/payment-cancelled?reference=${encodeURIComponent(reference)}`,url.origin));
}
