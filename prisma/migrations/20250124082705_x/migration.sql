/*
  Warnings:

  - Added the required column `product_name` to the `prescription_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_name` to the `service_usage_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "prescription_items" ADD COLUMN     "product_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "prescriptions" ADD COLUMN     "total_discount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "service_usage_items" ADD COLUMN     "service_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "service_usages" ADD COLUMN     "total_discount" DOUBLE PRECISION;
