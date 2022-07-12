/*
  Warnings:

  - A unique constraint covering the columns `[companyId,type]` on the table `SocialSite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SocialSite_companyId_type_key" ON "SocialSite"("companyId", "type");
