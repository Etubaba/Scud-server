-- CreateEnum
CREATE TYPE "CarClass" AS ENUM ('premium', 'lite');

-- CreateTable
CREATE TABLE "driver_promo" (
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

    CONSTRAINT "driver_promo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_driver_promo" (
    "location_id" INTEGER NOT NULL,
    "driver_promo_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "location_driver_promo_pkey" PRIMARY KEY ("location_id","driver_promo_id")
);

-- AddForeignKey
ALTER TABLE "location_driver_promo" ADD CONSTRAINT "location_driver_promo_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_driver_promo" ADD CONSTRAINT "location_driver_promo_driver_promo_id_fkey" FOREIGN KEY ("driver_promo_id") REFERENCES "driver_promo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
