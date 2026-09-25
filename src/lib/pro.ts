import { prisma } from "@/lib/prisma";

export type ProPlan = "MONTHLY" | "YEARLY";

export type ProPricing = {
  currency: string;
  monthly: number;
  yearly: number;
  symbol: string;
  locale: string;
};

const PRICING_BY_CURRENCY: Record<string, Omit<ProPricing, "currency">> = {
  KES: { monthly: 199, yearly: 1999, symbol: "KSh", locale: "en-KE" },
  USD: { monthly: 2.99, yearly: 29.99, symbol: "$", locale: "en-US" },
  CAD: { monthly: 3.99, yearly: 39.99, symbol: "CA$", locale: "en-CA" },
  GBP: { monthly: 2.49, yearly: 24.99, symbol: "£", locale: "en-GB" },
  EUR: { monthly: 2.99, yearly: 29.99, symbol: "€", locale: "en-IE" },
  AUD: { monthly: 4.49, yearly: 44.99, symbol: "A$", locale: "en-AU" },
  NZD: { monthly: 4.99, yearly: 49.99, symbol: "NZ$", locale: "en-NZ" },
  INR: { monthly: 149, yearly: 1499, symbol: "₹", locale: "en-IN" },
  PKR: { monthly: 499, yearly: 4999, symbol: "Rs", locale: "en-PK" },
  BDT: { monthly: 199, yearly: 1999, symbol: "৳", locale: "bn-BD" },
  NGN: { monthly: 2500, yearly: 25000, symbol: "₦", locale: "en-NG" },
  GHS: { monthly: 25, yearly: 250, symbol: "GH₵", locale: "en-GH" },
  ZAR: { monthly: 45, yearly: 450, symbol: "R", locale: "en-ZA" },
  UGX: { monthly: 7000, yearly: 70000, symbol: "USh", locale: "en-UG" },
  TZS: { monthly: 4500, yearly: 45000, symbol: "TSh", locale: "sw-TZ" },
  RWF: { monthly: 1500, yearly: 15000, symbol: "RF", locale: "rw-RW" },
  ETB: { monthly: 450, yearly: 4500, symbol: "Br", locale: "am-ET" },
  EGP: { monthly: 149, yearly: 1499, symbol: "E£", locale: "en-EG" },
  MAD: { monthly: 29, yearly: 290, symbol: "MAD", locale: "fr-MA" },
  BRL: { monthly: 14.9, yearly: 149.9, symbol: "R$", locale: "pt-BR" },
  MXN: { monthly: 59, yearly: 590, symbol: "MX$", locale: "es-MX" },
  ARS: { monthly: 2999, yearly: 29990, symbol: "ARS", locale: "es-AR" },
  COP: { monthly: 11900, yearly: 119000, symbol: "COP", locale: "es-CO" },
  CLP: { monthly: 2490, yearly: 24900, symbol: "CLP", locale: "es-CL" },
  JPY: { monthly: 399, yearly: 3990, symbol: "¥", locale: "ja-JP" },
  CNY: { monthly: 19.9, yearly: 199, symbol: "¥", locale: "zh-CN" },
  KRW: { monthly: 3900, yearly: 39000, symbol: "₩", locale: "ko-KR" },
  MYR: { monthly: 9.9, yearly: 99, symbol: "RM", locale: "ms-MY" },
  IDR: { monthly: 49000, yearly: 490000, symbol: "Rp", locale: "id-ID" },
  PHP: { monthly: 169, yearly: 1690, symbol: "₱", locale: "en-PH" },
  THB: { monthly: 99, yearly: 990, symbol: "฿", locale: "th-TH" },
  VND: { monthly: 59000, yearly: 590000, symbol: "₫", locale: "vi-VN" },
  AED: { monthly: 11, yearly: 110, symbol: "AED", locale: "en-AE" },
  SAR: { monthly: 11, yearly: 110, symbol: "SAR", locale: "en-SA" },
  QAR: { monthly: 11, yearly: 110, symbol: "QAR", locale: "en-QA" },
  KWD: { monthly: 0.9, yearly: 9, symbol: "KWD", locale: "en-KW" },
  BHD: { monthly: 1.1, yearly: 11, symbol: "BHD", locale: "en-BH" },
  CHF: { monthly: 2.49, yearly: 24.99, symbol: "CHF", locale: "de-CH" },
  SEK: { monthly: 32, yearly: 320, symbol: "kr", locale: "sv-SE" },
  NOK: { monthly: 32, yearly: 320, symbol: "kr", locale: "nb-NO" },
  DKK: { monthly: 21, yearly: 210, symbol: "kr", locale: "da-DK" },
  PLN: { monthly: 12, yearly: 120, symbol: "zł", locale: "pl-PL" },
  CZK: { monthly: 69, yearly: 690, symbol: "Kč", locale: "cs-CZ" },
  HUF: { monthly: 1090, yearly: 10900, symbol: "Ft", locale: "hu-HU" },
  TRY: { monthly: 99, yearly: 990, symbol: "₺", locale: "tr-TR" },
  ILS: { monthly: 11, yearly: 110, symbol: "₪", locale: "he-IL" },
  UAH: { monthly: 129, yearly: 1290, symbol: "₴", locale: "uk-UA" },
};

