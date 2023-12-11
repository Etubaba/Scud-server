/*
  Warnings:

  - You are about to drop the column `receiver_id` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `sender_id` on the `transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference]` on the table `transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paid` to the `trip_fare` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CancellledBy" AS ENUM ('driver', 'rider');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionStatus" ADD VALUE 'declined';
ALTER TYPE "TransactionStatus" ADD VALUE 'abandoned';

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_sender_id_fkey";


-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "receiver_id",
DROP COLUMN "sender_id",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "trip_fare" ADD COLUMN "paid" BOOLEAN NOT NULL DEFAULT false,

ADD COLUMN     "transaction_id" INTEGER;

-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "cancel_reason_id" INTEGER,
ADD COLUMN     "cancelledBy" "CancellledBy";

-- CreateTable
-- CREATE TABLE "time_online" (
--     "id" SERIAL NOT NULL,
--     "user_id" INTEGER NOT NULL,
--     "online" TIMESTAMP(3) NOT NULL,
--     "offline" TIMESTAMP(3) NOT NULL,
--     "time" INTEGER NOT NULL,
--     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3),

--     CONSTRAINT "time_online_pkey" PRIMARY KEY ("id")
-- );

-- CreateIndex
CREATE UNIQUE INDEX "transaction_reference_key" ON "transaction"("reference");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_cancel_reason_id_fkey" FOREIGN KEY ("cancel_reason_id") REFERENCES "cancel_reasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_fare" ADD CONSTRAINT "trip_fare_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE "time_online" ADD CONSTRAINT "time_online_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
