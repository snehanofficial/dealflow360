-- AlterTable
ALTER TABLE "CounterOffer" ADD COLUMN     "proposedByName" TEXT,
ADD COLUMN     "proposedByRole" TEXT DEFAULT 'CUSTOMER';
