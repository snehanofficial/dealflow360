/*
  Warnings:

  - You are about to alter the column `riskScore` on the `ApprovalRequest` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `netTotal` on the `ApprovalRequest` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `marginAmount` on the `ApprovalRequest` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `marginPercentage` on the `ApprovalRequest` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `BillingLine` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The `status` column on the `BillingLine` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `totalOneTimeAmount` on the `BillingSchedule` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalRecurringMonthly` on the `BillingSchedule` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalRecurringAnnual` on the `BillingSchedule` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The `status` column on the `BillingSchedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `proposedDiscountPercent` on the `CounterOffer` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The `status` column on the `CounterOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `creditLimit` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `maxDiscountPercent` on the `DiscountPolicyRule` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `minMarginPercent` on the `DiscountPolicyRule` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `unitPrice` on the `PriceListEntry` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `listPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `standardCost` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `maxAllowedDiscount` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `taxRate` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `extraPrice` on the `ProductVariant` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `subtotal` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalDiscount` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `netValue` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `grossMarginPercent` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `riskScore` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `listPrice` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `proposedDiscountPercent` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `discountAmount` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `netLinePrice` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `lineCost` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `lineMarginPercent` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `promotionDiscountPercent` on the `RecommendationRule` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('RECEIPT', 'RESERVATION', 'RESERVATION_RELEASE', 'SHIPMENT', 'RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateEnum
CREATE TYPE "BackorderStatus" AS ENUM ('BACKORDERED', 'PARTIALLY_REALLOCATED', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'VOID');

-- CreateEnum
CREATE TYPE "CounterOfferStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('RESERVED', 'ALLOCATED', 'SHIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingScheduleStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('COMPLETED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "ApprovalRequest" ALTER COLUMN "riskScore" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "netTotal" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "marginAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "marginPercentage" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "BillingLine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "status",
ADD COLUMN     "status" "BillingScheduleStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "BillingSchedule" ALTER COLUMN "totalOneTimeAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalRecurringMonthly" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalRecurringAnnual" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "status",
ADD COLUMN     "status" "BillingScheduleStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "CounterOffer" ALTER COLUMN "proposedDiscountPercent" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "status",
ADD COLUMN     "status" "CounterOfferStatus" NOT NULL DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "creditLimit" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "DiscountPolicyRule" ALTER COLUMN "maxDiscountPercent" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "minMarginPercent" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "FulfillmentAllocation" ADD COLUMN     "backorderedQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "explanation" JSONB,
ADD COLUMN     "overrideReason" TEXT,
ADD COLUMN     "status" "AllocationStatus" NOT NULL DEFAULT 'RESERVED';

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "onHandQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "productVariantId" TEXT;

-- AlterTable
ALTER TABLE "PriceListEntry" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "listPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "standardCost" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "maxAllowedDiscount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "extraPrice" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "taxableAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalDiscount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "netValue" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "grossMarginPercent" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "riskScore" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "QuoteLine" ADD COLUMN     "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "unitPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ALTER COLUMN "listPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "proposedDiscountPercent" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "netLinePrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "lineCost" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "lineMarginPercent" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "RecommendationRule" ALTER COLUMN "promotionDiscountPercent" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "Warehouse" ADD COLUMN     "description" TEXT,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productVariantId" TEXT,
    "movementType" "InventoryMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "onHandBefore" INTEGER NOT NULL DEFAULT 0,
    "onHandAfter" INTEGER NOT NULL DEFAULT 0,
    "reservedBefore" INTEGER NOT NULL DEFAULT 0,
    "reservedAfter" INTEGER NOT NULL DEFAULT 0,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "fulfillmentAllocationId" TEXT,
    "reason" TEXT,
    "actorId" TEXT,
    "actorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backorder" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "quoteLineId" TEXT NOT NULL,
    "fulfillmentAllocationId" TEXT,
    "productId" TEXT NOT NULL,
    "productVariantId" TEXT,
    "requestedQuantity" INTEGER NOT NULL,
    "allocatedQuantity" INTEGER NOT NULL DEFAULT 0,
    "backorderedQuantity" INTEGER NOT NULL,
    "status" "BackorderStatus" NOT NULL DEFAULT 'BACKORDERED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Backorder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerTier" "CustomerTier" NOT NULL DEFAULT 'SILVER',
    "customerRegion" TEXT NOT NULL DEFAULT 'US-East',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalDiscount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "listPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "proposedDiscountPercent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "configKey" TEXT NOT NULL,
    "configValue" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryMovement_warehouseId_idx" ON "InventoryMovement"("warehouseId");

-- CreateIndex
CREATE INDEX "InventoryMovement_productId_idx" ON "InventoryMovement"("productId");

-- CreateIndex
CREATE INDEX "InventoryMovement_createdAt_idx" ON "InventoryMovement"("createdAt");

-- CreateIndex
CREATE INDEX "InventoryMovement_movementType_idx" ON "InventoryMovement"("movementType");

-- CreateIndex
CREATE INDEX "Backorder_quotationId_idx" ON "Backorder"("quotationId");

-- CreateIndex
CREATE INDEX "Backorder_quoteLineId_idx" ON "Backorder"("quoteLineId");

-- CreateIndex
CREATE INDEX "Backorder_productId_idx" ON "Backorder"("productId");

-- CreateIndex
CREATE INDEX "Backorder_status_idx" ON "Backorder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_quotationId_key" ON "Invoice"("quotationId");

-- CreateIndex
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");

-- CreateIndex
CREATE INDEX "Invoice_quotationId_idx" ON "Invoice"("quotationId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "InvoiceLine_invoiceId_idx" ON "InvoiceLine"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceLine_productId_idx" ON "InvoiceLine"("productId");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_configKey_key" ON "SystemConfig"("configKey");

-- CreateIndex
CREATE INDEX "FulfillmentAllocation_status_idx" ON "FulfillmentAllocation"("status");

-- CreateIndex
CREATE INDEX "InventoryItem_productVariantId_idx" ON "InventoryItem"("productVariantId");

-- CreateIndex
CREATE INDEX "User_customerId_idx" ON "User"("customerId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_fulfillmentAllocationId_fkey" FOREIGN KEY ("fulfillmentAllocationId") REFERENCES "FulfillmentAllocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backorder" ADD CONSTRAINT "Backorder_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backorder" ADD CONSTRAINT "Backorder_quoteLineId_fkey" FOREIGN KEY ("quoteLineId") REFERENCES "QuoteLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backorder" ADD CONSTRAINT "Backorder_fulfillmentAllocationId_fkey" FOREIGN KEY ("fulfillmentAllocationId") REFERENCES "FulfillmentAllocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backorder" ADD CONSTRAINT "Backorder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backorder" ADD CONSTRAINT "Backorder_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
