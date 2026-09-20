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
  const intent=await prisma.paymentIntent.create({
    data:{
      userId:input.userId,
      purpose:input.purpose,
      reference,
      amount:input.amount,
      phone:input.phone,
      metadata:{
        ...(input.metadata && typeof input.metadata === "object" ? input.metadata : {}),
        paymentMethod: input.paymentMethod ?? "MPESA"
      } as PaymentMetadata
    }
  });
  const paymentMethod=input.paymentMethod ?? "MPESA";
  if (paymentMethod !== "MPESA") {
    const configured = paymentMethod === "CASH_ON_DELIVERY"
      ? process.env.CASH_ON_DELIVERY_ENABLED === "true"
      : paymentMethod === "BANK_TRANSFER" || paymentMethod === "PESALINK"
        ? Boolean(process.env.CAMPUS_MALL_BANK_NAME && process.env.CAMPUS_MALL_BANK_ACCOUNT)
        : paymentMethod === "CARD" || paymentMethod === "APPLE_PAY" || paymentMethod === "GOOGLE_PAY" || paymentMethod === "STRIPE"
          ? Boolean(process.env.STRIPE_SECRET_KEY)
          : paymentMethod === "PAYPAL"
            ? Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
            : paymentMethod === "FLUTTERWAVE" || paymentMethod === "MOBILE_MONEY"
              ? Boolean(process.env.FLW_SECRET_KEY)
              : paymentMethod === "PAYSTACK"
                ? Boolean(process.env.PAYSTACK_SECRET_KEY)
                : paymentMethod === "AIRTEL_MONEY"
                  ? Boolean(process.env.AIRTEL_MONEY_CLIENT_ID && process.env.AIRTEL_MONEY_CLIENT_SECRET)
                  : false;

    if (!configured) return { intent, configured: false, stk: null, paymentMethod, checkoutUrl: null };

    return {
      intent,
      configured: true,
      stk: null,
      paymentMethod,
      checkoutUrl: null,
      requiresProviderCheckout: true
    };
  }

  const configured=!!(process.env.MPESA_CONSUMER_KEY&&process.env.MPESA_CONSUMER_SECRET&&process.env.MPESA_SHORTCODE&&process.env.MPESA_PASSKEY&&process.env.MPESA_CALLBACK_URL);
  if(!configured)return{intent,configured:false,stk:null};
  const stk=await initiateMpesaStk({amount:input.amount,phone:input.phone,reference,description:input.purpose});
  const updated=await prisma.paymentIntent.update({
    where:{id:intent.id},
    data:{merchantRequestId:stk.MerchantRequestID,checkoutRequestId:stk.CheckoutRequestID}
  });
  return{intent:updated,configured:true,stk,paymentMethod,checkoutUrl:null};
}

export async function settleRevenue(input:{userId?:string;type:string;reference:string;gross:number;fee?:number;metadata?:PaymentMetadata}){
  const fee=input.fee||0;
  return prisma.revenueTransaction.upsert({
    where:{reference:input.reference},
    update:{status:"SETTLED",gross:input.gross,fee,net:input.gross-fee,metadata:input.metadata ?? undefined},
    create:{userId:input.userId,type:input.type,reference:input.reference,gross:input.gross,fee,net:input.gross-fee,status:"SETTLED",metadata:input.metadata}
  });
}
