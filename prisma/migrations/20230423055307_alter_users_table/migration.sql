-- AlterTable
ALTER TABLE "users" ADD COLUMN     "vehicle_type_id" INTEGER;

-- AlterTable
ALTER TABLE "vehicle_type" ALTER COLUMN "minimum_year" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "maximum_year" SET DATA TYPE TIMESTAMPTZ(3);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;
