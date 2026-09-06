/*
  Warnings:

  - You are about to alter the column `riskScore` on the `ApprovalRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `netTotal` on the `ApprovalRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `marginAmount` on the `ApprovalRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `marginPercentage` on the `ApprovalRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `amount` on the `BillingLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `totalOneTimeAmount` on the `BillingSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `totalRecurringMonthly` on the `BillingSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `totalRecurringAnnual` on the `BillingSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `proposedDiscountPercent` on the `CounterOffer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `creditLimit` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `maxDiscountPercent` on the `DiscountPolicyRule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `minMarginPercent` on the `DiscountPolicyRule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `subtotal` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `totalDiscount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxableAmount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxAmount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `totalAmount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `listPrice` on the `InvoiceLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `unitPrice` on the `InvoiceLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `proposedDiscountPercent` on the `InvoiceLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `discountAmount` on the `InvoiceLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxRate` on the `InvoiceLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxAmount` on the `InvoiceLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxableAmount` on the `InvoiceLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `lineTotal` on the `InvoiceLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `unitPrice` on the `PriceListEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `listPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `standardCost` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `maxAllowedDiscount` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxRate` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `extraPrice` on the `ProductVariant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `subtotal` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `totalDiscount` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `netValue` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `grossMarginPercent` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `riskScore` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxAmount` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxableAmount` on the `Quotation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `listPrice` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `proposedDiscountPercent` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `discountAmount` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `netLinePrice` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `lineCost` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `lineMarginPercent` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxAmount` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxRate` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `unitPrice` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `promotionDiscountPercent` on the `RecommendationRule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "ApprovalRequest" ALTER COLUMN "riskScore" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "netTotal" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "marginAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "marginPercentage" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "BillingLine" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "BillingSchedule" ALTER COLUMN "totalOneTimeAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalRecurringMonthly" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalRecurringAnnual" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CounterOffer" ALTER COLUMN "proposedDiscountPercent" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "creditLimit" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "DiscountPolicyRule" ALTER COLUMN "maxDiscountPercent" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "minMarginPercent" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "subtotal" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalDiscount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxableAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "InvoiceLine" ALTER COLUMN "listPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "unitPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "proposedDiscountPercent" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "discountAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxRate" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxableAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lineTotal" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PriceListEntry" ALTER COLUMN "unitPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "listPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "standardCost" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "maxAllowedDiscount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxRate" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "extraPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Quotation" ALTER COLUMN "subtotal" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalDiscount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "netValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "grossMarginPercent" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "riskScore" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxableAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "QuoteLine" ALTER COLUMN "listPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "proposedDiscountPercent" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "discountAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "netLinePrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lineCost" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lineMarginPercent" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxRate" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "unitPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "RecommendationRule" ALTER COLUMN "promotionDiscountPercent" SET DATA TYPE DOUBLE PRECISION;
