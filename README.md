# Campus Mall — Renewed Project

This version rebuilds the handwritten Campus Mall plan into a real Next.js + Prisma PostgreSQL application.

## What is included

- Welcome/splash screen route (`/welcome`) with the requested 3-second automatic transition.
- Create account flow:
  - Student / Outsider
  - Country selector with flags
  - University / College
  - Email + phone
  - Secure password hashing
  - Session cookie login
- Marketplace filtered to the user's selected university.
- Categories from the sketch:
  Accommodation, Beauty & dressing, Electronics, Food, Furniture, Jobs, Printing & photography, Stationery, Utensils.
- Search bar above the marketplace and global header.
- Filtering by price, condition, seller verification and date can be expanded from the API; category/condition/price query parameters are supported.
- Add item with title, description, condition, category, brand, picture URL, price, location and availability.
- Seller ownership protection.
- **Mark Sold:** seller-only API changes the listing to SOLD and immediately removes it from active marketplace results and the trolley.
- Trolley/cart with totals.
- Orders and seller/buyer status flow.
- Notifications.
- Messaging API and chat page.
- Profile management.
- Change university.
- Promotion endpoint (payment-provider hook left explicit rather than pretending payment is complete).
- Prisma PostgreSQL schema.
- Support email: `campusmallsupport@gmail.com`.
- Responsive web UI suitable for Android WebView/PWA wrapping later.
- Demo seed data.

## Important architecture decision

The sketch says the marketplace should show items around the selected university and should not let a user post into a different university page. This implementation enforces that by tying listings to the seller's current account university and only returning active listings whose seller belongs to the current user's university.

When the seller marks an item **Sold**, it is no longer returned by `/api/listings` and is removed from all carts immediately.

## Run locally

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Put your Prisma Postgres connection string in `DATABASE_URL`.
4. Set a strong random `SESSION_SECRET`.
5. Install packages:

   npm install

6. Generate/push the database:

   npx prisma generate
   npx prisma db push

7. Optional demo data:

   npm run seed

   Demo login:
   - email: `demo@campusmall.local`
   - password: `ChangeMe123!`

   Change this password before any real deployment.

8. Start:

   npm run dev

## Vercel deployment

- Import the repository into Vercel.
- Add `DATABASE_URL`, `SESSION_SECRET`, `APP_URL`, and `SUPPORT_EMAIL`.
- If using Google OAuth later, add the Google variables too.
- Build command is already configured through `npm run build`, which runs `prisma generate && next build`.
- Use Prisma Postgres or another PostgreSQL provider.

## Google OAuth

The environment variables are prepared, but this renewed version deliberately keeps native email/password authentication as the reliable core. Add Google OAuth routes after the Google Cloud consent screen/client are configured. The redirect URI should be:

`https://YOUR-DOMAIN/api/auth/google/callback`

Do not place client secrets in browser code.

## Payments

Orders currently create an order with a payment method label and notify the seller. The promotion endpoint also records a promotion window. A real payment gateway should be connected before charging users; the project does not fake successful payments.

## Android / desktop

The responsive web app is designed so it can later be packaged as an Android app (for example, through a WebView/Trusted Web Activity or a native client using the same API). The API and database remain the source of truth.

## Security checklist before production

- Set a long random `SESSION_SECRET`.
- Use HTTPS.
- Add rate limiting to auth and messaging.
- Add CSRF protection where needed for your final deployment model.
- Add image storage (Vercel Blob/S3/Cloudinary) instead of trusting arbitrary image URLs.
- Add email/phone verification.
- Add moderation/reporting.
- Add real payment gateway integration.
- Add database backups and monitoring.
