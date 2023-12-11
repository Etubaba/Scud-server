/*
  Warnings:

  - You are about to drop the column `location` on the `fares` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[location_id]` on the table `fares` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `location_id` to the `fares` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fares" DROP COLUMN "location",
ADD COLUMN     "location_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "fares_location_id_key" ON "fares"("location_id");

-- AddForeignKey
ALTER TABLE "fares" ADD CONSTRAINT "fares_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
