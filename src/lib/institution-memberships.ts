import { prisma } from "@/lib/prisma";
import { isProUser } from "@/lib/pro";

export const FREE_INSTITUTION_LIMIT = 2;
export const PRO_INSTITUTION_LIMIT = Number(process.env.PRO_MAX_INSTITUTIONS || 10);

export async function getInstitutionMembershipLimit(userId: string) {
  return (await isProUser(userId)) ? PRO_INSTITUTION_LIMIT : FREE_INSTITUTION_LIMIT;
}

export async function ensurePrimaryInstitutionMembership(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { country: true, university: true },
  });

  if (!user?.university?.trim()) return;

  await prisma.userInstitutionMembership.upsert({
    where: {
      userId_country_institution: {
        userId,
        country: user.country,
        institution: user.university.trim(),
      },
    },
    update: {},
    create: {
      userId,
      country: user.country,
      institution: user.university.trim(),
      type: "POSTING",
    },
  });
}
