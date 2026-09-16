import {
  PrismaClient,
  DigitalProductType,
} from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  // DATA
  {
    name: "Safaricom Data 100MB",
    description: "Safaricom mobile data bundle.",
    type: DigitalProductType.DATA,
    category: "DATA",
    provider: "Safaricom",
    price: 20,
  },
  {
    name: "Safaricom Data 500MB",
    description: "Safaricom mobile data bundle.",
    type: DigitalProductType.DATA,
    category: "DATA",
    provider: "Safaricom",
    price: 50,
  },
  {
    name: "Safaricom Data 1GB",
    description: "Safaricom mobile data bundle.",
    type: DigitalProductType.DATA,
    category: "DATA",
    provider: "Safaricom",
    price: 99,
  },
  {
    name: "Airtel Data 100MB",
    description: "Airtel mobile data bundle.",
    type: DigitalProductType.DATA,
    category: "DATA",
    provider: "Airtel",
    price: 20,
  },
  {
    name: "Airtel Data 500MB",
    description: "Airtel mobile data bundle.",
    type: DigitalProductType.DATA,
    category: "DATA",
    provider: "Airtel",
    price: 50,
  },
  {
    name: "Airtel Data 1GB",
    description: "Airtel mobile data bundle.",
    type: DigitalProductType.DATA,
    category: "DATA",
    provider: "Airtel",
    price: 99,
  },

  // AIRTIME
  {
    name: "Safaricom Airtime KSh 20",
    description: "Safaricom airtime.",
    type: DigitalProductType.AIRTIME,
    category: "AIRTIME",
    provider: "Safaricom",
    price: 20,
  },
  {
    name: "Safaricom Airtime KSh 50",
    description: "Safaricom airtime.",
    type: DigitalProductType.AIRTIME,
    category: "AIRTIME",
    provider: "Safaricom",
    price: 50,
  },
  {
    name: "Safaricom Airtime KSh 100",
    description: "Safaricom airtime.",
    type: DigitalProductType.AIRTIME,
    category: "AIRTIME",
    provider: "Safaricom",
    price: 100,
  },
  {
    name: "Airtel Airtime KSh 20",
    description: "Airtel airtime.",
    type: DigitalProductType.AIRTIME,
    category: "AIRTIME",
    provider: "Airtel",
    price: 20,
  },
  {
    name: "Airtel Airtime KSh 50",
    description: "Airtel airtime.",
    type: DigitalProductType.AIRTIME,
    category: "AIRTIME",
    provider: "Airtel",
    price: 50,
  },
  {
    name: "Airtel Airtime KSh 100",
    description: "Airtel airtime.",
    type: DigitalProductType.AIRTIME,
    category: "AIRTIME",
    provider: "Airtel",
    price: 100,
  },
];

async function main() {
  console.log("Seeding Campus Mall digital products...");

  for (const product of products) {
    await prisma.digitalProduct.upsert({
      where: {
        id: `${product.provider}-${product.name}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      },
      update: {
        name: product.name,
        description: product.description,
        type: product.type,
        category: product.category,
        provider: product.provider,
        price: product.price,
        active: true,
      },
      create: {
        id: `${product.provider}-${product.name}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
        name: product.name,
        description: product.description,
        type: product.type,
        category: product.category,
        provider: product.provider,
        price: product.price,
        active: true,
      },
    });
  }

  console.log(
    `Successfully seeded ${products.length} digital products.`
  );
}

main()
  .catch((error) => {
    console.error("DIGITAL_PRODUCT_SEED_ERROR", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
