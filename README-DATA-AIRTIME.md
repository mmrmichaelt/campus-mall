# Campus Mall — Data & Airtime

This module adds a digital-products revenue channel to Campus Mall.

## Customer flow

Customer
↓
Campus Mall
↓
Choose Data or Airtime
↓
Choose network
↓
Choose product
↓
Enter phone number
↓
Create pending order
↓
Verified payment
↓
Vending provider
↓
Mobile network
↓
Delivery confirmation
↓
Order SUCCESS


## Revenue tracking

Every order stores:

customerAmount
providerCost
margin

The intended gross vending margin is:

customerAmount - providerCost


## Security

Provider credentials must stay on the server.

Never put these values inside:

- React components
- browser JavaScript
- NEXT_PUBLIC_ variables
- GitHub source code
- URLs visible to customers

Use Vercel Environment Variables.


## Database

The DigitalProduct and DigitalOrder models must be added to the existing:

prisma/schema.prisma

Do not create a second schema.


## Migration

After adding the models:

npx prisma format

Then, during development:

npx prisma migrate dev --name add_digital_airtime

For production, use the project's normal Prisma deployment migration process.


## Product catalog

Only create products that the contracted vending provider actually supports.

Do not advertise a network or bundle simply because the frontend contains its name.


## Payment

A customer's browser must never be trusted to tell Campus Mall that payment succeeded.

The intended sequence is:

1. Create PENDING_PAYMENT order.
2. Initiate the payment.
3. Receive the payment provider callback.
4. Verify the callback.
5. Mark order as PAID/PROCESSING.
6. Request vending.
7. Receive vending result.
8. Mark SUCCESS or FAILED.
9. Store provider reference.


## Important

The vending provider adapter is intentionally generic.

Before production:

DIGITAL_PROVIDER_PURCHASE_URL

DIGITAL_PROVIDER_SECRET

DIGITAL_PROVIDER_WEBHOOK_SECRET

must be replaced with credentials and endpoints supplied by the actual contracted provider.

The exact provider API contract must be implemented in:

lib/digital-provider.ts


## Supported network configuration

The application can represent:

SAFARICOM
AIRTEL
TELKOM
FAIBA

but the actual available products depend on the vending provider.


## Support

Campus Mall support:

campusmall.support@gmail.com
