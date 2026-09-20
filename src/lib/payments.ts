import { prisma } from "@/lib/prisma";
import { initiateMpesaStk } from "@/lib/mpesa";
import type { Prisma } from "@prisma/client";

type PaymentMetadata = Prisma.InputJsonValue;

export type PaymentMethod =
  | "MPESA" | "AIRTEL_MONEY" | "CARD" | "BANK_TRANSFER" | "PESALINK"
  | "MOBILE_MONEY" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY" | "STRIPE"
  | "FLUTTERWAVE" | "PAYSTACK" | "CASH_ON_DELIVERY";

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

  if (paymentMethod === "CASH_ON_DELIVERY") {
    return { intent, configured: process.env.CASH_ON_DELIVERY_ENABLED === "true", stk:null, paymentMethod, checkoutUrl:null };
  }

  if (paymentMethod === "BANK_TRANSFER" || paymentMethod === "PESALINK") {
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

  if (paymentMethod === "PAYSTACK") {
    const key=process.env.PAYSTACK_SECRET_KEY;
    if (!key || !input.email) return { intent, configured:false, stk:null, paymentMethod, checkoutUrl:null };
    const response=await fetch("https://api.paystack.co/transaction/initialize",{
      method:"POST",
      headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        amount:String(Math.round(input.amount*100)),
        email:input.email,
        currency:process.env.PAYSTACK_CURRENCY || "KES",
        reference,
        callback_url:`${appUrl}/api/payments/callback/paystack?reference=${encodeURIComponent(reference)}`,
        channels:["card","bank","apple_pay","ussd","qr","mobile_money","bank_transfer","eft"],
        metadata:JSON.stringify(input.metadata ?? {})
      }),
      cache:"no-store"
    });
    const data=await response.json();
    if(!response.ok || !data?.status || !data?.data?.authorization_url) throw new Error(data?.message || "Paystack checkout could not be started.");
    const updated=await prisma.paymentIntent.update({where:{id:intent.id},data:{provider:"PAYSTACK",merchantRequestId:data.data.reference}});
    return {intent:updated,configured:true,stk:null,paymentMethod,checkoutUrl:data.data.authorization_url};
  }

  if (paymentMethod === "FLUTTERWAVE" || paymentMethod === "MOBILE_MONEY") {
    const key=process.env.FLW_SECRET_KEY;
    if (!key || !input.email) return { intent, configured:false, stk:null, paymentMethod, checkoutUrl:null };
    const response=await fetch("https://api.flutterwave.com/v3/payments",{
      method:"POST",
      headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        tx_ref:reference,
        amount:input.amount,
        currency:process.env.FLW_CURRENCY || "KES",
        redirect_url:`${appUrl}/api/payments/callback/flutterwave?reference=${encodeURIComponent(reference)}`,
        customer:{email:input.email,phonenumber:input.phone},
        customizations:{title:"Campus Mall"},
        payment_options:process.env.FLW_PAYMENT_OPTIONS || "card,mpesa,banktransfer,ussd",
        meta:input.metadata ?? {}
      }),
      cache:"no-store"
    });
    const data=await response.json();
    if(!response.ok || data?.status !== "success" || !data?.data?.link) throw new Error(data?.message || "Flutterwave checkout could not be started.");
    const updated=await prisma.paymentIntent.update({where:{id:intent.id},data:{provider:"FLUTTERWAVE",merchantRequestId:reference}});
    return {intent:updated,configured:true,stk:null,paymentMethod,checkoutUrl:data.data.link};
  }

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

  if (paymentMethod === "CARD" || paymentMethod === "APPLE_PAY" || paymentMethod === "GOOGLE_PAY" || paymentMethod === "STRIPE") {
    const key=process.env.STRIPE_SECRET_KEY;
    if (!key || !input.email) return { intent, configured:false, stk:null, paymentMethod, checkoutUrl:null };
    const params=new URLSearchParams();
    params.set("mode","payment");
    params.set("success_url",`${appUrl}/payment-success?reference=${encodeURIComponent(reference)}`);
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

  if (paymentMethod === "AIRTEL_MONEY") {
    const configured=Boolean(process.env.AIRTEL_MONEY_CLIENT_ID && process.env.AIRTEL_MONEY_CLIENT_SECRET && process.env.AIRTEL_MONEY_COUNTRY);
    return {intent,configured,stk:null,paymentMethod,checkoutUrl:null};
  }

  return {intent,configured:false,stk:null,paymentMethod,checkoutUrl:null};
}

export async function settleRevenue(input:{userId?:string;type:string;reference:string;gross:number;fee?:number;metadata?:PaymentMetadata}){
  const fee=input.fee||0;
  return prisma.revenueTransaction.upsert({
    where:{reference:input.reference},
    update:{status:"SETTLED",gross:input.gross,fee,net:input.gross-fee,metadata:input.metadata ?? undefined},
    create:{userId:input.userId,type:input.type,reference:input.reference,gross:input.gross,fee,net:input.gross-fee,status:"SETTLED",metadata:input.metadata}
  });
}
