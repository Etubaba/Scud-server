/*
  Warnings:

  - A unique constraint covering the columns `[trip_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "trip_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_trip_id_key" ON "reviews"("trip_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;
