-- Real account-linked likes, favourites, comments and share activity.

CREATE TABLE "ListingLike" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ListingLike_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ListingFavorite" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ListingFavorite_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ListingComment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ListingComment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Activity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "listingId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ListingLike_userId_listingId_key" ON "ListingLike"("userId","listingId");
CREATE INDEX "ListingLike_listingId_createdAt_idx" ON "ListingLike"("listingId","createdAt");
CREATE UNIQUE INDEX "ListingFavorite_userId_listingId_key" ON "ListingFavorite"("userId","listingId");
CREATE INDEX "ListingFavorite_listingId_createdAt_idx" ON "ListingFavorite"("listingId","createdAt");
CREATE INDEX "ListingComment_listingId_createdAt_idx" ON "ListingComment"("listingId","createdAt");
CREATE INDEX "ListingComment_userId_createdAt_idx" ON "ListingComment"("userId","createdAt");
CREATE INDEX "Activity_userId_createdAt_idx" ON "Activity"("userId","createdAt");
CREATE INDEX "Activity_listingId_createdAt_idx" ON "Activity"("listingId","createdAt");
CREATE INDEX "Activity_type_createdAt_idx" ON "Activity"("type","createdAt");

ALTER TABLE "ListingLike" ADD CONSTRAINT "ListingLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingLike" ADD CONSTRAINT "ListingLike_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingFavorite" ADD CONSTRAINT "ListingFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingFavorite" ADD CONSTRAINT "ListingFavorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingComment" ADD CONSTRAINT "ListingComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingComment" ADD CONSTRAINT "ListingComment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
