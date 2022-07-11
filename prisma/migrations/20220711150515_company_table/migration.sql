/*
  Warnings:

  - Changed the type of `type` on the `Application` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- RenameEnum
ALTER TYPE "ApplicationType" RENAME TO "CompanyType";

-- CreateEnum
CREATE TYPE "SocialSiteType" AS ENUM ('FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEDIN', 'WEBSITE');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "type" "CompanyType" NOT NULL,
    "name" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "einTin" TEXT NOT NULL,
    "bio" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialSite" (
    "id" TEXT NOT NULL,
    "type" "SocialSiteType" NOT NULL,
    "url" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialSite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_ownerId_key" ON "Company"("ownerId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialSite" ADD CONSTRAINT "SocialSite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
