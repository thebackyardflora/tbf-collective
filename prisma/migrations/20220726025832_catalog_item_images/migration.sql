/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `CatalogItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CatalogItem" DROP COLUMN "imageUrl",
ADD COLUMN     "thumbnail" TEXT;

-- CreateTable
CREATE TABLE "CatalogItemImage" (
    "id" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogItemImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CatalogItemImage" ADD CONSTRAINT "CatalogItemImage_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
