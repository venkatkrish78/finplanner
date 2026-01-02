-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "linkedInvestmentId" TEXT,
ADD COLUMN     "linkedLoanId" TEXT;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_linkedInvestmentId_fkey" FOREIGN KEY ("linkedInvestmentId") REFERENCES "investments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_linkedLoanId_fkey" FOREIGN KEY ("linkedLoanId") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
