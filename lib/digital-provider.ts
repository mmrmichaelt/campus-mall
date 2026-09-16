import crypto from "node:crypto";

export type DigitalPurchase = {
  orderId: string;
  phone: string;
  network: string;
  type: "AIRTIME" | "DATA";
  amount: number;
  providerCode?: string;
};

export type DigitalPurchaseResult = {
  accepted: boolean;
  reference?: string;
  message?: string;
};

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

/**
 * Server-side adapter for the actual digital vending provider.
 *
 * NEVER put provider credentials in client-side code.
 *
 * Expected provider request:
 *
 * {
 *   orderId,
 *   phone,
 *   network,
 *   type,
 *   amount,
 *   providerCode
 * }
 *
 * Expected response:
 *
 * {
 *   accepted: boolean,
 *   reference?: string,
 *   message?: string
 * }
 */
export async function vendDigitalProduct(
  purchase: DigitalPurchase,
): Promise<DigitalPurchaseResult> {
  const provider = process.env.DIGITAL_PROVIDER || "custom";

  if (provider !== "custom") {
    throw new Error(`Unsupported DIGITAL_PROVIDER: ${provider}`);
  }

  const url = required("DIGITAL_PROVIDER_PURCHASE_URL");
  const secret = required("DIGITAL_PROVIDER_SECRET");

  const body = JSON.stringify(purchase);

  const signature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "content-type": "application/json",
      "x-campus-mall-signature": signature,
      authorization: `Bearer ${secret}`,
    },

    body,

    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : `Provider request failed with status ${response.status}`,
    );
  }

  return {
    accepted: Boolean(data?.accepted),

    reference:
      typeof data?.reference === "string"
        ? data.reference
        : undefined,

    message:
      typeof data?.message === "string"
        ? data.message
        : undefined,
  };
}
