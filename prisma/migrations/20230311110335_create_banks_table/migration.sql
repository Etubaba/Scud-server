/*
  Warnings:

  - You are about to drop the column `bank_code` on the `bank_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `bank_accounts` table. All the data in the column will be lost.
  - Added the required column `bank_id` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bank_accounts" DROP COLUMN "bank_code",
DROP COLUMN "bank_name",
ADD COLUMN     "bank_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "banks" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country_id" INTEGER NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banks_code_key" ON "banks"("code");

-- CreateIndex
CREATE UNIQUE INDEX "banks_name_key" ON "banks"("name");

-- AddForeignKey
ALTER TABLE "banks" ADD CONSTRAINT "banks_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
