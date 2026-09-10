# Campus Mall

A student-first campus marketplace built with Next.js App Router.

## Included
- 3-second welcome screen: “Welcome to Campus Mall”
- “Your space. Your identity. Your future.”
- Automatic transition to “Join Campus Mall” (no Continue button)
- Country selector with flags and an extensible country list
- Kenyan university/college starter list informed by CUE's published accreditation data
- Local account creation for a functional prototype
- Search and category discovery
- Create marketplace listings
- Seller dashboard and “Mark sold” action
- Sold listings expire immediately from the active marketplace
- Responsive mobile/desktop UI
- PWA manifest and favicon
- No fake external payment, identity, or verification claims

## Important production notes
This version is intentionally self-contained and uses browser localStorage so it runs immediately after installation without a database. Before public production launch, replace localStorage authentication/listings with a server-side database and secure authentication, add server-side validation, image storage, moderation, reporting, audit logs, rate limiting, email verification, and legally required privacy/consumer controls.

Kenyan institutional names should be synchronized with the latest CUE approved-universities list before production launch because accreditation lists can change.

## Run
```bash
npm install
npm run dev
```
Then open http://localhost:3000.

For production build:
```bash
npm run build
npm start
```
