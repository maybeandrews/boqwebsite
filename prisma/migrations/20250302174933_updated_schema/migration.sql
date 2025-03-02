/*
  Warnings:

  - You are about to drop the column `category` on the `BOQ` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `BOQ` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `BOQ` table. All the data in the column will be lost.
  - You are about to drop the column `quotes` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `vendors` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Vendor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - Made the column `username` on table `Vendor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_projectId_fkey";

-- AlterTable
ALTER TABLE "BOQ" DROP COLUMN "category",
DROP COLUMN "notes",
DROP COLUMN "uploadDate",
ADD COLUMN     "roughEstimate" DECIMAL(10,2),
ADD COLUMN     "vendorId" INTEGER;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "quotes",
DROP COLUMN "tags",
DROP COLUMN "vendors";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "projectId",
DROP COLUMN "tags",
ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL;

-- CreateTable
CREATE TABLE "VendorProject" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "VendorProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "value" DECIMAL(10,2),

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorProject_vendorId_projectId_key" ON "VendorProject"("vendorId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_username_key" ON "Vendor"("username");

-- AddForeignKey
ALTER TABLE "VendorProject" ADD CONSTRAINT "VendorProject_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProject" ADD CONSTRAINT "VendorProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOQ" ADD CONSTRAINT "BOQ_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
