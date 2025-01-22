/*
  Warnings:

  - Added the required column `creator_name` to the `visits` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "creator_name" TEXT NOT NULL;
