/*
  Warnings:

  - You are about to drop the column `drival_arrival` on the `trips` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "trips" DROP COLUMN "drival_arrival",
ADD COLUMN     "driver_arrival" TIMESTAMP(3);
