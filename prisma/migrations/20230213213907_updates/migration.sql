/*
  Warnings:

  - Added the required column `expiry` to the `liscenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "liscenses" ADD COLUMN     "expiry" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "promo_users" (
    "promo_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "promo_users_pkey" PRIMARY KEY ("promo_id","user_id")
);

-- AddForeignKey
ALTER TABLE "promo_users" ADD CONSTRAINT "promo_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_users" ADD CONSTRAINT "promo_users_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
