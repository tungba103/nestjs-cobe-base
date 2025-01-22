/*
  Warnings:

  - The values [PROGRESSING] on the enum `VisitStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VisitStatus_new" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "visits" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "visits" ALTER COLUMN "status" TYPE "VisitStatus_new" USING ("status"::text::"VisitStatus_new");
ALTER TYPE "VisitStatus" RENAME TO "VisitStatus_old";
ALTER TYPE "VisitStatus_new" RENAME TO "VisitStatus";
DROP TYPE "VisitStatus_old";
ALTER TABLE "visits" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;
