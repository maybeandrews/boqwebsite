-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_projectId_fkey";

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "projectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
