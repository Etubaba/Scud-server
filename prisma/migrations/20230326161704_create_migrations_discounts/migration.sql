-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('active', 'inactive', 'event', 'dangerzone', 'default');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "location_id" INTEGER;

-- CreateTable
CREATE TABLE "discounts" (
    "id" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "location_id" INTEGER NOT NULL,
    "type" "DiscountType" NOT NULL,
    "total" INTEGER,
    "percentage" INTEGER,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "no_of_trips" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discout_users" (
    "used" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "discount_id" INTEGER NOT NULL,

    CONSTRAINT "discout_users_pkey" PRIMARY KEY ("user_id","discount_id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discout_users" ADD CONSTRAINT "discout_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discout_users" ADD CONSTRAINT "discout_users_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
