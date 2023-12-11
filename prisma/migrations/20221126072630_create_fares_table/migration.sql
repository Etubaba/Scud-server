-- CreateTable
CREATE TABLE "AccountManagement" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "manager_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "AccountManagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fare_settings" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "base_fare" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "minimum_fare" INTEGER NOT NULL,
    "per_minute" INTEGER NOT NULL,
    "per_kilometer" INTEGER NOT NULL,
    "waiting_time_limit" INTEGER NOT NULL,
    "waiting_charges" INTEGER NOT NULL,
    "apply_peak_fare" BOOLEAN NOT NULL DEFAULT false,
    "apply_night_fare" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "fare_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "night_fare" (
    "id" SERIAL NOT NULL,
    "fare_id" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "multiplier" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "night_fare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peak_fare" (
    "id" SERIAL NOT NULL,
    "fare_id" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "multiplier" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "peak_fare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountManagement_user_id_key" ON "AccountManagement"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "night_fare_fare_id_key" ON "night_fare"("fare_id");

-- AddForeignKey
ALTER TABLE "AccountManagement" ADD CONSTRAINT "AccountManagement_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountManagement" ADD CONSTRAINT "AccountManagement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "night_fare" ADD CONSTRAINT "night_fare_fare_id_fkey" FOREIGN KEY ("fare_id") REFERENCES "fare_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peak_fare" ADD CONSTRAINT "peak_fare_fare_id_fkey" FOREIGN KEY ("fare_id") REFERENCES "fare_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;