const COUNTRY_CURRENCY: Record<string, string> = {
  KE:"KES",UG:"UGX",TZ:"TZS",RW:"RWF",BI:"BIF",ET:"ETB",MW:"MWK",ZM:"ZMW",ZW:"ZWL",ZA:"ZAR",NG:"NGN",GH:"GHS",EG:"EGP",MA:"MAD",
  US:"USD",CA:"CAD",GB:"GBP",IE:"EUR",AU:"AUD",NZ:"NZD",IN:"INR",PK:"PKR",BD:"BDT",BR:"BRL",MX:"MXN",AR:"ARS",CO:"COP",CL:"CLP",
  JP:"JPY",CN:"CNY",KR:"KRW",MY:"MYR",ID:"IDR",PH:"PHP",TH:"THB",VN:"VND",AE:"AED",SA:"SAR",QA:"QAR",KW:"KWD",BH:"BHD",
  CH:"CHF",SE:"SEK",NO:"NOK",DK:"DKK",PL:"PLN",CZ:"CZK",HU:"HUF",TR:"TRY",IL:"ILS",UA:"UAH",
  AT:"EUR",BE:"EUR",BG:"EUR",CY:"EUR",DE:"EUR",EE:"EUR",ES:"EUR",FI:"EUR",FR:"EUR",GR:"EUR",HR:"EUR",IT:"EUR",LT:"EUR",LU:"EUR",LV:"EUR",MT:"EUR",NL:"EUR",PT:"EUR",SI:"EUR",SK:"EUR",
  BJ:"XOF",BF:"XOF",CI:"XOF",GW:"XOF",ML:"XOF",NE:"XOF",SN:"XOF",TG:"XOF",CM:"XAF",CF:"XAF",CG:"XAF",GA:"XAF",GQ:"XAF",TD:"XAF",CD:"CDF",AO:"AOA",BW:"BWP",CV:"CVE",DJ:"DJF",DZ:"DZD",ER:"ERN",GM:"GMD",GN:"GNF",LR:"LRD",LS:"LSL",MG:"MGA",MR:"MRU",MU:"MUR",MZ:"MZN",NA:"NAD",SC:"SCR",SL:"SLE",SO:"SOS",SS:"SSP",SD:"SDG",SZ:"SZL",ST:"STN",TN:"TND",
  AF:"AFN",AM:"AMD",AZ:"AZN",GE:"GEL",IR:"IRR",IQ:"IQD",JO:"JOD",KZ:"KZT",KG:"KGS",LB:"LBP",MV:"MVR",MN:"MNT",NP:"NPR",OM:"OMR",LK:"LKR",TJ:"TJS",TM:"TMT",UZ:"UZS",YE:"YER",
  KH:"KHR",LA:"LAK",MM:"MMK",SG:"SGD",TW:"TWD",HK:"HKD",
  BD:"BDT",BT:"BTN",BN:"BND",FJ:"FJD",PG:"PGK",WS:"WST",TO:"TOP",VU:"VUV",
};

const DEFAULT_PRICING: ProPricing = {
  currency: "USD",
  monthly: 2.99,
  yearly: 29.99,
  symbol: "$",
  locale: "en-US",
};

export function getProPricing(countryCode?: string | null): ProPricing {
  const currency = COUNTRY_CURRENCY[(countryCode || "").toUpperCase()] || "USD";
  const base = PRICING_BY_CURRENCY[currency] || DEFAULT_PRICING;
  return { currency, ...base };
}

export function getProPrice(plan: ProPlan, countryCode?: string | null) {
  const pricing = getProPricing(countryCode);
  return plan === "MONTHLY" ? pricing.monthly : pricing.yearly;
}

export function getProDuration(plan: ProPlan) {
  return plan === "MONTHLY" ? 30 : 365;
}

export function getProDuration(plan: ProPlan) {
  if (plan === "MONTHLY") {
    return 30;
  }

  return 365;
}

export async function getActiveProSubscription(userId: string) {
  const subscription = await prisma.proSubscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      expiresAt: "desc",
    },
  });

  return subscription;
}

export const FREE_LISTING_LIMIT = 5;
export const PRO_LISTING_LIMIT = 50;

export const PRO_FEATURES = [
  { title: "50 active listings", description: "Publish up to 50 active items at once." },
  { title: "3 boost credits", description: "Boost listings each subscription period to reach more buyers." },
  { title: "2 featured credits", description: "Place selected listings in featured marketplace positions." },
  { title: "Seller analytics", description: "See views, likes, saves, shares, messages and order activity." },
  { title: "Advanced seller tools", description: "Manage more listings and promotional activity from one account." },
  { title: "Advanced discovery", description: "Use saved searches and richer marketplace discovery tools as they become available." },
  { title: "Multiple institution membership", description: "Add verified institution memberships without changing your primary institution." },
  { title: "Pro badge", description: "Show a Pro status badge on your Campus Mall account." },
  { title: "Priority support", description: "Receive priority handling for eligible Campus Mall support requests." },
] as const;

export async function isProUser(userId: string) {
  const subscription = await getActiveProSubscription(userId);
  return Boolean(subscription);
}

export async function getProListingLimit(userId: string) {
  const subscription = await getActiveProSubscription(userId);
  return subscription?.listingLimit ?? FREE_LISTING_LIMIT;
}
