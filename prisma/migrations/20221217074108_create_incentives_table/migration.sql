-- CreateTable
CREATE TABLE "incentives" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "rides" INTEGER NOT NULL,
    "reward" INTEGER NOT NULL,
    "previous_tier_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "incentives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "incentives_previous_tier_id_key" ON "incentives"("previous_tier_id");

-- AddForeignKey
ALTER TABLE "incentives" ADD CONSTRAINT "incentives_previous_tier_id_fkey" FOREIGN KEY ("previous_tier_id") REFERENCES "incentives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
