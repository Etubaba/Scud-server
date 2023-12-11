-- CreateTable
CREATE TABLE "account_managements" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "manager_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "account_managements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fares" (
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
    "apply_fares" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "fares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "night_fares" (
    "id" SERIAL NOT NULL,
    "fare_id" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "multiplier" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "night_fares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peak_fares" (
    "id" SERIAL NOT NULL,
    "fare_id" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "multiplier" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "peak_fares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_managements_user_id_key" ON "account_managements"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "night_fares_fare_id_key" ON "night_fares"("fare_id");

-- AddForeignKey
ALTER TABLE "account_managements" ADD CONSTRAINT "account_managements_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_managements" ADD CONSTRAINT "account_managements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "night_fares" ADD CONSTRAINT "night_fares_fare_id_fkey" FOREIGN KEY ("fare_id") REFERENCES "fares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peak_fares" ADD CONSTRAINT "peak_fares_fare_id_fkey" FOREIGN KEY ("fare_id") REFERENCES "fares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
