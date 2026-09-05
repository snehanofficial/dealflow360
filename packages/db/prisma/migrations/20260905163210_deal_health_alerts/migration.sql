-- CreateTable
CREATE TABLE "DealAlert" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DealAlert_quotationId_idx" ON "DealAlert"("quotationId");

-- CreateIndex
CREATE INDEX "DealAlert_alertType_idx" ON "DealAlert"("alertType");

-- CreateIndex
CREATE INDEX "DealAlert_isResolved_idx" ON "DealAlert"("isResolved");

-- AddForeignKey
ALTER TABLE "DealAlert" ADD CONSTRAINT "DealAlert_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
