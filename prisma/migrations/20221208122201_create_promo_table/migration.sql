-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('percentage', 'amount');

-- CreateTable
CREATE TABLE "Promo" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "expiry" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "payment_type" "PaymentType" NOT NULL DEFAULT 'amount',
    "description" TEXT,
    "number_of_rides" INTEGER,

    CONSTRAINT "Promo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promo_code_key" ON "Promo"("code");
