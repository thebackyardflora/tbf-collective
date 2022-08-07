/*
  Warnings:

  - You are about to drop the column `unitOfMeasure` on the `InventoryRecord` table. All the data in the column will be lost.
  - Added the required column `available` to the `InventoryRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceEach` to the `InventoryRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryRecord" DROP COLUMN "unitOfMeasure",
ADD COLUMN     "available" INTEGER NOT NULL,
ADD COLUMN     "priceEach" DECIMAL(13,3) NOT NULL;

-- DropEnum
DROP TYPE "UnitOfMeasure";

-- CreateTable
CREATE TABLE "OrderRequestItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketEventId" TEXT NOT NULL,
    "inventoryRecordId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderRequestItem_userId_marketEventId_inventoryRecordId_key" ON "OrderRequestItem"("userId", "marketEventId", "inventoryRecordId");

-- AddForeignKey
ALTER TABLE "OrderRequestItem" ADD CONSTRAINT "OrderRequestItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderRequestItem" ADD CONSTRAINT "OrderRequestItem_marketEventId_fkey" FOREIGN KEY ("marketEventId") REFERENCES "MarketEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderRequestItem" ADD CONSTRAINT "OrderRequestItem_inventoryRecordId_fkey" FOREIGN KEY ("inventoryRecordId") REFERENCES "InventoryRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
