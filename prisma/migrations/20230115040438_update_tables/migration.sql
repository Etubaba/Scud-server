/*
  Warnings:

  - You are about to drop the `Promo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fare_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `night_fare` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `peak_fare` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "night_fare" DROP CONSTRAINT "night_fare_fare_id_fkey";

-- DropForeignKey
ALTER TABLE "peak_fare" DROP CONSTRAINT "peak_fare_fare_id_fkey";

-- AlterTable
ALTER TABLE "fares" ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "night_fares" ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "peak_fares" ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "Promo";

-- DropTable
DROP TABLE "fare_settings";

-- DropTable
DROP TABLE "night_fare";

-- DropTable
DROP TABLE "peak_fare";

-- CreateTable
CREATE TABLE "promos" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "city_id" INTEGER NOT NULL,
    "expiry" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "payment_type" "PaymentType" NOT NULL DEFAULT 'amount',
    "description" TEXT,
    "number_of_rides" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "promos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promos_code_key" ON "promos"("code");

-- AddForeignKey
ALTER TABLE "promos" ADD CONSTRAINT "promos_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
