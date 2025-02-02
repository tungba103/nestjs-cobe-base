/*
  Warnings:

  - A unique constraint covering the columns `[name,parent_phone]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,birth_date]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "customers_parent_phone_key";

-- CreateIndex
CREATE UNIQUE INDEX "customers_name_parent_phone_key" ON "customers"("name", "parent_phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_name_birth_date_key" ON "customers"("name", "birth_date");
