-- CreateTable
CREATE TABLE "cancel_reasons" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "groups" TEXT[],
    "is_active" BOOLEAN NOT NULL,
    "deductible_score" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "cancel_reasons_pkey" PRIMARY KEY ("id")
);
