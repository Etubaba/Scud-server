/*
  Warnings:

  - You are about to drop the column `car_types` on the `driver_promos` table. All the data in the column will be lost.
  - You are about to drop the column `vehicle_type` on the `fares` table. All the data in the column will be lost.
  - Added the required column `vehicle_type_id` to the `fares` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_type_id` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "driver_promos" DROP COLUMN "car_types";

-- AlterTable
ALTER TABLE "fares" DROP COLUMN "vehicle_type",
ADD COLUMN     "vehicle_type_id" INTEGER;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "vehicle_type_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "vehicle_type_driver_promos" (
    "vehicle_type_id" INTEGER NOT NULL,
    "driver_promo_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vehicle_type_driver_promos_pkey" PRIMARY KEY ("vehicle_type_id","driver_promo_id")
);

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fares" ADD CONSTRAINT "fares_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_type_driver_promos" ADD CONSTRAINT "vehicle_type_driver_promos_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_type_driver_promos" ADD CONSTRAINT "vehicle_type_driver_promos_driver_promo_id_fkey" FOREIGN KEY ("driver_promo_id") REFERENCES "driver_promos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
