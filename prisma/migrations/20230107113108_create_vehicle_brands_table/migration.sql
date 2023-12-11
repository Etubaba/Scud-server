/*
  Warnings:

  - You are about to drop the column `brand` on the `vehicles` table. All the data in the column will be lost.
  - Added the required column `vehicle_brand_id` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "brand",
ADD COLUMN     "vehicle_brand_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "vehicle_brands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "vehicle_brands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_brands_name_key" ON "vehicle_brands"("name");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vehicle_brand_id_fkey" FOREIGN KEY ("vehicle_brand_id") REFERENCES "vehicle_brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
