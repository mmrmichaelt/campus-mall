# Campus Mall

Campus Mall is a university marketplace for students and outsiders.

## Campus Mall Pro

Campus Mall Pro is a paid membership layer separate from ordinary marketplace listing fees, featured listings, advertising and transaction fees.

### Pro pricing

- Monthly: KSh 199
- Yearly: KSh 1,999

### Pro pages

Plans:

/pro

Checkout:

/pro/checkout

Account management:

/account/pro

Settings:

/settings

### Pro API

Create checkout:

POST /api/pro/checkout

Check Pro status:

GET /api/pro/status

Cancel Pro:

POST /api/pro/cancel

### Payment safety

The checkout endpoint creates a PENDING payment.

It does not mark the user as paid.

A real payment provider must confirm the transaction through a secure server-side callback/webhook.

Only after payment verification should the application change:

ProPayment.status

from:

PENDING

to:

SUCCESS

and change:

ProSubscription.status

from:

PENDING

to:

ACTIVE

The subscription should also receive:

startedAt

expiresAt

providerReference

### Environment variables

DATABASE_URL

SESSION_SECRET

APP_URL

SUPPORT_EMAIL

PRO_MONTHLY_PRICE_KES

PRO_YEARLY_PRICE_KES

PAYMENT_PROVIDER

PAYMENT_API_KEY

PAYMENT_SECRET

PAYMENT_WEBHOOK_SECRET

### Prisma

After changing the Prisma schema:

npx prisma format

npx prisma generate

For local development:

npx prisma migrate dev --name add_pro_subscriptions

For production:

npx prisma migrate deploy

### Important

Do not expose payment API keys or payment secrets in browser/client components.

Payment verification must happen on the server.
