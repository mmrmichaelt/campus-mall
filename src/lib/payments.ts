import { prisma } from "@/lib/prisma";
import { initiateMpesaStk } from "@/lib/mpesa";
import type { Prisma } from "@prisma/client";

type PaymentMetadata = Prisma.InputJsonValue;

export type PaymentMethod =
  | "MPESA" | "CARD" | "BANK_TRANSFER"
  | "PAYPAL" | "GOOGLE_PAY";

export async function createPaymentIntent(input:{userId:string;purpose:string;amount:number;phone:string;email?:string;paymentMethod?:PaymentMethod;metadata?:PaymentMetadata}){
  const reference=`CM-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  const paymentMethod=input.paymentMethod ?? "MPESA";
  const intent=await prisma.paymentIntent.create({
    data:{
      userId:input.userId,
      purpose:input.purpose,
      reference,
      amount:input.amount,
      phone:input.phone,
      metadata:{
        ...(input.metadata && typeof input.metadata === "object" ? input.metadata : {}),
        paymentMethod
      } as PaymentMetadata
    }
  });

  if (paymentMethod === "BANK_TRANSFER") {
    const configured=Boolean(process.env.CAMPUS_MALL_BANK_NAME && process.env.CAMPUS_MALL_BANK_ACCOUNT);
    return {
      intent,
      configured,
      stk:null,
      paymentMethod,
      checkoutUrl:null,
      manualInstructions: configured ? {
        bankName: process.env.CAMPUS_MALL_BANK_NAME,
        accountName: process.env.CAMPUS_MALL_BANK_ACCOUNT_NAME || "Campus Mall",
        accountNumber: process.env.CAMPUS_MALL_BANK_ACCOUNT,
        branch: process.env.CAMPUS_MALL_BANK_BRANCH || ""
      } : null
    };
  }

  if (paymentMethod === "MPESA") {
    const configured=!!(process.env.MPESA_CONSUMER_KEY&&process.env.MPESA_CONSUMER_SECRET&&process.env.MPESA_SHORTCODE&&process.env.MPESA_PASSKEY&&process.env.MPESA_CALLBACK_URL);
    if(!configured)return{intent,configured:false,stk:null,paymentMethod,checkoutUrl:null};
    const stk=await initiateMpesaStk({amount:input.amount,phone:input.phone,reference,description:input.purpose});
    const updated=await prisma.paymentIntent.update({
      where:{id:intent.id},
      data:{merchantRequestId:stk.MerchantRequestID,checkoutRequestId:stk.CheckoutRequestID}
    });
    return{intent:updated,configured:true,stk,paymentMethod,checkoutUrl:null};
  }

  const appUrl = process.env.APP_URL || "";
  if (!appUrl) return { intent, configured:false, stk:null, paymentMethod, checkoutUrl:null };

  if (paymentMethod === "PAYPAL") {
    const clientId=process.env.PAYPAL_CLIENT_ID;
    const secret=process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !secret) return { intent, configured:false, stk:null, paymentMethod, checkoutUrl:null };
    const base=process.env.PAYPAL_ENVIRONMENT==="production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    const auth=Buffer.from(`${clientId}:${secret}`).toString("base64");
    const tokenResponse=await fetch(`${base}/v1/oauth2/token`,{method:"POST",headers:{Authorization:`Basic ${auth}`,"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials",cache:"no-store"});
    const token=await tokenResponse.json();
    if(!tokenResponse.ok || !token.access_token) throw new Error("Unable to authenticate with PayPal.");
    const response=await fetch(`${base}/v2/checkout/orders`,{
      method:"POST",
      headers:{Authorization:`Bearer ${token.access_token}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        intent:"CAPTURE",
        purchase_units:[{reference_id:reference,amount:{currency_code:process.env.PAYPAL_CURRENCY || "USD",value:input.amount.toFixed(2)}}],
        application_context:{return_url:`${appUrl}/api/payments/callback/paypal?reference=${encodeURIComponent(reference)}`,cancel_url:`${appUrl}/payment-cancelled`}
      }),
      cache:"no-store"
    });
    const data=await response.json();
    const approve=data?.links?.find((link:{rel?:string})=>link.rel==="approve")?.href;
    if(!response.ok || !data?.id || !approve) throw new Error("PayPal checkout could not be started.");
    const updated=await prisma.paymentIntent.update({where:{id:intent.id},data:{provider:"PAYPAL",merchantRequestId:data.id}});
    return {intent:updated,configured:true,stk:null,paymentMethod,checkoutUrl:approve};
  }

  if (paymentMethod === "CARD" || paymentMethod === "GOOGLE_PAY") {
    const key=process.env.STRIPE_SECRET_KEY;
    if (!key || !input.email) return { intent, configured:false, stk:null, paymentMethod, checkoutUrl:null };
    const params=new URLSearchParams();
    params.set("mode","payment");
    params.set("success_url",`${appUrl}/api/payments/callback/stripe?reference=${encodeURIComponent(reference)}&session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url",`${appUrl}/payment-cancelled?reference=${encodeURIComponent(reference)}`);
    params.set("customer_email",input.email);
    params.set("line_items[0][price_data][currency]",(process.env.STRIPE_CURRENCY || "kes").toLowerCase());
    params.set("line_items[0][price_data][product_data][name]",`Campus Mall ${input.purpose}`);
    params.set("line_items[0][price_data][unit_amount]",String(Math.round(input.amount*100)));
    params.set("line_items[0][quantity]","1");
    params.set("metadata[reference]",reference);
    params.set("metadata[paymentMethod]",paymentMethod);
    const response=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/x-www-form-urlencoded"},body:params.toString(),cache:"no-store"});
    const data=await response.json();
    if(!response.ok || !data?.url) throw new Error(data?.error?.message || "Stripe checkout could not be started.");
    const updated=await prisma.paymentIntent.update({where:{id:intent.id},data:{provider:"STRIPE",merchantRequestId:data.id}});
    return {intent:updated,configured:true,stk:null,paymentMethod,checkoutUrl:data.url};
  }


  return {intent,configured:false,stk:null,paymentMethod,checkoutUrl:null};
}

export async function finalizePaymentIntent(reference: string) {
  const intent = await prisma.paymentIntent.findUnique({ where: { reference } });
  if (!intent) return null;
  const metadata = (intent.metadata && typeof intent.metadata === "object" ? intent.metadata : {}) as Record<string, unknown>;
  if (intent.status !== "SUCCESS") return intent;

  const purpose = intent.purpose;
  if (purpose === "PROMOTION" && typeof metadata.promotionPurchaseId === "string" && typeof metadata.listingId === "string") {
    const purchase = await prisma.promotionPurchase.findUnique({ where: { id: metadata.promotionPurchaseId } });
    if (purchase && purchase.status !== "SUCCESS") {
      const days = Number(metadata.days || purchase.days || 7);
      const listing = await prisma.listing.findUnique({ where: { id: metadata.listingId } });
      if (listing) {
        const base = listing.promotedUntil && listing.promotedUntil > new Date() ? listing.promotedUntil : new Date();
        const until = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
        await prisma.$transaction([
          prisma.promotionPurchase.update({ where: { id: purchase.id }, data: { status: "SUCCESS" } }),
          prisma.listing.update({ where: { id: listing.id }, data: { promoted: true, promotedUntil: until } }),
          prisma.revenueTransaction.upsert({
            where: { reference: intent.reference },
            update: { status: "SETTLED" },
            create: { userId: intent.userId, type: "PROMOTION", reference: intent.reference, gross: purchase.amount, fee: 0, net: purchase.amount, status: "SETTLED", metadata: { listingId: listing.id, days } }
          })
        ]);
      }
    }
  }

  if (purpose === "PRO" && typeof metadata.subscriptionId === "string" && typeof metadata.proPaymentId === "string") {
    const subscription = await prisma.proSubscription.findUnique({ where: { id: metadata.subscriptionId } });
    const payment = await prisma.proPayment.findUnique({ where: { id: metadata.proPaymentId } });
    if (subscription && payment && payment.status !== "SUCCESS") {
      const startedAt = new Date();
      const expiresAt = new Date(startedAt);
      expiresAt.setMonth(expiresAt.getMonth() + (subscription.plan === "YEARLY" ? 12 : 1));
      await prisma.$transaction([
        prisma.proPayment.update({ where: { id: payment.id }, data: { status: "SUCCESS", providerReference: intent.reference, paidAt: startedAt } }),
        prisma.proSubscription.update({ where: { id: subscription.id }, data: { status: "ACTIVE", startedAt, expiresAt, provider: intent.provider, providerReference: intent.reference } }),
        prisma.revenueTransaction.upsert({
          where: { reference: intent.reference },
          update: { status: "SETTLED" },
          create: { userId: intent.userId, type: "PRO", reference: intent.reference, gross: subscription.amount, fee: 0, net: subscription.amount, status: "SETTLED" }
        })
      ]);
    }
  }

  if (purpose === "ORDER" && typeof metadata.orderId === "string") {
    const order = await prisma.order.findUnique({ where: { id: metadata.orderId } });
    if (order && order.status === "PENDING") {
      await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } }),
        prisma.revenueTransaction.upsert({
          where: { reference: intent.reference },
          update: { status: "SETTLED" },
          create: { userId: intent.userId, type: "ORDER", reference: intent.reference, gross: order.amount, fee: 0, net: order.amount, status: "SETTLED", metadata: { orderId: order.id } }
        })
      ]);
    }
  }

  if (purpose === "DIGITAL" && typeof metadata.digitalOrderId === "string") {
    const order = await prisma.digitalOrder.findUnique({ where: { id: metadata.digitalOrderId } });
    if (order && order.status === "PENDING_PAYMENT") {
      await prisma.digitalOrder.update({ where: { id: order.id }, data: { status: "PAYMENT_CONFIRMED", providerReference: intent.reference } });
    }
  }

  return intent;
}

export async function settleRevenue(input:{userId?:string;type:string;reference:string;gross:number;fee?:number;metadata?:PaymentMetadata}){
  const fee=input.fee||0;
  return prisma.revenueTransaction.upsert({
    where:{reference:input.reference},
    update:{status:"SETTLED",gross:input.gross,fee,net:input.gross-fee,metadata:input.metadata ?? undefined},
    create:{userId:input.userId,type:input.type,reference:input.reference,gross:input.gross,fee,net:input.gross-fee,status:"SETTLED",metadata:input.metadata}
  });
}
