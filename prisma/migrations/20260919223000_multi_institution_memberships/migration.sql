-- CreateEnum
CREATE TYPE "InstitutionMembershipType" AS ENUM ('POSTING', 'VISITING');

-- CreateTable
CREATE TABLE "UserInstitutionMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "type" "InstitutionMembershipType" NOT NULL DEFAULT 'POSTING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInstitutionMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInstitutionMembership_userId_country_institution_key" ON "UserInstitutionMembership"("userId", "country", "institution");

-- CreateIndex
CREATE INDEX "UserInstitutionMembership_userId_type_idx" ON "UserInstitutionMembership"("userId", "type");

-- CreateIndex
CREATE INDEX "UserInstitutionMembership_country_institution_idx" ON "UserInstitutionMembership"("country", "institution");

-- AddForeignKey
ALTER TABLE "UserInstitutionMembership" ADD CONSTRAINT "UserInstitutionMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
