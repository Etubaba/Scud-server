-- CreateTable
CREATE TABLE "vehicle_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "minimum_year" TIMESTAMP(3) NOT NULL,
    "maximum_year" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "vehicle_type_pkey" PRIMARY KEY ("id")
);
