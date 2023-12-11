/*
  Warnings:

  - You are about to drop the column `created_at` on the `support_categories` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `support_categories` table. All the data in the column will be lost.
  - You are about to drop the `driver_promo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `location_driver_promo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "location_driver_promo" DROP CONSTRAINT "location_driver_promo_driver_promo_id_fkey";

-- DropForeignKey
ALTER TABLE "location_driver_promo" DROP CONSTRAINT "location_driver_promo_location_id_fkey";

-- AlterTable
ALTER TABLE "support_categories" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- DropTable
DROP TABLE "driver_promo";

-- DropTable
DROP TABLE "location_driver_promo";

-- CreateTable
CREATE TABLE "driver_promos" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "car_types" "CarClass"[],
    "trips" INTEGER NOT NULL,
    "online_hours" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "acceptance_rate" INTEGER NOT NULL,
    "cancellation_rate" INTEGER NOT NULL,
    "driver_score" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "driver_promos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_driver_promos" (
    "location_id" INTEGER NOT NULL,
    "driver_promo_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "location_driver_promos_pkey" PRIMARY KEY ("location_id","driver_promo_id")
);

-- AddForeignKey
ALTER TABLE "location_driver_promos" ADD CONSTRAINT "location_driver_promos_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_driver_promos" ADD CONSTRAINT "location_driver_promos_driver_promo_id_fkey" FOREIGN KEY ("driver_promo_id") REFERENCES "driver_promos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
