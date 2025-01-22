/*
  Warnings:

  - Made the column `creator_id` on table `visits` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('NEW', 'PROGRESSING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "status" "VisitStatus" NOT NULL DEFAULT 'NEW',
ALTER COLUMN "creator_id" SET NOT NULL,
ALTER COLUMN "total_amount" DROP NOT NULL;
