-- DropForeignKey
ALTER TABLE "MarketEvent" DROP CONSTRAINT "MarketEvent_addressId_fkey";

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "lastUpdatedById" TEXT,
    "basePrice" DECIMAL(13,3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CatalogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogItemTag" (
    "tagId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogTag_name_key" ON "CatalogTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogItemTag_tagId_itemId_key" ON "CatalogItemTag"("tagId", "itemId");

-- AddForeignKey
ALTER TABLE "MarketEvent" ADD CONSTRAINT "MarketEvent_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogItem" ADD CONSTRAINT "CatalogItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogItem" ADD CONSTRAINT "CatalogItem_lastUpdatedById_fkey" FOREIGN KEY ("lastUpdatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogItemTag" ADD CONSTRAINT "CatalogItemTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "CatalogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogItemTag" ADD CONSTRAINT "CatalogItemTag_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
