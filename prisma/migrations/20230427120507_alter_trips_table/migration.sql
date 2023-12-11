/*
  Warnings:

  - You are about to drop the column `cancel_reason_id` on the `trips` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "trips" DROP CONSTRAINT "trips_cancel_reason_id_fkey";

-- AlterTable
ALTER TABLE "trips" DROP COLUMN "cancel_reason_id",
ADD COLUMN     "cancel_reason" TEXT;
