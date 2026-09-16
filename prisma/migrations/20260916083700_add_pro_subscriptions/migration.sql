CREATE TYPE "SubscriptionPlan" AS ENUM (
  'MONTHLY',
  'YEARLY'
);

CREATE TYPE "SubscriptionStatus" AS ENUM (
  'PENDING',
  'ACTIVE',
  'EXPIRED',
  'CANCELLED',
  'FAILED'
);

CREATE TYPE "PaymentStatus" AS ENUM (
  'PENDING',
  'SUCCESS',
  'FAILED',
  'REFUNDED'
);

CREATE TABLE "ProSubscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "plan" "SubscriptionPlan" NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'KES',
  "startedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "provider" TEXT,
  "providerReference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProSubscription_pkey"
    PRIMARY KEY ("id")
);

CREATE TABLE "ProPayment" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'KES',
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "provider" TEXT,
  "providerReference" TEXT,
  "checkoutReference" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProPayment_pkey"
    PRIMARY KEY ("id")
);

CREATE INDEX "ProSubscription_userId_idx"
ON "ProSubscription"("userId");

CREATE INDEX "ProSubscription_status_idx"
ON "ProSubscription"("status");

CREATE INDEX "ProSubscription_expiresAt_idx"
ON "ProSubscription"("expiresAt");

CREATE INDEX "ProPayment_userId_idx"
ON "ProPayment"("userId");

CREATE INDEX "ProPayment_subscriptionId_idx"
ON "ProPayment"("subscriptionId");

CREATE INDEX "ProPayment_providerReference_idx"
ON "ProPayment"("providerReference");

CREATE INDEX "ProPayment_checkoutReference_idx"
ON "ProPayment"("checkoutReference");

ALTER TABLE "ProSubscription"
ADD CONSTRAINT "ProSubscription_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "ProPayment"
ADD CONSTRAINT "ProPayment_subscriptionId_fkey"
FOREIGN KEY ("subscriptionId")
REFERENCES "ProSubscription"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "ProPayment"
ADD CONSTRAINT "ProPayment_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
