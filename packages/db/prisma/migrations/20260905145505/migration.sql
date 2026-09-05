-- CreateTable
CREATE TABLE "DiscountPolicyRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "customerTier" "CustomerTier",
    "category" TEXT,
    "productId" TEXT,
    "maxDiscountPercent" DOUBLE PRECISION NOT NULL,
    "minMarginPercent" DOUBLE PRECISION,
    "requiredApprovalRole" "Role" NOT NULL DEFAULT 'SALES_MANAGER',
    "priority" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountPolicyRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscountPolicyRule_customerTier_idx" ON "DiscountPolicyRule"("customerTier");

-- CreateIndex
CREATE INDEX "DiscountPolicyRule_category_idx" ON "DiscountPolicyRule"("category");

-- CreateIndex
CREATE INDEX "DiscountPolicyRule_productId_idx" ON "DiscountPolicyRule"("productId");

-- CreateIndex
CREATE INDEX "DiscountPolicyRule_isActive_idx" ON "DiscountPolicyRule"("isActive");

-- AddForeignKey
ALTER TABLE "DiscountPolicyRule" ADD CONSTRAINT "DiscountPolicyRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
