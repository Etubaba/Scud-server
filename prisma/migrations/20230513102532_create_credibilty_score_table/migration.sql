-- CreateTable
CREATE TABLE "user_driver_promos" (
    "driver_id" INTEGER NOT NULL,
    "driver_promo_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_driver_promos_pkey" PRIMARY KEY ("driver_id","driver_promo_id")
);

-- CreateTable
CREATE TABLE "credibility_score" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "previous_score" INTEGER NOT NULL,
    "current_score" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "credibility_score_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_driver_promos" ADD CONSTRAINT "user_driver_promos_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_driver_promos" ADD CONSTRAINT "user_driver_promos_driver_promo_id_fkey" FOREIGN KEY ("driver_promo_id") REFERENCES "driver_promos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credibility_score" ADD CONSTRAINT "credibility_score_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
