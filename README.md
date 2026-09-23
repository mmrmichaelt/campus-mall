# Campus Mall

Campus Mall is a production-oriented campus marketplace built with Next.js, Prisma PostgreSQL and Vercel.

## Production feature set

- Account registration and password login
- Optional email and phone contact details; contact verification is not required
- User profiles and profile pictures
- Marketplace listings with categories, descriptions, prices, currencies, images and locations
- Search across titles, descriptions, categories and locations
- Full marketplace filtering: category, minimum/maximum price, newest/oldest, price low/high, title A-Z/Z-A, location, seller type, country and university
- Individual listing/product pages
- Cart / trolley
- Buyer and seller messaging tied to listings
- Likes, favourites, comments and sharing
- Orders and seller/buyer order management
- Payment infrastructure with M-Pesa and additional provider callbacks
- Listing promotion / boosting and advertising
- Campus Mall Pro subscriptions
- Business subscriptions
- Data and airtime digital products
- Notifications
- Multi-institution memberships
- Privacy Policy and Terms of Service
- Responsive mobile and desktop interface
- PWA/mobile packaging support through Capacitor
- Admin dashboard with marketplace statistics and listing moderation
- Revenue reporting and affiliate-revenue tooling
- Health endpoint for deployment monitoring

## Admin access

Set ADMIN_EMAILS in Vercel as a comma-separated list of administrator email addresses.

Example: ADMIN_EMAILS=admin@example.com

Administrators can open /admin. The dashboard provides user/listing/order/revenue totals and listing moderation controls. Keep administrator accounts protected with strong passwords and never expose admin credentials in client-side code.

## Environment

At minimum, production requires DATABASE_URL, SESSION_SECRET, APP_URL, SUPPORT_EMAIL and ADMIN_EMAILS. Add payment-provider variables only for payment methods you actually enable. Google OAuth and messaging providers are optional integrations and are not required for the core marketplace.

## Local development

1. Install Node.js 20+.
2. Copy .env.example to .env.
3. Set DATABASE_URL and a strong random SESSION_SECRET.
4. Run npm install.
5. Run npx prisma generate and npx prisma db push.
6. Run npm run dev.

## Vercel

The build command runs Prisma generation and the Next.js production build through scripts/build.mjs. After changing environment variables, redeploy the affected Vercel environment.

## Payments

The application contains payment infrastructure and callbacks, but a payment provider is only truly live when its credentials, callback/webhook configuration and merchant account are configured correctly. The application must never claim a payment succeeded merely because a checkout request was created.

## Security before commercial launch

- Use a long random SESSION_SECRET.
- Keep all secret API keys server-side.
- Use HTTPS in production.
- Configure rate limiting for authentication, messaging and payment endpoints.
- Use trusted image storage rather than arbitrary remote image URLs.
- Configure database backups and monitoring.
- Configure payment callbacks/webhooks with provider-recommended signature validation.
- Protect administrator accounts and the ADMIN_EMAILS configuration.
