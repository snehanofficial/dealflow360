-- CreateTable
CREATE TABLE "BillingSchedule" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "totalOneTimeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRecurringMonthly" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRecurringAnnual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billingStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingLine" (
    "id" TEXT NOT NULL,
    "billingScheduleId" TEXT NOT NULL,
    "quoteLineId" TEXT,
    "productName" TEXT NOT NULL,
    "billingType" "BillingType" NOT NULL DEFAULT 'ONE_TIME',
    "recurringPeriod" "RecurringPeriod",
    "billingDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "proratedDays" INTEGER,
    "isProrated" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingSchedule_quotationId_key" ON "BillingSchedule"("quotationId");

-- CreateIndex
CREATE INDEX "BillingLine_billingScheduleId_idx" ON "BillingLine"("billingScheduleId");

-- AddForeignKey
ALTER TABLE "BillingSchedule" ADD CONSTRAINT "BillingSchedule_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingLine" ADD CONSTRAINT "BillingLine_billingScheduleId_fkey" FOREIGN KEY ("billingScheduleId") REFERENCES "BillingSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
