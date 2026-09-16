import {
  PrismaClient,
  DigitalOrderType,
} from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    type: DigitalOrderType.DATA,
    network: "SAFARICOM",
    name: "Safaricom Data Bundle",
    providerCode: "REPLACE_SAFARICOM_DATA_CODE",
    description:
      "Configure the actual bundle supplied by your vending provider.",
    amount: 20,
  },

  {
    type: DigitalOrderType.DATA,
    network: "AIRTEL",
    name: "Airtel Data Bundle",
    providerCode: "REPLACE_AIRTEL_DATA_CODE",
    description:
      "Configure the actual bundle supplied by your vending provider.",
    amount: 20,
  },

  {
    type: DigitalOrderType.DATA,
    network: "TELKOM",
    name: "Telkom Data Bundle",
    providerCode: "REPLACE_TELKOM_DATA_CODE",
    description:
      "Configure the actual bundle supplied by your vending provider.",
    amount: 20,
  },

  {
    type: DigitalOrderType.DATA,
    network: "FAIBA",
    name: "Faiba Data Bundle",
    providerCode: "REPLACE_FAIBA_DATA_CODE",
    description:
      "Configure the actual bundle supplied by your vending provider.",
    amount: 20,
  },

  {
    type: DigitalOrderType.AIRTIME,
    network: "SAFARICOM",
    name: "Safaricom Airtime",
    providerCode: "REPLACE_SAFARICOM_AIRTIME_CODE",
    description:
      "Safaricom airtime.",
    amount: 20,
  },

  {
    type: DigitalOrderType.AIRTIME,
    network: "AIRTEL",
    name: "Airtel Airtime",
    providerCode: "REPLACE_AIRTEL_AIRTIME_CODE",
    description:
      "Airtel airtime.",
    amount: 20,
  },

  {
    type: DigitalOrderType.AIRTIME,
    network: "TELKOM",
    name: "Telkom Airtime",
    providerCode: "REPLACE_TELKOM_AIRTIME_CODE",
    description:
      "Telkom airtime.",
    amount: 20,
  },

  {
    type: DigitalOrderType.AIRTIME,
    network: "FAIBA",
    name: "Faiba Airtime",
    providerCode: "REPLACE_FAIBA_AIRTIME_CODE",
    description:
      "Faiba airtime.",
    amount: 20,
  },
];

async function main() {
  for (const product of products) {
    await prisma.digitalProduct.upsert({
      where: {
        id: `${product.network}-${product.type}-${product.providerCode}`,
      },

      update: {
        name: product.name,
        description: product.description,
        amount: product.amount,
        providerCode:
          product.providerCode,
        active: true,
      },

      create: {
        id: `${product.network}-${product.type}-${product.providerCode}`,
        type: product.type,
        network: product.network,
        name: product.name,
        providerCode:
          product.providerCode,
        description:
          product.description,
        amount: product.amount,
        active: true,
      },
    });
  }

  console.log(
    `Seeded ${products.length} digital products.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
