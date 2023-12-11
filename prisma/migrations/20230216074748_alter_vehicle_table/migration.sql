/*
  Warnings:

  - Added the required column `manufacture_date` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "manufacture_date" TIMESTAMP(3);
