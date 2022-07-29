-- CreateEnum
CREATE TYPE "InventoryListStatus" AS ENUM ('PENDING', 'APPROVED');

-- CreateEnum
CREATE TYPE "UnitOfMeasure" AS ENUM ('STEM', 'BUNCH');

-- CreateTable
CREATE TABLE "InventoryList" (
    "id" TEXT NOT NULL,
    "marketEventId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "InventoryListStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "InventoryList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryRecord" (
    "id" TEXT NOT NULL,
    "inventoryListId" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitOfMeasure" "UnitOfMeasure" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryList_marketEventId_companyId_key" ON "InventoryList"("marketEventId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryRecord_inventoryListId_catalogItemId_key" ON "InventoryRecord"("inventoryListId", "catalogItemId");

-- AddForeignKey
ALTER TABLE "CatalogItem" ADD CONSTRAINT "CatalogItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryList" ADD CONSTRAINT "InventoryList_marketEventId_fkey" FOREIGN KEY ("marketEventId") REFERENCES "MarketEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryList" ADD CONSTRAINT "InventoryList_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRecord" ADD CONSTRAINT "InventoryRecord_inventoryListId_fkey" FOREIGN KEY ("inventoryListId") REFERENCES "InventoryList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRecord" ADD CONSTRAINT "InventoryRecord_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
