-- AlterTable
ALTER TABLE "BOQItem" ADD COLUMN     "performaId" INTEGER;

-- AddForeignKey
ALTER TABLE "BOQItem" ADD CONSTRAINT "BOQItem_performaId_fkey" FOREIGN KEY ("performaId") REFERENCES "Performa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
