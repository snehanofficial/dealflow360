-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('ONE_TIME', 'RECURRING');

-- CreateEnum
CREATE TYPE "RecurringPeriod" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'PENDING_MANAGER', 'PENDING_FINANCE', 'APPROVED', 'NEGOTIATING', 'FULFILLMENT', 'BILLING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RecommendationRuleType" AS ENUM ('CO_PURCHASE', 'PROMOTION', 'CROSS_SELL', 'UPSELL');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "accountManager" TEXT,
ADD COLUMN     "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 50000,
ADD COLUMN     "region" TEXT NOT NULL DEFAULT 'US-East';

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "listPrice" DOUBLE PRECISION NOT NULL,
    "standardCost" DOUBLE PRECISION NOT NULL,
    "billingType" "BillingType" NOT NULL DEFAULT 'ONE_TIME',
    "recurringPeriod" "RecurringPeriod",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossMarginPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteLine" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "listPrice" DOUBLE PRECISION NOT NULL,
    "proposedDiscountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netLinePrice" DOUBLE PRECISION NOT NULL,
    "lineCost" DOUBLE PRECISION NOT NULL,
    "lineMarginPercent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationRule" (
    "id" TEXT NOT NULL,
    "sourceProductId" TEXT,
    "recommendedProductId" TEXT NOT NULL,
    "ruleType" "RecommendationRuleType" NOT NULL DEFAULT 'CO_PURCHASE',
    "reasonTemplate" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 10,
    "promotionDiscountPercent" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_quoteNumber_key" ON "Quotation"("quoteNumber");

-- CreateIndex
CREATE INDEX "QuoteLine_quotationId_idx" ON "QuoteLine"("quotationId");

-- CreateIndex
CREATE INDEX "QuoteLine_productId_idx" ON "QuoteLine"("productId");

-- CreateIndex
CREATE INDEX "RecommendationRule_sourceProductId_idx" ON "RecommendationRule"("sourceProductId");

-- CreateIndex
CREATE INDEX "RecommendationRule_recommendedProductId_idx" ON "RecommendationRule"("recommendedProductId");

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLine" ADD CONSTRAINT "QuoteLine_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLine" ADD CONSTRAINT "QuoteLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationRule" ADD CONSTRAINT "RecommendationRule_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationRule" ADD CONSTRAINT "RecommendationRule_recommendedProductId_fkey" FOREIGN KEY ("recommendedProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
