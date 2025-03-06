-- CreateEnum
CREATE TYPE "PerformaStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Performa" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "status" "PerformaStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "validUntil" TIMESTAMP(3),
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Performa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformaItem" (
    "id" SERIAL NOT NULL,
    "performaId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "category" TEXT,

    CONSTRAINT "PerformaItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Performa" ADD CONSTRAINT "Performa_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performa" ADD CONSTRAINT "Performa_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformaItem" ADD CONSTRAINT "PerformaItem_performaId_fkey" FOREIGN KEY ("performaId") REFERENCES "Performa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
