import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  const user = await prisma.user.upsert({
    where: {
      email: "demo@campusmall.local",
    },
    update: {},
    create: {
      name: "Campus Mall Demo",
      country: "Kenya",
      university: "Kisii University",
      accountType: "STUDENT",
      phone: "+254700000000",
      email: "demo@campusmall.local",
      passwordHash,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  await prisma.listing.createMany({
    data: [
      {
        sellerId: user.id,
        title: "Scientific Calculator",
        description:
          "Good condition calculator for class work.",
        price: 1200,
        currency: "KES",
        category: "items",
        location: "Main campus",
        status: "ACTIVE",
      },
      {
        sellerId: user.id,
        title: "Hostel Chair",
        description:
          "Strong study chair, ready for collection.",
        price: 800,
        currency: "KES",
        category: "items",
        location: "Student hostels",
        status: "ACTIVE",
      },
      {
        sellerId: user.id,
        title: "Campus Lunch",
        description:
          "Affordable fresh lunch available for campus students.",
        price: 250,
        currency: "KES",
        category: "food",
        location: "Main campus",
        status: "ACTIVE",
      },
    ],
  });

  await prisma.userSetting.upsert({
    where: {
      userId: user.id,
    },
    update: {},
    create: {
      userId: user.id,
      emailAlerts: true,
      messageAlerts: true,
      marketing: false,
      publicProfile: true,
    },
  });

  console.log("Campus Mall seed completed successfully.");
  console.log(`Demo user: ${user.email}`);
}

main()
  .catch((error) => {
    console.error("Campus Mall seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
