-- AlterTable
ALTER TABLE "bill_instances" ADD COLUMN     "referenceNumber" TEXT;

-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "policyNumber" TEXT,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "reminderDays" TEXT NOT NULL DEFAULT '30,7,1';
