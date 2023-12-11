-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'card');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('completed', 'cancelled', 'ongoing', 'unstarted');

-- CreateEnum
CREATE TYPE "RideRequestStatus" AS ENUM ('rejected', 'accepted');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('card', 'cash');

-- CreateTable
CREATE TABLE "trips" (
    "id" SERIAL NOT NULL,
    "status" "TripStatus" NOT NULL,
    "drival_arrival" TIMESTAMP(3),
    "rider_id" INTEGER NOT NULL,
    "driver_id" INTEGER NOT NULL,
    "pickup_coords" JSONB NOT NULL,
    "destination_coords" JSONB NOT NULL,
    "pickup" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "duration" INTEGER,
    "fare_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ride_requests" (
    "id" SERIAL NOT NULL,
    "status" "RideRequestStatus" NOT NULL DEFAULT 'rejected',
    "rider_id" INTEGER NOT NULL,
    "driver_id" INTEGER NOT NULL,
    "pickup_location_id" INTEGER NOT NULL,
    "destination" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ride_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_fare" (
    "id" SERIAL NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "base_fare" INTEGER NOT NULL,
    "admin_commission" INTEGER NOT NULL,
    "driver_commission" INTEGER NOT NULL,
    "payment_mode" "PaymentMode" NOT NULL,
    "total_fare" INTEGER NOT NULL,
    "owe_amount" INTEGER NOT NULL,
    "cash_colleted" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "trip_fare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trip_fare_trip_id_key" ON "trip_fare"("trip_id");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_fare_id_fkey" FOREIGN KEY ("fare_id") REFERENCES "fares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_requests" ADD CONSTRAINT "ride_requests_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_requests" ADD CONSTRAINT "ride_requests_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_requests" ADD CONSTRAINT "ride_requests_pickup_location_id_fkey" FOREIGN KEY ("pickup_location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_fare" ADD CONSTRAINT "trip_fare_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
