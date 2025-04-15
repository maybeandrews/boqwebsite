-- DropForeignKey
ALTER TABLE "BOQ" DROP CONSTRAINT "BOQ_projectId_fkey";

-- DropForeignKey
ALTER TABLE "BOQ" DROP CONSTRAINT "BOQ_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "BOQItem" DROP CONSTRAINT "BOQItem_boqId_fkey";

-- DropForeignKey
ALTER TABLE "Performa" DROP CONSTRAINT "Performa_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Performa" DROP CONSTRAINT "Performa_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "VendorProject" DROP CONSTRAINT "VendorProject_projectId_fkey";

-- DropForeignKey
ALTER TABLE "VendorProject" DROP CONSTRAINT "VendorProject_vendorId_fkey";

-- AddForeignKey
ALTER TABLE "VendorProject" ADD CONSTRAINT "VendorProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProject" ADD CONSTRAINT "VendorProject_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOQ" ADD CONSTRAINT "BOQ_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOQ" ADD CONSTRAINT "BOQ_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOQItem" ADD CONSTRAINT "BOQItem_boqId_fkey" FOREIGN KEY ("boqId") REFERENCES "BOQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performa" ADD CONSTRAINT "Performa_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performa" ADD CONSTRAINT "Performa_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
