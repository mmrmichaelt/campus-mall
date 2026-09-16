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

export async function isProUser(userId: string) {
  const subscription = await getActiveProSubscription(userId);

  return Boolean(subscription);
}
