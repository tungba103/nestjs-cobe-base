-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PermissionNameType" ADD VALUE 'GET_CUSTOMER';
ALTER TYPE "PermissionNameType" ADD VALUE 'GET_CUSTOMERS';
ALTER TYPE "PermissionNameType" ADD VALUE 'CREATE_CUSTOMER';
ALTER TYPE "PermissionNameType" ADD VALUE 'UPDATE_CUSTOMER';
