/*
  Warnings:

  - Added the required column `category` to the `BOQ` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BOQ" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT;
