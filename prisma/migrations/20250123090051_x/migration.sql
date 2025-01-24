-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PermissionNameType" ADD VALUE 'GET_PRODUCT';
ALTER TYPE "PermissionNameType" ADD VALUE 'GET_PRODUCTS';
ALTER TYPE "PermissionNameType" ADD VALUE 'CREATE_PRODUCT';
ALTER TYPE "PermissionNameType" ADD VALUE 'UPDATE_PRODUCT';
ALTER TYPE "PermissionNameType" ADD VALUE 'GET_SERVICE';
ALTER TYPE "PermissionNameType" ADD VALUE 'GET_SERVICES';
ALTER TYPE "PermissionNameType" ADD VALUE 'CREATE_SERVICE';
ALTER TYPE "PermissionNameType" ADD VALUE 'UPDATE_SERVICE';
