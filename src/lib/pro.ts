import { prisma } from "@/lib/prisma";

export const PRO_PRICES = {
  MONTHLY: 199,
  YEARLY: 1999,
} as const;

export type ProPlan = keyof typeof PRO_PRICES;

export function getProPrice(plan: ProPlan) {
  return PRO_PRICES[plan];
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
